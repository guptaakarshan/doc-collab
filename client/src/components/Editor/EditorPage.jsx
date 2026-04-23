export default function EditorView({
	title,
	onTitleChange,
	onTitleBlur,
	onManualSave,
	onBackToDocuments,
	isSaving,
	role,
	collaborators = [],
	presence = [],
	readOnly,
	error,
	toast,
	canShare = false,
	isDraft = false,
	loading = false,
	shareEmail,
	onShareEmailChange,
	shareRole,
	onShareRoleChange,
	onShareSubmit,
	shareLoading,
	shareMessage,
}) {
	return (
		<main className="mx-auto mt-8 max-w-5xl px-4 pb-6">
			<div className="mb-5 rounded-2xl border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7fb_100%)] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
				<div className="flex flex-wrap items-center justify-between gap-3">
				<input
					value={title}
					onChange={(event) => onTitleChange(event.target.value)}
					onBlur={onTitleBlur}
					className="w-full max-w-xl rounded-xl border border-transparent bg-[#eceef4] px-4 py-2.5 text-lg font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-slate-300 focus:ring-2 focus:ring-[#0d1022]/10"
					placeholder="Untitled Document"
					readOnly={readOnly}
				/>

				<div className="flex items-center gap-2.5">
					<button
						type="button"
						onClick={onBackToDocuments}
						className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
					>
						Back to Documents
					</button>
					<button
						type="button"
						onClick={onManualSave}
						disabled={readOnly || isSaving}
						className="rounded-xl bg-[#040423] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_6px_12px_rgba(4,4,35,0.2)] transition hover:bg-[#0a0a2f] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSaving ? 'Saving...' : isDraft ? 'Create & Save' : 'Save'}
					</button>
					<span className="rounded-full bg-[#eceef3] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
						{role}
					</span>
					<span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">Active: {presence.length}</span>
				</div>
				</div>
			</div>

			{presence.length > 0 && (
				<div className="mb-4 flex flex-wrap gap-2">
					{presence.map((person) => (
						<span
							key={person.socketId}
							className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
						>
							{person.name} ({person.role})
						</span>
					))}
				</div>
			)}

			{canShare && (
				<section className="mb-5 rounded-2xl border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7fb_100%)] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
					<h2 className="text-sm font-semibold text-slate-900">Share Document</h2>
					<p className="mt-1 text-xs text-slate-500">
						{isDraft
							? 'Create the document first, then add collaborators by email and choose whether they can edit or only view.'
							: 'Add collaborators by email and choose whether they can edit or only view.'}
					</p>

					<form
						onSubmit={onShareSubmit}
						className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
					>
						<input
							type="email"
							value={shareEmail}
							onChange={(event) => onShareEmailChange(event.target.value)}
							placeholder="Collaborator email"
							className="w-full rounded-xl border border-transparent bg-[#eceef4] px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-slate-300 focus:ring-2 focus:ring-[#0d1022]/10"
							required={!isDraft}
							disabled={isDraft}
						/>
						<select
							value={shareRole}
							onChange={(event) => onShareRoleChange(event.target.value)}
							className="rounded-xl border border-transparent bg-[#eceef4] px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-slate-300 focus:ring-2 focus:ring-[#0d1022]/10"
							disabled={isDraft}
						>
							<option value="viewer">Viewer</option>
							<option value="editor">Editor</option>
						</select>
						<button
							type="submit"
							disabled={shareLoading || isDraft}
							className="rounded-xl bg-[#040423] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_12px_rgba(4,4,35,0.2)] transition hover:bg-[#0a0a2f] disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isDraft ? 'Save first' : shareLoading ? 'Sharing...' : 'Share'}
						</button>
					</form>

					{isDraft && (
						<p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
							This is a draft. Use Create & Save to enable sharing.
						</p>
					)}

					{shareMessage && (
						<p
							className={`mt-2 rounded-md border px-3 py-2 text-xs ${
								shareMessage.type === 'error'
									? 'border-red-200 bg-red-50 text-red-700'
									: 'border-emerald-200 bg-emerald-50 text-emerald-700'
							}`}
						>
							{shareMessage.text}
						</p>
					)}

					{collaborators.length > 0 && (
						<div className="mt-3 border-t border-slate-100 pt-3">
							<p className="text-xs font-medium text-slate-600">Access list</p>
							<div className="mt-2 flex flex-wrap gap-2">
								{collaborators.map((person) => (
									<span
										key={person.key}
										className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
									>
										{person.name} ({person.role})
									</span>
								))}
							</div>
						</div>
					)}
				</section>
			)}

			{error && <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

			{loading && (
				<p className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
					Loading document content...
				</p>
			)}

			{toast && (
				<p
					className={`mb-3 rounded-md border px-3 py-2 text-sm ${
						toast.type === 'error'
							? 'border-red-200 bg-red-50 text-red-700'
							: toast.type === 'info'
								? 'border-blue-200 bg-blue-50 text-blue-700'
								: 'border-emerald-200 bg-emerald-50 text-emerald-700'
					}`}
				>
					{toast.text}
				</p>
			)}
		</main>
	)
}