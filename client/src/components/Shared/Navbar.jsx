import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
	const { isAuthenticated, user, logout } = useAuth()

	const handleLogout = async () => {
		const result = await Swal.fire({
			title: 'Logout?',
			text: 'You will need to log in again to access your documents.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Logout',
			cancelButtonText: 'Cancel',
			confirmButtonColor: '#0f172a',
			cancelButtonColor: '#e2e8f0',
		})

		if (!result.isConfirmed) return

		logout()
		toast.success('Logged out successfully')
	}

	return (
		<header className="border-b bg-white">
			<nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link className="text-lg font-semibold" to="/">
					Collab Docs
				</Link>

				<div className="flex items-center gap-3 text-sm">
					{isAuthenticated ? (
						<>
							<span className="text-slate-600">{user?.name}</span>
							<Link className="rounded border px-3 py-1" to="/">
								Documents
							</Link>
							<button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={handleLogout} type="button">
								Logout
							</button>
						</>
					) : (
						<>
							<Link className="rounded border px-3 py-1" to="/login">
								Login
							</Link>
							<Link className="rounded bg-slate-900 px-3 py-1 text-white" to="/signup">
								Signup
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	)
}
