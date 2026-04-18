import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DocumentList from '../components/Documents/DocumentList'
import api from '../api/axios'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'

export default function HomePage() {
	const navigate = useNavigate()
	const [documents, setDocuments] = useState([])
	const [loading, setLoading] = useState(true)
	const [deletingId, setDeletingId] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		// Load current user's accessible documents.
		async function fetchDocuments() {
			try {
				setError('')
				setLoading(true)
				const { data } = await api.get('/documents')
				setDocuments(data.documents || [])
			} catch (requestError) {
				const message = requestError?.response?.data?.message || 'Failed to load documents'
				setError(message)
				toast.error(message)
			} finally {
				setLoading(false)
			}
		}

		fetchDocuments()
	}, [])

	const handleCreateDocument = async () => {
		navigate('/editor/new')
	}

	const handleOpenDocument = (documentId) => {
		navigate(`/editor/${documentId}`)
	}

	const handleDeleteDocument = async (document) => {
		const result = await Swal.fire({
			title: 'Delete document?',
			text: `"${document.title}" will be permanently removed.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			confirmButtonColor: '#b91c1c',
			cancelButtonColor: '#e2e8f0',
		})

		if (!result.isConfirmed) return

		try {
			setError('')
			setDeletingId(document.id)
			await api.delete(`/documents/${document.id}`)

			// Optimistic local update to avoid full refetch.
			setDocuments((prev) => prev.filter((item) => item.id !== document.id))
			toast.success('Document deleted')
		} catch (requestError) {
			const message = requestError?.response?.data?.message || 'Failed to delete document'
			setError(message)
			toast.error(message)
		} finally {
			setDeletingId('')
		}
	}

	return (
		<main className="mx-auto mt-10 max-w-4xl px-4">
			<h1 className="text-3xl font-semibold text-slate-900">Collaborative Documents</h1>
			<p className="mt-2 text-slate-600">
				Create a document, open it in the editor, and collaborate in real time.
			</p>

			<DocumentList
				documents={documents}
				loading={loading}
				error={error}
				deletingId={deletingId}
				onCreate={handleCreateDocument}
				onOpen={handleOpenDocument}
				onDelete={handleDeleteDocument}
			/>
		</main>
	)
}
