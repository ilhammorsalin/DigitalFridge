export function ApiResponseCard({ error, data }) {
  return (
    <div className="card mb-4">
      <div className="card-header">API Response</div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            Error: {error}
          </div>
        )}
        <textarea
          readOnly
          value={data ? JSON.stringify(data, null, 2) : ''}
          placeholder="Send to server to see response..."
          className="form-control font-monospace"
          rows={8}
        />
      </div>
    </div>
  );
}
