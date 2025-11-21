import express from 'express'
const router = express.Router();
import {registerUser,googleAuth,login,
        verifyToken,list,createConversation,
        getConversations,getConversationById,createMessage,
        getMessages,markAsRead}
        from '../controllers/userController.js';

router.post('/register',registerUser)
router.post('/login',login)
router.post('/google-auth',googleAuth)
router.get('/verify',verifyToken)
router.get('/list',list)
router.post('/createconversation',createConversation)
router.get('/conversations',getConversations)
router.get('/conversation',getConversationById)
router.post('/createMessage',createMessage)
router.get('/messages/:conversationId',getMessages)
router.put('/conversation/:conversationId/read',markAsRead)
export default router