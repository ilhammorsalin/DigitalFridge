import { marked } from 'marked';
import { useState } from 'react';
import { usePersistentArray } from '@hooks/usePersistentArray';
import { postIngredientsJson, postIngredientsMarkdown } from '@services/api';
import { clearKeys } from '@utils/storage';
import { IngredientInput } from '@components/IngredientInput';
import { IngredientList } from '@components/IngredientList';
import { ApiResponseCard } from '@components/ApiResponseCard';
import { MarkdownCard } from '@components/MarkdownCard';

export default function Fridge() {
  const [deepIngredient, setDeepIngredient] = useState('');
  const [normalIngredient, setNormalIngredient] = useState('');
  const [deepIngredients, setDeepIngredients] = usePersistentArray('deepIngredients');
  const [normalIngredients, setNormalIngredients] = usePersistentArray('normalIngredients');
  const [apiResponse, setApiResponse] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [isPostingMd, setIsPostingMd] = useState(false);
  const [mdError, setMdError] = useState('');
  const [mdRaw, setMdRaw] = useState('');
  const [mdHtml, setMdHtml] = useState('');

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
    clearKeys(['deepIngredients', 'normalIngredients']);
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
      const data = await postIngredientsJson(deepIngredients, normalIngredients);
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
      const text = await postIngredientsMarkdown(deepIngredients, normalIngredients);
      setMdRaw(typeof text === 'string' ? text : JSON.stringify(text));
      const html = marked.parse(typeof text === 'string' ? text : '');
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
            <IngredientInput
              id="deep"
              label="Deep"
              value={deepIngredient}
              onChange={setDeepIngredient}
              placeholder="Enter deep ingredient..."
            />
            <IngredientInput
              id="normal"
              label="Normal"
              value={normalIngredient}
              onChange={setNormalIngredient}
              placeholder="Enter normal ingredient..."
            />
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
          <IngredientList title="Deep Ingredients" items={deepIngredients} />
          <IngredientList title="Normal Ingredients" items={normalIngredients} />
        </div>
      )}

      {/* API response */}
      <ApiResponseCard error={postError} data={apiResponse} />

      {/* Markdown response */}
      <MarkdownCard error={mdError} html={mdHtml} raw={mdRaw} />
    </div>
  );
}
