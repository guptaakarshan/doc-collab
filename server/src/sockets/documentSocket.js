import jwt from 'jsonwebtoken'
import Document from '../models/Document.js'

const AUTOSAVE_DELAY_MS = 1500

// In-memory room state for presence and debounced persistence.

//Stores who is inside each document
const roomPresence = new Map()

//Stores latest unsaved content
const pendingSnapshots = new Map()

//Stores timer for autosave
const saveTimers = new Map()


// Converts IDs into consistent string format
function normalizeId(value) {
	if (value && typeof value === 'object' && value._id) {
		return value._id.toString()
	}
	return value?.toString()
}
// Gets the role of a user in a document
function getRole(document, userId) {
	if (normalizeId(document.owner) === normalizeId(userId)) {
		return 'owner'
	}
// Check if user is collaborator
	const collaborator = document.collaborators.find((entry) => normalizeId(entry.user) === normalizeId(userId))
	return collaborator?.role || 'none'
}

function canRead(role) {
	return role === 'owner' || role === 'editor' || role === 'viewer'
}

function canEdit(role) {
	return role === 'owner' || role === 'editor'
}

function emitPresence(io, documentId) {
	const participants = Array.from(roomPresence.get(documentId)?.values() || [])
	io.to(documentId).emit('document:presence', participants)
}

function scheduleAutosave(documentId) {
	if (saveTimers.has(documentId)) {
		clearTimeout(saveTimers.get(documentId))
	}

	const timer = setTimeout(async () => {
		const snapshot = pendingSnapshots.get(documentId)
		if (!snapshot) return

		try {
			await Document.findByIdAndUpdate(documentId, {
				contentDelta: snapshot.delta,
				contentHtml: snapshot.html || '',
				lastEditedBy: snapshot.lastEditedBy,
			})
		} finally {
			pendingSnapshots.delete(documentId)
			saveTimers.delete(documentId)
		}
	}, AUTOSAVE_DELAY_MS)

	saveTimers.set(documentId, timer)
}

export default function registerDocumentSocket(io) {
	// Authenticate every socket with same JWT used by REST APIs.
	io.use((socket, next) => {
		try {
			const authToken = socket.handshake.auth?.token
			const authHeader = socket.handshake.headers?.authorization || ''
			const headerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
			const token = authToken || headerToken

			if (!token) {
				return next(new Error('Unauthorized socket connection'))
			}

			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			socket.data.userId = decoded.userId
			next()
		} catch {
			next(new Error('Unauthorized socket connection'))
		}
	})

	io.on('connection', (socket) => {
		socket.on('document:join', async ({ documentId, userName, userEmail }) => {
			try {
				const document = await Document.findById(documentId)
				if (!document) {
					socket.emit('document:error', { message: 'Document not found' })
					return
				}

				const role = getRole(document, socket.data.userId)
				if (!canRead(role)) {
					socket.emit('document:error', { message: 'No access to this document' })
					return
				}

				socket.join(documentId)
				socket.data.documentId = documentId
				socket.data.documentRole = role

				if (!roomPresence.has(documentId)) {
					roomPresence.set(documentId, new Map())
				}

				roomPresence.get(documentId).set(socket.id, {
					socketId: socket.id,
					userId: socket.data.userId,
					name: userName || 'User',
					email: userEmail || '',
					role,
				})

				// If there is unsaved live content in memory, send it first.
				const liveSnapshot = pendingSnapshots.get(documentId)
				socket.emit('document:load', {
					documentId,
					title: document.title,
					role,
					contentDelta: liveSnapshot?.delta || document.contentDelta,
					contentHtml: liveSnapshot?.html || document.contentHtml,
				})

				emitPresence(io, documentId)
			} catch (error) {
				socket.emit('document:error', { message: 'Failed to join document', error: error.message })
			}
		})

		// Receive editor snapshot and forward to everyone else in room.
		socket.on('document:sync', ({ documentId, delta, html }) => {
			if (!documentId || socket.data.documentId !== documentId) return
			if (!canEdit(socket.data.documentRole)) return

			const snapshot = {
				delta,
				html,
				lastEditedBy: socket.data.userId,
			}

			pendingSnapshots.set(documentId, snapshot)
			scheduleAutosave(documentId)

			socket.to(documentId).emit('document:remote-update', {
				documentId,
				delta,
				html,
				userId: socket.data.userId,
			})
		})

		const leaveCurrentDocument = () => {
			const documentId = socket.data.documentId
			if (!documentId) return

			const room = roomPresence.get(documentId)
			if (room) {
				room.delete(socket.id)
				if (room.size === 0) {
					roomPresence.delete(documentId)
				}
			}

			socket.leave(documentId)
			socket.data.documentId = null
			socket.data.documentRole = null
			emitPresence(io, documentId)
		}

		socket.on('document:leave', leaveCurrentDocument)
		socket.on('disconnect', leaveCurrentDocument)
	})
}
