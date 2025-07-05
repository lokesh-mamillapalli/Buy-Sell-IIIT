import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styling/SearchItems.css';

const categories = ['clothing', 'grocery', 'electronics', 'books', 'others'];

function SearchItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/items';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (selectedCategories.length) params.append('categories', selectedCategories.join(','));
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch items');

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, selectedCategories]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container text-red-600">Error: {error}</div>;

  return (
    <div className="container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search items..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="categories">
        <h3 className="categories-title">Categories</h3>
        <div className="categories-list">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${
                selectedCategories.includes(category)
                  ? 'active'
                  : ''
              }`}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="no-items">
          No items found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <Link
              key={item._id}
              to={`/items/${item._id}`}
              className="item-card"
            >
              <h3 className="item-title">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <p className="item-price">₹{item.price}</p>
              <p className="item-seller">
                Seller: {item.seller.firstName} {item.seller.lastName}
              </p>
              <span className="item-category">
                {item.category}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchItems;