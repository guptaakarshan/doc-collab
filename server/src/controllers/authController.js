import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function signToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function sanitizeUser(user) {
	return {
		id: user._id,
		name: user.name,
		email: user.email,
	}
}

export async function signup(req, res) {
	try {
		const { name, email, password } = req.body

		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required' })
		}

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return res.status(409).json({ message: 'Email is already registered' })
		}

		const user = await User.create({ name, email, password })
		const token = signToken(user._id.toString())

		return res.status(201).json({
			token,
			user: sanitizeUser(user),
		})
	} catch (error) {
		return res.status(500).json({ message: 'Failed to sign up', error: error.message })
	}
}

export async function login(req, res) {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' })
		}

		const user = await User.findOne({ email }).select('+password')
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const isPasswordValid = await user.comparePassword(password)
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const token = signToken(user._id.toString())

		return res.status(200).json({
			token,
			user: sanitizeUser(user),
		})
	} catch (error) {
		return res.status(500).json({ message: 'Failed to log in', error: error.message })
	}
}

export async function getMe(req, res) {
	try {
		const user = await User.findById(req.userId)
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		return res.status(200).json({ user: sanitizeUser(user) })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch user profile', error: error.message })
	}
}
