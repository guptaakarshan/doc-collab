import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Shared/Navbar'
import ProtectedRoute from './components/Shared/ProtectedRoute'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />

				<Route element={<ProtectedRoute />}>
					<Route path="/" element={<HomePage />} />
					<Route path="/editor" element={<EditorPage />} />
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	)
}

export default App
