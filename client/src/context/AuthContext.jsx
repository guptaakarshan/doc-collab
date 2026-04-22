import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import AuthContext from './auth-context'

export function AuthProvider({ children }) {
	// Persist token across refresh; user profile is fetched on app boot.
	const [token, setToken] = useState(() => localStorage.getItem('collab_token'))
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Restore authenticated session when token exists.
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

	// Save token + user in one place to keep state transitions consistent.
	const saveSession = useCallback((nextToken, nextUser) => {
		localStorage.setItem('collab_token', nextToken)
		setToken(nextToken)
		setUser(nextUser)
	}, [])

	// Auth actions used by LoginPage/SignupPage.
	const login = useCallback(async ({ email, password }) => {
		const { data } = await api.post('/auth/login', { email, password })
		saveSession(data.token, data.user)
		return data.user
	}, [saveSession])

	const signup = useCallback(async ({ name, email, password }) => {
		const { data } = await api.post('/auth/signup', { name, email, password })
		saveSession(data.token, data.user)
		return data.user
	}, [saveSession])

	const logout = useCallback(() => {
		localStorage.removeItem('collab_token')
		setToken(null)
		setUser(null)
	}, [])

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
		[loading, login, logout, signup, token, user],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
