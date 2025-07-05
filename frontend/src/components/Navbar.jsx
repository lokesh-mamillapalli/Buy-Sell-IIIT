// filepath: /home/lokesh/project10/project5/frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">IIITH Buy-Sell</Link>
        <div className="navbar-links">
          <Link to="/search" className="navbar-link">Search Items</Link>
          <Link to="/cart" className="navbar-link">My Cart</Link>
          <Link to="/orders" className="navbar-link">Orders</Link>
          <Link to="/deliveries" className="navbar-link">Deliveries</Link>
          <Link to="/profile" className="navbar-link">Profile</Link>
          <Link to="/support" className="navbar-link">Support</Link>
          <Link to="/add-item" className="navbar-link">Add New Item</Link>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;