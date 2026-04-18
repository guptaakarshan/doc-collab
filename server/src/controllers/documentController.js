import Document from '../models/Document.js'
import User from '../models/User.js'

function normalizeId(value) {
	if (value && typeof value === 'object' && value._id) {
		return value._id.toString()
	}
	return value?.toString()
}

// Resolve caller permissions from owner/collaborator relationship.
function getRole(document, userId) {
	const uid = normalizeId(userId)
	if (!uid) return 'none'

	if (normalizeId(document.owner) === uid) {
		return 'owner'
	}

	const collaborator = document.collaborators.find((entry) => normalizeId(entry.user) === uid)
	return collaborator?.role || 'none'
}

function canRead(role) {
	return role === 'owner' || role === 'editor' || role === 'viewer'
}

function canEdit(role) {
	return role === 'owner' || role === 'editor'
}

export async function createDocument(req, res) {
	try {
		const { title } = req.body

		const document = await Document.create({
			title: title?.trim() || 'Untitled Document',
			owner: req.userId,
			contentDelta: { ops: [{ insert: '\n' }] },
			contentHtml: '',
			lastEditedBy: req.userId,
		})

		return res.status(201).json({
			document: {
				id: document._id,
				title: document.title,
				role: 'owner',
				updatedAt: document.updatedAt,
			},
		})
	} catch (error) {
		return res.status(500).json({ message: 'Failed to create document', error: error.message })
	}
}

export async function listDocuments(req, res) {
	try {
		const documents = await Document.find({
			$or: [{ owner: req.userId }, { 'collaborators.user': req.userId }],
		})
			.sort({ updatedAt: -1 })
			.select('title owner collaborators updatedAt createdAt')

		const items = documents.map((document) => ({
			id: document._id,
			title: document.title,
			role: getRole(document, req.userId),
			updatedAt: document.updatedAt,
			createdAt: document.createdAt,
		}))

		return res.status(200).json({ documents: items })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to list documents', error: error.message })
	}
}

export async function getDocumentById(req, res) {
	try {
		const { documentId } = req.params
		const document = await Document.findById(documentId)
			.populate('owner', 'name email')
			.populate('collaborators.user', 'name email')

		if (!document) {
			return res.status(404).json({ message: 'Document not found' })
		}

		const role = getRole(document, req.userId)
		if (!canRead(role)) {
			return res.status(403).json({ message: 'You do not have access to this document' })
		}

		return res.status(200).json({
			document: {
				id: document._id,
				title: document.title,
				owner: document.owner,
				role,
				collaborators: document.collaborators,
				contentDelta: document.contentDelta,
				contentHtml: document.contentHtml,
				updatedAt: document.updatedAt,
				createdAt: document.createdAt,
			},
		})
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch document', error: error.message })
	}
}

export async function updateDocument(req, res) {
	try {
		const { documentId } = req.params
		const { title, contentDelta, contentHtml } = req.body

		const document = await Document.findById(documentId)
		if (!document) {
			return res.status(404).json({ message: 'Document not found' })
		}

		const role = getRole(document, req.userId)
		if (!canEdit(role)) {
			return res.status(403).json({ message: 'You do not have edit access to this document' })
		}

		const previousTitle = document.title

		if (typeof title === 'string') {
			document.title = title.trim() || document.title
		}
		if (contentDelta !== undefined) {
			document.contentDelta = contentDelta
		}
		if (contentHtml !== undefined) {
			document.contentHtml = contentHtml
		}

		document.lastEditedBy = req.userId
		await document.save()

		const io = req.app.get('io')
		if (io && typeof title === 'string' && document.title !== previousTitle) {
			io.to(documentId).emit('document:title-updated', {
				documentId,
				title: document.title,
				changedBy: normalizeId(req.userId),
			})
		}

		return res.status(200).json({
			document: {
				id: document._id,
				title: document.title,
				role,
				updatedAt: document.updatedAt,
			},
		})
	} catch (error) {
		return res.status(500).json({ message: 'Failed to update document', error: error.message })
	}
}

// Owner can share by assigning collaborator role to another registered user.
export async function shareDocument(req, res) {
	try {
		const { documentId } = req.params
		const { email, role } = req.body

		if (!email || !['editor', 'viewer'].includes(role)) {
			return res.status(400).json({ message: 'Valid email and role are required' })
		}

		const document = await Document.findById(documentId)
		if (!document) {
			return res.status(404).json({ message: 'Document not found' })
		}

		if (normalizeId(document.owner) !== normalizeId(req.userId)) {
			return res.status(403).json({ message: 'Only owner can share this document' })
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() })
		if (!user) {
			return res.status(404).json({ message: 'User with this email does not exist' })
		}

		if (normalizeId(user._id) === normalizeId(document.owner)) {
			return res.status(400).json({ message: 'Owner already has full access' })
		}

		const existing = document.collaborators.find((entry) => normalizeId(entry.user) === normalizeId(user._id))
		const previousRole = existing?.role
		if (existing) {
			existing.role = role
		} else {
			document.collaborators.push({ user: user._id, role })
		}

		await document.save()

		// Notify active collaborators in this document room when role changes.
		const io = req.app.get('io')
		if (io && previousRole && previousRole !== role) {
			const activeSockets = await io.in(documentId).fetchSockets()
			for (const activeSocket of activeSockets) {
				if (normalizeId(activeSocket.data.userId) !== normalizeId(user._id)) {
					continue
				}

				// Update in-memory socket role so edit permissions change immediately.
				activeSocket.data.documentRole = role
				activeSocket.emit('document:permission-changed', {
					documentId,
					targetUserId: normalizeId(user._id),
					oldRole: previousRole,
					newRole: role,
				})
			}
		}

		return res.status(200).json({ message: 'Document shared successfully' })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to share document', error: error.message })
	}
}

export async function deleteDocument(req, res) {
	try {
		const { documentId } = req.params
		const document = await Document.findById(documentId)

		if (!document) {
			return res.status(404).json({ message: 'Document not found' })
		}

		if (normalizeId(document.owner) !== normalizeId(req.userId)) {
			return res.status(403).json({ message: 'Only owner can delete this document' })
		}

		const io = req.app.get('io')
		if (io) {
			io.to(documentId).emit('document:deleted', {
				documentId,
				deletedBy: normalizeId(req.userId),
				title: document.title,
			})
		}

		await document.deleteOne()
		return res.status(200).json({ message: 'Document deleted successfully' })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to delete document', error: error.message })
	}
}
