export default function Toolbar() {
	return (
		<div id="collab-toolbar" className="rounded-t-lg border border-slate-200 bg-slate-50 px-2 py-1">
			<span className="ql-formats">
				<select className="ql-header" defaultValue="">
					<option value="1">H1</option>
					<option value="2">H2</option>
					<option value="">Body</option>
				</select>
			</span>
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
