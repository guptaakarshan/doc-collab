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

// All document endpoints require authenticated users.
router.use(protect)

router.get('/', listDocuments)
router.post('/', createDocument)
router.get('/:documentId', getDocumentById)
router.patch('/:documentId', updateDocument)
router.post('/:documentId/share', shareDocument)
router.delete('/:documentId', deleteDocument)

export default router
