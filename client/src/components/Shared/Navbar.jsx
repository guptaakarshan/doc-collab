import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
	const { isAuthenticated, user, logout } = useAuth()

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
							<Link className="rounded border px-3 py-1" to="/editor">
								Editor
							</Link>
							<button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={logout} type="button">
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
