export default function DocumentCard({ document, onOpen, onDelete, deleting }) {
	const updatedAt = document.updatedAt ? new Date(document.updatedAt).toLocaleString() : 'Unknown'
	const canDelete = document.role === 'owner'

	return (
		<article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h3 className="text-base font-semibold text-slate-900">{document.title}</h3>
					<p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{document.role}</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => onOpen(document.id)}
						className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
					>
						Open
					</button>

					{canDelete && (
						<button
							type="button"
							onClick={() => onDelete(document)}
							disabled={deleting}
							className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{deleting ? 'Deleting...' : 'Delete'}
						</button>
					)}
				</div>
			</div>
			<p className="mt-3 text-xs text-slate-500">Updated: {updatedAt}</p>
		</article>
	)
}