export function MarkdownCard({ error, html, raw }) {
  return (
    <div className="card mb-4">
      <div className="card-header">Recipe (Markdown)</div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            Error: {error}
          </div>
        )}
        {html ? (
          <div className="mb-3" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-muted">Use "Get Markdown Recipe" to see a rendered recipe here.</p>
        )}
        <label className="form-label">Raw Markdown</label>
        <textarea
          readOnly
          value={raw}
          placeholder="Markdown response will appear here..."
          className="form-control font-monospace"
          rows={8}
        />
      </div>
    </div>
  );
}
