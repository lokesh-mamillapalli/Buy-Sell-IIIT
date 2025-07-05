import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './styling/Profile.css';

function Profile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    age: user.age,
    contactNumber: user.contactNumber
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch items with seller filter
      const itemsRes = await fetch(`http://localhost:5000/api/items?seller=${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const reviewsRes = await fetch(`http://localhost:5000/api/users/${user._id}/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const [itemsData, reviewsData] = await Promise.all([
        itemsRes.json(),
        reviewsRes.json()
      ]);

      // Filter items to only show those belonging to the current user
      const userItems = itemsData.filter(item => item.seller._id === user._id);
      setItems(userItems);
      setReviews(reviewsData);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      login(updatedUser, token);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
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

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-header">
            <h2 className="profile-title">Profile Information</h2>
            <div className="profile-actions">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setIsChangingPassword(false);
                }}
                className="profile-button"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={() => {
                  setIsChangingPassword(!isChangingPassword);
                  setIsEditing(false);
                }}
                className="profile-button"
              >
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                className="form-button"
              >
                Save Changes
              </button>
            </form>
          ) : isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="form-input"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="form-input"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                className="form-button"
              >
                Change Password
              </button>
            </form>
          ) : (
            <div className="profile-details">
              <p><span className="profile-label">Name:</span> {user.firstName} {user.lastName}</p>
              <p><span className="profile-label">Email:</span> {user.email}</p>
              <p><span className="profile-label">Age:</span> {user.age}</p>
              <p><span className="profile-label">Contact:</span> {user.contactNumber}</p>
            </div>
          )}
        </div>

        <div className="profile-items">
          <h2 className="profile-title">My Listed Items</h2>
          <div className="items-list">
            {items.map(item => (
              <Link
                key={item._id}
                to={`/items/${item._id}`}
                className="item-card"
              >
                <h3 className="item-title">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-price">₹{item.price}</p>
                <div className="item-info">
                  <span className="item-status">Status: {item.status}</span>
                  <span className="item-category">{item.category}</span>
                </div>
                {item.reviews.length > 0 && (
                  <div className="item-reviews">
                    Reviews: {item.reviews.length} | Average Rating: {
                      (item.reviews.reduce((acc, review) => acc + review.rating, 0) / item.reviews.length).toFixed(1)
                    } ★
                  </div>
                )}
              </Link>
            ))}
            {items.length === 0 && (
              <p className="no-items">No items listed yet. Add items from the Add Item page.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;