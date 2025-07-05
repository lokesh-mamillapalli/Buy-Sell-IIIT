import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/Cart.css";
function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to remove item from cart");

      await fetchCart();
      setSuccessMessage("Item removed from cart");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to place order");

      const orders = await response.json();
      navigate("/orders", { state: { orders } });
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">My Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-lg font-bold">₹{item.price}</p>
                    <p className="text-sm text-gray-500">
                      Seller: {item.seller.firstName} {item.seller.lastName}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                      height: "30px",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#dc2626")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#ef4444")
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Total</h3>
              <p className="text-2xl font-bold">₹{total}</p>
            </div>
            <button
              onClick={placeOrder}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
