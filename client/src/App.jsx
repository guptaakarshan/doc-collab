import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/useAuth'
import Navbar from './components/Shared/Navbar'
import ProtectedRoute from './components/Shared/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { socket } from './api/socket'
import { useEffect } from 'react'

function App() {
	const { isAuthenticated, user } = useAuth()

	useEffect(() => {
		if (isAuthenticated && user) {
			socket.connect()
			socket.emit('join-app', user.id || user._id)
		} else {
			socket.disconnect()
		}

		return () => {
			socket.disconnect()
		}
	}, [isAuthenticated, user])

	return (
		<>
			<Toaster position="top-right" toastOptions={{ duration: 3000 }} />
			{isAuthenticated && <Navbar />}
			<Routes>
				{!isAuthenticated ? (
					<>
						<Route path="/" element={<LandingPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/signup" element={<SignupPage />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</>
				) : (
					<>
						<Route element={<ProtectedRoute />}>
							<Route path="/" element={<HomePage />} />
							<Route path="/editor" element={<Navigate to="/" replace />} />
							<Route path="/editor/:documentId" element={<EditorPage />} />
						</Route>
						<Route path="*" element={<Navigate to="/" replace />} />
					</>
				)}
			</Routes>
		</>
	)
}

export default App