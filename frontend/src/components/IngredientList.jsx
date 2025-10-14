export function IngredientList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="col-12 col-md-6">
      <div className="card h-100">
        <div className="card-header">{title}</div>
        <ul className="list-group list-group-flush">
          {items.map((ingredient, index) => (
            <li key={`${ingredient}-${index}`} className="list-group-item">
              {ingredient}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
