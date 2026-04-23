export default function Toolbar() {
	return (
		<div id="collab-toolbar" className="rounded-t-2xl border-b border-slate-200/80 bg-[#f2f3f8] px-3 py-2">

			<span className="ql-formats">
				<button className="ql-bold" aria-label="Bold" />
				<button className="ql-italic" aria-label="Italic" />
				<button className="ql-underline" aria-label="Underline" />
			</span>
			<span className="ql-formats">
				<button className="ql-list" value="ordered" aria-label="Ordered list" />
				<button className="ql-list" value="bullet" aria-label="Bullet list" />
				<button className="ql-link" aria-label="Insert link" />
			</span>
		</div>
	)
}