import { Link } from 'react-router-dom'

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Header Navigation */}
			<header className="border-b border-slate-100">
				<nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
					<Link to="/" className="text-lg font-bold text-slate-900">
						📋 Collab Docs
					</Link>
					<div className="hidden md:flex items-center gap-8">
						<a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
							Features
						</a>
						<a href="#how" className="text-sm text-slate-600 hover:text-slate-900">
							How it works
						</a>
						<Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
							Login
						</Link>
						<Link
							to="/signup"
							className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
						>
							Sign Up
						</Link>
					</div>
					<div className="md:hidden flex gap-2">
						<Link to="/login" className="text-sm px-3 py-2 rounded border border-slate-200">
							Login
						</Link>
						<Link to="/signup" className="text-sm px-3 py-2 rounded bg-slate-900 text-white">
							Sign Up
						</Link>
					</div>
				</nav>
			</header>

			{/* Hero Section */}
			<section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
					{/* Left Content */}
					<div>
						<h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
							Collaborate on documents in real-time
						</h1>
						<p className="mt-6 text-lg text-slate-600">
							Edit, share, and work together instantly — like Google Docs, but built by you.
						</p>

						{/* CTA Buttons */}
						<div className="mt-8 flex gap-4">
							<Link
								to="/signup"
								className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800 transition"
							>
								Get Started
							</Link>
							<button className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 transition">
								Live Demo
							</button>
						</div>
					</div>

					{/* Right - Editor App Screenshot */}
					<div className="relative">
						<div className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
							{/* Mini Navbar */}
							<div className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between">
								<h3 className="font-semibold text-slate-900">Collab Docs</h3>
								<div className="flex items-center gap-4">
									<span className="text-sm text-slate-600">user@example.com</span>
									<div className="flex gap-2">
										<div className="h-6 w-6 rounded-full bg-blue-400" />
										<div className="h-6 w-6 rounded-full bg-purple-400" />
									</div>
								</div>
							</div>

							{/* Editor Content */}
							<div className="p-6 space-y-4">
								{/* Title and Controls */}
								<div className="flex items-center justify-between mb-4">
									<input
										type="text"
										value="Planning"
										readOnly
										className="text-2xl font-bold text-slate-900 border-none bg-transparent outline-none"
									/>
									<div className="flex gap-2">
										<button className="text-xs px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
											Back
										</button>
										<button className="text-xs px-3 py-1.5 rounded bg-slate-900 text-white">
											Save
										</button>
										<span className="text-xs px-3 py-1.5 rounded border border-slate-300 text-slate-600 bg-white">
											OWNER
										</span>
									</div>
								</div>

								{/* Toolbar */}
								<div className="border-b border-slate-200 pb-3 flex gap-2">
									<select className="text-xs px-2 py-1 border border-slate-200 rounded bg-white">
										<option>Body</option>
									</select>
									<button className="px-2 py-1 text-slate-700 hover:bg-slate-100">
										<strong>B</strong>
									</button>
									<button className="px-2 py-1 text-slate-700 hover:bg-slate-100">
										<em>I</em>
									</button>
									<button className="px-2 py-1 text-slate-700 hover:bg-slate-100">
										<u>U</u>
									</button>
									<button className="px-2 py-1 text-slate-700 hover:bg-slate-100">≡</button>
									<button className="px-2 py-1 text-slate-700 hover:bg-slate-100">•</button>
								</div>

								{/* Document Content */}
								<div className="space-y-2 text-sm text-slate-900">
									<h2 className="text-lg font-semibold">Project Plan</h2>
									<ol className="list-decimal list-inside space-y-1 text-slate-700">
										<li>requirement gathering</li>
										<li>design</li>
										<li>code</li>
									</ol>
								</div>

								{/* Footer */}
								<div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
									Changes sync via Socket.IO and are auto-saved to MongoDB with debounce.
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="border-t border-slate-100 bg-slate-50 py-16 sm:py-24">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Features</h2>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{/* Feature 1 */}
						<div className="rounded-lg bg-white p-8 shadow-sm border border-slate-100">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 mb-4">
								<span className="text-2xl">⚡</span>
							</div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Collaboration</h3>
							<p className="text-slate-600">
								Work together on documents with live, instant updates. See your collaborators' changes as they type.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="rounded-lg bg-white p-8 shadow-sm border border-slate-100">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 mb-4">
								<span className="text-2xl">👥</span>
							</div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">Multi-User Editing</h3>
							<p className="text-slate-600">
								Invite multiple users to edit documents simultaneously. Assign roles to control edit and view permissions.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="rounded-lg bg-white p-8 shadow-sm border border-slate-100">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 mb-4">
								<span className="text-2xl">🔒</span>
							</div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">Secure & Private</h3>
							<p className="text-slate-600">
								Your documents are securely stored and protected. Only shared collaborators can access them.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section id="how" className="py-16 sm:py-24">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How it works</h2>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{/* Step 1 */}
						<div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold mb-4">
								1
							</div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">Step 1</h3>
							<p className="font-medium text-slate-900">Create a document</p>
							<p className="mt-2 text-slate-600">Start by creating a new document to get going.</p>
						</div>

						{/* Step 2 */}
						<div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700 font-bold mb-4">
								2
							</div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">Step 2</h3>
							<p className="font-medium text-slate-900">Share with others</p>
							<p className="mt-2 text-slate-600">Invite friends or team members to collaborate with you.</p>
						</div>

						{/* Step 3 */}
						<div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold mb-4">
								3
							</div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">Step 3</h3>
							<p className="font-medium text-slate-900">Edit together in time</p>
							<p className="mt-2 text-slate-600">Work together with live editing and instant updates.</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-t border-slate-100 bg-slate-900 py-16 sm:py-24">
				<div className="mx-auto max-w-2xl px-4 text-center">
					<h2 className="text-3xl font-bold text-white sm:text-4xl">Start collaborating today</h2>
					<p className="mt-4 text-lg text-slate-300">
						Create free account and start working together in real-time.
					</p>
					<Link
						to="/signup"
						className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-100 transition"
					>
						Get Started for Free
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-slate-200 bg-white py-8">
				<div className="mx-auto max-w-6xl px-4">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<p className="text-sm text-slate-600">© 2026 Collab Docs</p>
						<div className="flex gap-6">
							<a href="#" className="text-sm text-slate-600 hover:text-slate-900">
								GITHUB
							</a>
							<a href="#" className="text-sm text-slate-600 hover:text-slate-900">
								Contact
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
