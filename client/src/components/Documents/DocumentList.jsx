import DocumentCard from './DocumentCard'

export default function DocumentList({ documents, loading, error, deletingId, onCreate, onOpen, onDelete }) {
	return (
		<section className="mt-8">
			<div className="mb-4 flex items-center justify-between gap-3">
				<h2 className="text-xl font-semibold text-slate-900">Your Documents</h2>
				<button
					type="button"
					onClick={onCreate}
					className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
				>
					New Document
				</button>
			</div>

			{loading && <p className="text-sm text-slate-500">Loading documents...</p>}
			{error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

			{!loading && !error && documents.length === 0 && (
				<div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
					No documents yet. Create one to start collaborating.
				</div>
			)}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{documents.map((document) => (
					<DocumentCard
						key={document.id}
						document={document}
						onOpen={onOpen}
						onDelete={onDelete}
						deleting={deletingId === document.id}
					/>
				))}
			</div>
		</section>
	)
}