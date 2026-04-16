import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem('collab_token'))
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function bootstrapAuth() {
			if (!token) {
				setLoading(false)
				return
			}

			try {
				const { data } = await api.get('/auth/me')
				setUser(data.user)
			} catch {
				localStorage.removeItem('collab_token')
				setToken(null)
				setUser(null)
			} finally {
				setLoading(false)
			}
		}

		bootstrapAuth()
	}, [token])

	const saveSession = (nextToken, nextUser) => {
		localStorage.setItem('collab_token', nextToken)
		setToken(nextToken)
		setUser(nextUser)
	}

	const login = async ({ email, password }) => {
		const { data } = await api.post('/auth/login', { email, password })
		saveSession(data.token, data.user)
		return data.user
	}

	const signup = async ({ name, email, password }) => {
		const { data } = await api.post('/auth/signup', { name, email, password })
		saveSession(data.token, data.user)
		return data.user
	}

	const logout = () => {
		localStorage.removeItem('collab_token')
		setToken(null)
		setUser(null)
	}

	const value = useMemo(
		() => ({
			token,
			user,
			loading,
			isAuthenticated: Boolean(token),
			login,
			signup,
			logout,
		}),
		[loading, token, user],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
