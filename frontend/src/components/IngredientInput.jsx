export function IngredientInput({ label, id, value, onChange, placeholder }) {
  return (
    <div className="col-12 col-md-6">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
        placeholder={placeholder}
      />
    </div>
  );
}
