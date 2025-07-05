import { useState, useEffect } from 'react';
import './styling/Deliveries.css';

function Deliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpMap, setOtpMap] = useState({});  // Store OTPs for each order
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingDeliveries();
  }, []);

  const fetchPendingDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/pending-deliveries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending deliveries');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: otpMap[orderId] })  // Use OTP specific to this order
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete order');
      }

      setOtpMap((prev) => ({ ...prev, [orderId]: '' }));  // Clear OTP for this order
      setSuccessMessage('Order completed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchPendingDeliveries();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;

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

      <h1 className="title">Pending Deliveries</h1>

      <div className="orders">
        {orders.map(order => (
          <div key={order._id} className="order">
            <h3 className="order-title">{order.item.name}</h3>
            <p className="order-price">Price: ₹{order.amount}</p>
            <p className="order-buyer">
              Buyer: {order.buyer.firstName} {order.buyer.lastName}
            </p>
            <p className="order-transaction">Transaction ID: {order.transactionId}</p>
            <div className="order-actions">
              <input
                type="text"
                placeholder="Enter OTP"
                className="otp-input"
                value={otpMap[order._id] || ''}  // Get OTP for this order
                onChange={(e) => setOtpMap(prev => ({ ...prev, [order._id]: e.target.value }))}
              />
              <button
                onClick={() => completeOrder(order._id)}
                className="complete-button"
              >
                Complete Delivery
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="no-orders">No pending deliveries</p>
        )}
      </div>
    </div>
  );
}

export default Deliveries;