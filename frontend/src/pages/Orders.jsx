import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styling/Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.orders) {
      const newOrders = location.state.orders;
      alert(`Order placed successfully! Your OTP${newOrders.length > 1 ? 's' : ''}: ${
        newOrders.map(order => `\n${order.order.item.name}: ${order.plainOtp}`).join('')
      }`);
      // Clear the location state after displaying the alert
      navigate(location.pathname, { replace: true });
    }
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'sold' ? 'seller' : 'buyer';
      const response = await fetch(`http://localhost:5000/api/orders/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const regenerateOTP = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/regenerate-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate OTP');
      }

      const data = await response.json();
      alert(`New OTP for your order: ${data.plainOtp}`);
      setSuccessMessage('OTP regenerated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchOrders();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'bought') return order.status === 'completed';
    return true; // for 'sold' tab, show all orders
  });

  return (
    <div className="orders-container">
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
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders
        </button>
        <button
          className={`tab ${activeTab === 'bought' ? 'active' : ''}`}
          onClick={() => setActiveTab('bought')}
        >
          Items Bought
        </button>
        <button
          className={`tab ${activeTab === 'sold' ? 'active' : ''}`}
          onClick={() => setActiveTab('sold')}
        >
          Items Sold
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order._id} className="order-card">
            <h3 className="order-title">{order.item.name}</h3>
            <p className="order-price">Price: ₹{order.amount}</p>
            <p className="order-info">
              {activeTab === 'sold' ? 'Buyer' : 'Seller'}: {activeTab === 'sold'
                ? `${order.buyer.firstName} ${order.buyer.lastName}`
                : `${order.seller.firstName} ${order.seller.lastName}`}
            </p>
            <p className="order-info">Transaction ID: {order.transactionId}</p>
            <p className="order-info">
              Status: <span className={order.status === 'completed' ? 'status-completed' : 'status-pending'}>
                {order.status}
              </span>
            </p>
            <p className="order-info">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            {activeTab === 'pending' && (
              <button
                onClick={() => regenerateOTP(order._id)}
                className="regenerate-otp-button"
              >
                Regenerate OTP
              </button>
            )}
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <p className="no-orders">
            No {activeTab === 'pending' ? 'pending orders' : activeTab === 'bought' ? 'completed purchases' : 'sales'} found
          </p>
        )}
      </div>
    </div>
  );
}

export default Orders;