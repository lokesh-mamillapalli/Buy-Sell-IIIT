import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styling/AddItem.css';

function AddItem() {
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: 'clothing'
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleNewItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      if (!response.ok) throw new Error('Failed to create item');

      setNewItem({
        name: '',
        price: '',
        description: '',
        category: 'clothing'
      });
      setSuccessMessage('Item created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="container">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      <div className="form-container">
        <h2 className="form-title">Add New Item</h2>
        <form onSubmit={handleNewItem} className="form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="form-input"
            >
              <option value="clothing">Clothing</option>
              <option value="grocery">Grocery</option>
              <option value="electronics">Electronics</option>
              <option value="books">Books</option>
              <option value="others">Others</option>
            </select>
          </div>
          <button
            type="submit"
            className="form-button"
          >
            Create Item
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;