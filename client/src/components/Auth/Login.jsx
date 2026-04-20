import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login({ onSubmit }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		try {
			await onSubmit?.({ email, password })
		} catch (submitError) {
			const message = submitError?.response?.data?.message || 'Login failed'
			setError(message)
			toast.error(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
			>
				<h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
					Welcome Back 👋
				</h1>

				{/* Email */}
				<div className="mb-4">
					<label className="mb-1 block text-sm font-medium text-gray-600">
						Email
					</label>
					<input
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
						required
					/>
				</div>

				{/* Password */}
				<div className="mb-4">
					<label className="mb-1 block text-sm font-medium text-gray-600">
						Password
					</label>
					<input
						type="password"
						placeholder="Enter your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
						minLength={6}
						required
					/>
				</div>

				{/* Error */}
				{error && (
					<div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
						{error}
					</div>
				)}

				{/* Button */}
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full rounded-lg bg-black py-2 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isSubmitting ? 'Logging in...' : 'Login'}
				</button>

				{/* Footer */}
				<p className="mt-4 text-center text-sm text-gray-500">
					Don’t have an account?{' '}
					<Link to="/signup" className="cursor-pointer font-medium text-black hover:underline">
						Sign up
					</Link>
				</p>
			</form>
		</div>
	)
}