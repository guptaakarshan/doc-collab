import { Router } from 'express'
import {
	createDocument,
	deleteDocument,
	getDocumentById,
	listDocuments,
	shareDocument,
	updateDocument,
} from '../controllers/documentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

// 🔐 All document routes require authentication
router.use(protect)

// 📄 List all documents for user
router.get('/', listDocuments)

// ➕ Create new document
router.post('/', createDocument)

// 📥 Get document (includes Yjs state + migration logic)
router.get('/:documentId', getDocumentById)

// 💾 Save document (Yjs binary state)
router.patch('/:documentId', updateDocument)

// 👥 Share document
router.post('/:documentId/share', shareDocument)

// 🗑 Delete document
router.delete('/:documentId', deleteDocument)

export default router