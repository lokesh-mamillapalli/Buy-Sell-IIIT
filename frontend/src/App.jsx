import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SearchItems from './pages/SearchItems';
import ItemDetails from './pages/ItemDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Profile from './pages/Profile';
import Support from './pages/Support';
import AddItem from './pages/AddItem';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/search" element={<SearchItems />} />
                    <Route path="/items/:id" element={<ItemDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/deliveries" element={<Deliveries />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/add-item" element={<AddItem />} />
                  </Routes>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;