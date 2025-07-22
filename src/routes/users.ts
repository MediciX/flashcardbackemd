import express from 'express'
import { registerUser, loginUser, getUsers } from '../controller/UserController'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/users', getUsers)

export default router