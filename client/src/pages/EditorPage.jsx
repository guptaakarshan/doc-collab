import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import EditorView from '../components/Editor/EditorPage'
import { useAuth } from '../context/AuthContext'
import useCollabEditor from '../hooks/useCollabEditor'
import api from '../api/axios'

export default function EditorPage() {
	const { documentId } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const isNewDocument = documentId === 'new'
	const [title, setTitle] = useState('Untitled Document')
	const [role, setRole] = useState('owner')
	const [collaborators, setCollaborators] = useState([])
	const [initialDelta, setInitialDelta] = useState({ ops: [{ insert: '\n' }] })
	const [loading, setLoading] = useState(true)
	const [shareEmail, setShareEmail] = useState('')
	const [shareRole, setShareRole] = useState('viewer')
	const [shareLoading, setShareLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const saveTimerRef = useRef(null)

	const {
		value,
		presence,
		socketError,
		handleEditorChange,
		setValue,
		canEdit,
		permissionChange,
		setPermissionChange,
		titleChange,
		setTitleChange,
		documentDeleted,
		setDocumentDeleted,
	} = useCollabEditor({
		documentId,
		initialDelta,
		role,
		user,
	})

	const mapCollaborators = useCallback((document) => {
		const ownerEntry = document.owner
			? {
				key: `owner-${document.owner._id || document.owner.id || 'unknown'}`,
				name: document.owner.name || document.owner.email || 'Owner',
				email: document.owner.email || '',
				role: 'owner',
			}
			: null

		const collaboratorEntries = (document.collaborators || []).map((entry) => {
			const collaboratorUser = entry.user || {}
			const identifier = collaboratorUser._id || collaboratorUser.id || collaboratorUser.toString?.() || Math.random()

			return {
				key: `collab-${identifier}`,
				name: collaboratorUser.name || collaboratorUser.email || 'Collaborator',
				email: collaboratorUser.email || '',
				role: entry.role,
			}
		})

		const dedupedByEmail = new Map()
		for (const person of ownerEntry ? [ownerEntry, ...collaboratorEntries] : collaboratorEntries) {
			const dedupeKey = person.email || person.key
			if (!dedupedByEmail.has(dedupeKey)) {
				dedupedByEmail.set(dedupeKey, person)
			}
		}

		return Array.from(dedupedByEmail.values())
	}, [])

	const loadDocument = useCallback(async () => {
		if (isNewDocument) {
			setTitle('Untitled Document')
			setRole('owner')
			setCollaborators([])
			setInitialDelta({ ops: [{ insert: '\n' }] })
			setValue({ ops: [{ insert: '\n' }] })
			return
		}

		const { data } = await api.get(`/documents/${documentId}`)
		setTitle(data.document.title)
		setRole(data.document.role)
		setCollaborators(mapCollaborators(data.document))
		setInitialDelta(data.document.contentDelta || { ops: [{ insert: '\n' }] })
		setValue(data.document.contentDelta || { ops: [{ insert: '\n' }] })
	}, [documentId, isNewDocument, mapCollaborators, setValue])

	useEffect(() => {
		// Editing requires a concrete document id in the URL.
		if (!documentId) {
			navigate('/', { replace: true })
			return
		}

		async function fetchDocument() {
			try {
				setLoading(true)
				await loadDocument()
			} catch (requestError) {
				toast.error(requestError?.response?.data?.message || 'Failed to load document')
			} finally {
				setLoading(false)
			}
		}

		fetchDocument()
	}, [documentId, isNewDocument, loadDocument, navigate])

	const mergedError = useMemo(() => socketError, [socketError])

	const persistDocumentSnapshot = (nextDelta, nextHtml) => {
		if (!documentId || !canEdit) return

		// Debounced REST save complements socket autosave and supports reconnect safety.
		if (saveTimerRef.current) {
			clearTimeout(saveTimerRef.current)
		}

		saveTimerRef.current = setTimeout(async () => {
			try {
				await api.patch(`/documents/${documentId}`, {
					contentDelta: nextDelta,
					contentHtml: nextHtml,
				})
			} catch {
				// Silent retry behavior via next edit/autosave cycle.
			}
		}, 2000)
	}

	const handleChange = (content, delta, source, editor) => {
		handleEditorChange(content, delta, source, editor)
		if (source === 'user') {
			persistDocumentSnapshot(editor.getContents(), editor.getHTML())
		}
	}

	const handleTitleBlur = async () => {
		if (!documentId || !canEdit || isNewDocument) return
		try {
			await api.patch(`/documents/${documentId}`, { title })
			toast.success('Title saved')
		} catch {
			// Keep local title value; next successful save will persist it.
			toast.error('Failed to save title')
		}
	}

	const handleManualSave = async () => {
		if (!documentId || !canEdit) return

		try {
			setIsSaving(true)
			if (isNewDocument) {
				const confirmResult = await Swal.fire({
					title: 'Create this document?',
					text: 'The document will be created and then you can share it with collaborators.',
					icon: 'question',
					showCancelButton: true,
					confirmButtonText: 'Create & Save',
					cancelButtonText: 'Cancel',
					confirmButtonColor: '#0f172a',
					cancelButtonColor: '#e2e8f0',
				})

				if (!confirmResult.isConfirmed) {
					return
				}

				const { data } = await api.post('/documents', {
					title,
				})
				await api.patch(`/documents/${data.document.id}`, {
					contentDelta: value,
				})
				navigate(`/editor/${data.document.id}`, { replace: true })
				toast.success('Document created and saved successfully')
				return
			}

			await api.patch(`/documents/${documentId}`, {
				title,
				contentDelta: value,
			})
			toast.success('Document saved successfully')
		} catch (requestError) {
			toast.error(requestError?.response?.data?.message || 'Failed to save document')
		} finally {
			setIsSaving(false)
		}
	}

	const handleShareSubmit = async (event) => {
		event.preventDefault()
		if (role !== 'owner' || isNewDocument) return

		try {
			const confirmResult = await Swal.fire({
				title: 'Update access?',
				text: `Share with ${shareEmail} as ${shareRole}?`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel',
				confirmButtonColor: '#0f172a',
				cancelButtonColor: '#e2e8f0',
			})

			if (!confirmResult.isConfirmed) return

			setShareLoading(true)

			await api.post(`/documents/${documentId}/share`, {
				email: shareEmail,
				role: shareRole,
			})

			setShareEmail('')

			// Refresh collaborators so owner can verify access immediately.
			await loadDocument()
			toast.success('Access updated successfully')
		} catch (requestError) {
			toast.error(requestError?.response?.data?.message || 'Failed to share document')
		} finally {
			setShareLoading(false)
		}
	}

	useEffect(() => {
		if (!permissionChange) return

		setRole(permissionChange.newRole)
		toast(`Your permission changed from ${permissionChange.oldRole} to ${permissionChange.newRole}.`, {
			icon: 'ℹ️',
		})
		setPermissionChange(null)
	}, [permissionChange, setPermissionChange])

	useEffect(() => {
		if (!titleChange) return

		setTitle(titleChange.title)
		if (titleChange.changedBy !== user?.id) {
			toast('Document title updated by a collaborator', { icon: 'ℹ️' })
		}

		setTitleChange(null)
	}, [setTitleChange, titleChange, user?.id])

	useEffect(() => {
		if (!documentDeleted) return

		if (documentDeleted.deletedBy !== user?.id) {
			toast.error(`"${documentDeleted.title || 'Document'}" was deleted by the owner.`)
		}

		setDocumentDeleted(null)
		navigate('/', { replace: true })
	}, [documentDeleted, navigate, setDocumentDeleted, user?.id])

	const handleBackToDocuments = () => {
		navigate('/', { replace: true })
	}

	if (loading) {
		return <p className="mx-auto mt-10 max-w-4xl px-4 text-sm text-slate-500">Loading document...</p>
	}

	return (
		<EditorView
			title={title}
			onTitleChange={setTitle}
			onTitleBlur={handleTitleBlur}
			onManualSave={handleManualSave}
			onBackToDocuments={handleBackToDocuments}
			isSaving={isSaving}
			role={role}
			collaborators={collaborators}
			presence={presence}
			value={value}
			onChange={handleChange}
			readOnly={!canEdit}
			error={mergedError}
			canShare={role === 'owner' && !isNewDocument}
			isDraft={isNewDocument}
			shareEmail={shareEmail}
			onShareEmailChange={setShareEmail}
			shareRole={shareRole}
			onShareRoleChange={setShareRole}
			onShareSubmit={handleShareSubmit}
			shareLoading={shareLoading}
		/>
	)
}
