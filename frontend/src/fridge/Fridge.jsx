import { useEffect, useState } from 'react';

export default function Fridge() {
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

  return (
    <div
      style={{
        padding: '24px',
        width: '100vw',
        minHeight: '100vh',
        margin: '0',
        backgroundColor: 'white',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#1f2937',
        }}
      >
        Digital Fridge
      </h1>

      {/* Deep Section */}
      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="deep"
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          Deep
        </label>
        <input
          id="deep"
          type="text"
          value={deepIngredient}
          onChange={(e) => setDeepIngredient(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '16px',
            color: '#111827',
            backgroundColor: '#ffffff',
            outline: 'none',
          }}
          placeholder="Enter deep ingredient..."
        />
      </div>

      {/* Normal Section */}
      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="normal"
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          Normal
        </label>
        <input
          id="normal"
          type="text"
          value={normalIngredient}
          onChange={(e) => setNormalIngredient(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '16px',
            color: '#111827',
            backgroundColor: '#ffffff',
            outline: 'none',
          }}
          placeholder="Enter normal ingredient..."
        />
      </div>

      {/* Store Button */}
      <button
        onClick={handleStore}
        style={{
          width: '100%',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontWeight: '500',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          if (e.target instanceof HTMLButtonElement) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseOut={(e) => {
          if (e.target instanceof HTMLButtonElement) {
            e.target.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        Store
      </button>

      {/* Deep Ingredients List */}
      {deepIngredients.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3
            style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}
          >
            Deep Ingredients:
          </h3>
          <ul
            style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              backgroundColor: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
            }}
          >
            {deepIngredients.map((ingredient, index) => (
              <li key={index} style={{ color: '#374151', marginBottom: '4px' }}>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Normal Ingredients List */}
      {normalIngredients.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3
            style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}
          >
            Normal Ingredients:
          </h3>
          <ul
            style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              backgroundColor: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
            }}
          >
            {normalIngredients.map((ingredient, index) => (
              <li key={index} style={{ color: '#374151', marginBottom: '4px' }}>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
