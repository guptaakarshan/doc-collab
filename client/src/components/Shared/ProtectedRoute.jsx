import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function ProtectedRoute() {
	const { isAuthenticated, loading } = useAuth()

	if (loading) {
		return <p className="p-4 text-center text-slate-500">Checking session...</p>
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}