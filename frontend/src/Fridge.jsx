import { marked } from 'marked';
import { useEffect, useState } from 'react';

export default function Fridge() {
  const API_BASE = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';
  const [deepIngredient, setDeepIngredient] = useState('');
  const [normalIngredient, setNormalIngredient] = useState('');
  // Initialize from localStorage immediately so data persists across refreshes
  const [deepIngredients, setDeepIngredients] = useState(() => {
    try {
      const saved = localStorage.getItem('deepIngredients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [normalIngredients, setNormalIngredients] = useState(() => {
    try {
      const saved = localStorage.getItem('normalIngredients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [apiResponse, setApiResponse] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [isPostingMd, setIsPostingMd] = useState(false);
  const [mdError, setMdError] = useState('');
  const [mdRaw, setMdRaw] = useState('');
  const [mdHtml, setMdHtml] = useState('');

  // (No need to load on mount since we initialize from localStorage above)

  // Save deepIngredients to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('deepIngredients', JSON.stringify(deepIngredients));
  }, [deepIngredients]);

  // Save normalIngredients to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('normalIngredients', JSON.stringify(normalIngredients));
  }, [normalIngredients]);

  const handleStore = () => {
    // Add deep ingredient if not empty
    if (deepIngredient.trim() !== '') {
      setDeepIngredients((prev) => [...prev, deepIngredient.trim()]);
      setDeepIngredient(''); // Clear the input
    }

    // Add normal ingredient if not empty
    if (normalIngredient.trim() !== '') {
      setNormalIngredients((prev) => [...prev, normalIngredient.trim()]);
      setNormalIngredient(''); // Clear the input
    }
  };

  // Clear localStorage and reset lists/inputs
  const handleClear = () => {
    try {
      localStorage.removeItem('deepIngredients');
      localStorage.removeItem('normalIngredients');
    } catch {
      // ignore
    }
    setDeepIngredients([]);
    setNormalIngredients([]);
    setDeepIngredient('');
    setNormalIngredient('');
    setApiResponse(null);
    setPostError('');
  };

  // Send current ingredients to backend API and capture response
  const handleSendToServer = async () => {
    setIsPosting(true);
    setPostError('');
    try {
      const res = await fetch(`${API_BASE}/api/ingredients-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deepIngredients, normalIngredients }),
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setPostError(err.message || 'Failed to send request');
    } finally {
      setIsPosting(false);
    }
  };

  // Send current ingredients to Markdown endpoint and render
  const handleSendToServerMd = async () => {
    setIsPostingMd(true);
    setMdError('');
    setMdRaw('');
    setMdHtml('');
    try {
      const res = await fetch(`${API_BASE}/api/ingredients-md`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deepIngredients, normalIngredients }),
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      setMdRaw(text);
      // Convert Markdown to HTML safely using marked
      const html = marked.parse(text);
      setMdHtml(html);
    } catch (err) {
      setMdError(err.message || 'Failed to send request');
    } finally {
      setIsPostingMd(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Digital Fridge</h1>
      {/* Input form card */}
      <div className="card mb-4">
        <div className="card-header">Add Ingredients</div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label htmlFor="deep" className="form-label">
                Deep
              </label>
              <input
                id="deep"
                type="text"
                value={deepIngredient}
                onChange={(e) => setDeepIngredient(e.target.value)}
                className="form-control"
                placeholder="Enter deep ingredient..."
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="normal" className="form-label">
                Normal
              </label>
              <input
                id="normal"
                type="text"
                value={normalIngredient}
                onChange={(e) => setNormalIngredient(e.target.value)}
                className="form-control"
                placeholder="Enter normal ingredient..."
              />
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button onClick={handleStore} className="btn btn-primary">
              Store
            </button>
            <button onClick={handleClear} className="btn btn-outline-danger">
              Clear
            </button>
            <button
              onClick={handleSendToServer}
              disabled={isPosting}
              className={`btn ${isPosting ? 'btn-secondary' : 'btn-success'}`}
            >
              {isPosting ? 'Sending…' : 'Send to server'}
            </button>
            <button
              onClick={handleSendToServerMd}
              disabled={isPostingMd}
              className={`btn ${isPostingMd ? 'btn-secondary' : 'btn-outline-success'}`}
            >
              {isPostingMd ? 'Fetching…' : 'Get Markdown Recipe'}
            </button>
          </div>
        </div>
      </div>

      {/* Lists side-by-side on larger screens */}
      {(deepIngredients.length > 0 || normalIngredients.length > 0) && (
        <div className="row g-3 mb-4">
          {deepIngredients.length > 0 && (
            <div className="col-12 col-md-6">
              <div className="card h-100">
                <div className="card-header">Deep Ingredients</div>
                <ul className="list-group list-group-flush">
                  {deepIngredients.map((ingredient, index) => (
                    <li key={index} className="list-group-item">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {normalIngredients.length > 0 && (
            <div className="col-12 col-md-6">
              <div className="card h-100">
                <div className="card-header">Normal Ingredients</div>
                <ul className="list-group list-group-flush">
                  {normalIngredients.map((ingredient, index) => (
                    <li key={index} className="list-group-item">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* API response */}
      <div className="card mb-4">
        <div className="card-header">API Response</div>
        <div className="card-body">
          {postError && (
            <div className="alert alert-danger mb-3" role="alert">
              Error: {postError}
            </div>
          )}
          <textarea
            readOnly
            value={apiResponse ? JSON.stringify(apiResponse, null, 2) : ''}
            placeholder="Send to server to see response..."
            className="form-control font-monospace"
            rows={8}
          />
        </div>
      </div>

      {/* Markdown response */}
      <div className="card mb-4">
        <div className="card-header">Recipe (Markdown)</div>
        <div className="card-body">
          {mdError && (
            <div className="alert alert-danger mb-3" role="alert">
              Error: {mdError}
            </div>
          )}
          {mdHtml ? (
            <div className="mb-3" dangerouslySetInnerHTML={{ __html: mdHtml }} />
          ) : (
            <p className="text-muted">Use "Get Markdown Recipe" to see a rendered recipe here.</p>
          )}
          <label className="form-label">Raw Markdown</label>
          <textarea
            readOnly
            value={mdRaw}
            placeholder="Markdown response will appear here..."
            className="form-control font-monospace"
            rows={8}
          />
        </div>
      </div>
    </div>
  );
}
