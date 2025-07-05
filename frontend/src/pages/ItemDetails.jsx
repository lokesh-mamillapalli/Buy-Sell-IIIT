import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styling/ItemDetails.css';

function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const navigate = useNavigate();

  const fetchItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch item');

      const data = await response.json();
      setItem(data);
      
      // Check if user has already reviewed
      const hasReviewed = data.reviews.some(review => review.reviewer._id === user._id);
      setShowReviewForm(!hasReviewed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id, user._id]);

  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 409) {
        setInfoMessage('Item is already in the cart');
        setTimeout(() => setInfoMessage(''), 3000);
      } else if (!response.ok) {
        setInfoMessage('You cannot add your own item to cart');
        setTimeout(() => setInfoMessage(''), 3000);
      } else {
        setSuccessMessage('Item added to cart');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/items/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      const updatedItem = await response.json();
      setItem(updatedItem);
      setShowReviewForm(false);
      setSuccessMessage(`Review submitted successfully: ${reviewForm.rating} stars`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const StarRating = ({ rating, onRatingChange, interactive = true }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange(star)}
            className={`text-2xl transition-colors duration-150 ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            }`}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
        {interactive && (
          <span className="ml-2 text-sm text-gray-600">
            {rating} out of 5
          </span>
        )}
      </div>
    );
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container alert alert-error">Error: {error}</div>;

  return (
    <div className="container">
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      {infoMessage && (
        <div className="alert alert-info">
          {infoMessage}
        </div>
      )}
      {item && (
        <div className="item-details">
          <h1 className="item-title">{item.name}</h1>
          <p className="item-description">{item.description}</p>
          <p className="item-price">₹{item.price}</p>
          <div className="item-seller">
            <p>Seller: {item.seller.firstName} {item.seller.lastName}</p>
            <p>Contact: {item.seller.email}</p>
          </div>
          <span className="item-category">{item.category}</span>
          <div className="add-to-cart">
            <button
              onClick={addToCart}
              className="add-to-cart-button"
            >
              Add to Cart
            </button>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h2 className="reviews-title">Reviews</h2>
            
            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={submitReview} className="review-form">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <StarRating 
                    rating={reviewForm.rating} 
                    onRatingChange={(newRating) => 
                      setReviewForm(prev => ({ ...prev, rating: newRating }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    className="form-input"
                    rows="4"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="form-button"
                >
                  Submit Review
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
              {item.reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet</p>
              ) : (
                item.reviews.map((review, index) => (
                  <div key={index} className="review">
                    <div className="review-header">
                      <span className="reviewer-name">
                        {review.reviewer.firstName} {review.reviewer.lastName}
                      </span>
                      <span className="reviewer-email">
                        ({review.reviewer.email})
                      </span>
                      <span className="review-rating">
                        {review.rating} stars
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <p className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetails;