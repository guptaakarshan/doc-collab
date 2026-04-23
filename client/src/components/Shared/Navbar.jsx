import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/useAuth'

export default function Navbar() {
	const { isAuthenticated, user, logout } = useAuth()

	const handleLogout = async () => {
		const result = await Swal.fire({
			title: 'Logout?',
			text: 'You will need to log in again.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Logout',
			cancelButtonText: 'Cancel',
		})

		if (!result.isConfirmed) return

		logout()
		toast.success('Logged out successfully')
	}

	return (
		<header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-md">
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
				<Link className="text-lg font-semibold text-[#030213]" to="/">
					Collab Docs
				</Link>

				<div className="flex items-center gap-4 text-sm">
					{isAuthenticated ? (
						<>
							<span className="text-[#717182]">{user?.name}</span>

							<button
								onClick={handleLogout}
								className="rounded-xl bg-[#030213] px-4 py-2 text-white transition active:scale-95"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								className="text-[#717182] hover:text-black"
							>
								Login
							</Link>

							<Link
								to="/signup"
								className="rounded-xl bg-[#030213] px-4 py-2 text-white"
							>
								Sign Up
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	)
}