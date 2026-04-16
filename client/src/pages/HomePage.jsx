import { Link } from 'react-router-dom'

export default function HomePage() {
	return (
		<main className="mx-auto mt-10 max-w-4xl px-4">
			<h1 className="text-3xl font-semibold">Your Documents</h1>
			<p className="mt-2 text-slate-600">Authentication is ready. Next step is document CRUD + persistence.</p>
			<Link className="mt-6 inline-block rounded bg-slate-900 px-4 py-2 text-white" to="/editor">
				Open Editor
			</Link>
		</main>
	)
}
