import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

import EditorView from '../components/Editor/EditorPage'
import Toolbar from '../components/Editor/Toolbar'
import { useAuth } from '../context/useAuth'
import api from '../api/axios'

import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default function EditorPage() {
	const { documentId } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()

	const isNewDocument = documentId === 'new'

	const [title, setTitle] = useState('Untitled Document')
	const [role, setRole] = useState('owner')
	const [collaborators, setCollaborators] = useState([])
	const [presence, setPresence] = useState([])
	const [loading, setLoading] = useState(true)

	const [shareEmail, setShareEmail] = useState('')
	const [shareRole, setShareRole] = useState('viewer')
	const [shareLoading, setShareLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const editorRef = useRef(null)
	const ydocRef = useRef(null)
	const providerRef = useRef(null)
	const quillRef = useRef(null)
	const bindingRef = useRef(null)
	const draftRoomRef = useRef(`new-${Date.now()}-${Math.random().toString(36).slice(2)}`)

	/* ------------------ INIT YJS ------------------ */
	useEffect(() => {
		if (!documentId) return
		const editorElement = editorRef.current

		let isMounted = true
		let removeAwarenessListener = () => {}

		async function init() {
			let handleAwarenessChange = null
			let provider = null
			const rolePriority = { owner: 3, editor: 2, viewer: 1 }

			try {
				setLoading(true)

				if (!editorElement) {
					return
				}

				const ydoc = new Y.Doc()

				let docData = null

				// ✅ ONLY fetch if NOT new document
				if (!isNewDocument) {
					const res = await api.get(`/documents/${documentId}`)
					const { document, contentYjs } = res.data

					docData = document

					// metadata
					setTitle(document.title)
					setRole(document.role)
					setCollaborators(
						(document.collaborators || []).map((entry) => ({
							key: entry?.user?._id || entry?.user || `${entry?.email || 'collab'}-${entry?.role || 'viewer'}`,
							name: entry?.user?.name || entry?.user?.email || 'Collaborator',
							role: entry?.role || 'viewer',
						})),
					)

					// apply saved Yjs state
					if (contentYjs) {
						const update = new Uint8Array(contentYjs)
						Y.applyUpdate(ydoc, update)
					}
				} else {
					// 🆕 new doc defaults
					setTitle('Untitled Document')
					setRole('owner')
					setCollaborators([])
				}

				const roomName = isNewDocument ? draftRoomRef.current : documentId
				provider = new WebsocketProvider('ws://localhost:1234', roomName, ydoc)

				const yText = ydoc.getText('quill')

				editorElement.innerHTML = ''

				const quill = new Quill(editorElement, {
					theme: 'snow',
					modules: {
						toolbar: '#collab-toolbar',
						history: {
							delay: 1000,
							maxStack: 100,
							userOnly: true,
						},
					},
				})

				const binding = new QuillBinding(yText, quill, provider.awareness)

				provider.awareness.setLocalStateField('user', {
					id: user?.id || user?._id || user?.email,
					email: user?.email,
					name: user?.name || 'User',
					role: isNewDocument ? 'owner' : docData?.role || 'viewer',
					color: '#6366f1',
				})

				handleAwarenessChange = () => {
					const uniqueParticipants = new Map()

					for (const [clientId, state] of provider.awareness.getStates().entries()) {
						const userState = state?.user || {}
						const roleValue = userState.role || 'viewer'
						const identity =
							userState.id || userState.email || userState.name || `client-${clientId}`

						const nextParticipant = {
							socketId: String(identity),
							name: userState.name || userState.email || 'User',
							role: roleValue,
						}

						const existingParticipant = uniqueParticipants.get(identity)

						if (!existingParticipant) {
							uniqueParticipants.set(identity, nextParticipant)
							continue
						}

						const existingPriority = rolePriority[existingParticipant.role] || 0
						const nextPriority = rolePriority[nextParticipant.role] || 0

						if (nextPriority > existingPriority) {
							uniqueParticipants.set(identity, nextParticipant)
						}
					}

					setPresence(Array.from(uniqueParticipants.values()))
				}

				provider.awareness.on('change', handleAwarenessChange)
				handleAwarenessChange()

				if (!isMounted) return

				ydocRef.current = ydoc
				providerRef.current = provider
				quillRef.current = quill
				bindingRef.current = binding

				// ✅ permissions
				const canEdit =
					isNewDocument ||
					docData?.role === 'owner' ||
					docData?.role === 'editor'

				quill.enable(canEdit)

			} catch (err) {
				console.error(err)
				toast.error('Failed to load document')
			} finally {
				setLoading(false)
			}

			if (handleAwarenessChange) {
				removeAwarenessListener = () => {
					provider.awareness.off('change', handleAwarenessChange)
				}
			}
		}

		init()

		return () => {
			isMounted = false
			removeAwarenessListener()
			setPresence([])
			bindingRef.current?.destroy?.()
			bindingRef.current = null
			providerRef.current?.disconnect?.()
			providerRef.current?.destroy?.()
			providerRef.current = null
			ydocRef.current?.destroy()
			ydocRef.current = null
			quillRef.current = null

			if (editorElement) {
				editorElement.innerHTML = ''
			}
		}
	}, [documentId, isNewDocument, user?.email, user?.id, user?._id, user?.name])

	useEffect(() => {
		const awareness = providerRef.current?.awareness
		if (!awareness) return

		const currentState = awareness.getLocalState()?.user || {}
		awareness.setLocalStateField('user', {
			...currentState,
			id: user?.id || user?._id || user?.email,
			email: user?.email,
			name: user?.name || currentState.name || 'User',
			role,
			color: '#6366f1',
		})
	}, [role, user?.email, user?.id, user?._id, user?.name])

	/* ------------------ ROLE CHANGE ------------------ */
	useEffect(() => {
		if (!quillRef.current) return

		const canEdit = role === 'owner' || role === 'editor'
		quillRef.current.enable(canEdit)
	}, [role])

	/* ------------------ SAVE ------------------ */
	const handleManualSave = async () => {
		if (!ydocRef.current) return

		try {
			setIsSaving(true)

			const state = Y.encodeStateAsUpdate(ydocRef.current)

			if (isNewDocument) {
				const { data } = await api.post('/documents', { title })

				await api.patch(`/documents/${data.document.id}`, {
					contentYjs: Array.from(state),
				})

				navigate(`/editor/${data.document.id}`, { replace: true })
				toast.success('Document created & saved')
				return
			}

			await api.patch(`/documents/${documentId}`, {
				title,
				contentYjs: Array.from(state),
			})

			toast.success('Document saved')

		} catch {
			toast.error('Failed to save document')
		} finally {
			setIsSaving(false)
		}
	}

	/* ------------------ TITLE SAVE ------------------ */
	const handleTitleBlur = async () => {
		if (!documentId || isNewDocument) return

		try {
			await api.patch(`/documents/${documentId}`, { title })
		} catch {
			toast.error('Failed to save title')
		}
	}

	/* ------------------ SHARE ------------------ */
	const handleShareSubmit = async (e) => {
		e.preventDefault()

		if (role !== 'owner' || isNewDocument) return

		try {
			setShareLoading(true)

			await api.post(`/documents/${documentId}/share`, {
				email: shareEmail,
				role: shareRole,
			})

			setShareEmail('')
			toast.success('Access updated')

		} catch {
			toast.error('Failed to share')
		} finally {
			setShareLoading(false)
		}
	}

	const handleBackToDocuments = () => {
		navigate('/', { replace: true })
	}

	return (
		<div className="min-h-screen">
			<EditorView
				title={title}
				onTitleChange={setTitle}
				onTitleBlur={handleTitleBlur}
				onManualSave={handleManualSave}
				onBackToDocuments={handleBackToDocuments}
				isSaving={isSaving}
				role={role}
				collaborators={collaborators || []}
				readOnly={role === 'viewer'}
				canShare={role === 'owner'}
				isDraft={isNewDocument}
				shareEmail={shareEmail}
				onShareEmailChange={setShareEmail}
				shareRole={shareRole}
				onShareRoleChange={setShareRole}
				onShareSubmit={handleShareSubmit}
				shareLoading={shareLoading}
				loading={loading}
				presence={presence}
			/>

			<section className="mx-auto w-full max-w-5xl px-4 pb-10">
				<div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
					<Toolbar />
					<div ref={editorRef} className="min-h-[420px]" />
				</div>
			</section>
		</div>
	)
}