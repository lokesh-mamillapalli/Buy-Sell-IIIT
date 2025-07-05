import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import './styling/Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the CAPTCHA');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          captchaToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user, data.token);
      navigate('/profile'); // Changed from '/' to '/profile'
    } catch (err) {
      setError(err.message);
      recaptchaRef.current.reset();
    }
  };

  const handleCASLogin = () => {
    window.location.href = 'https://login.iiit.ac.in/cas/login';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold">Login</h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm input-height"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm input-height"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Leb8MMqAAAAAPWOPT_b8kt1jTuawSKfCuOyBZEn"
              onChange={handleCaptchaChange}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </form>
        <div className="mt-4">
          <button
            onClick={handleCASLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Login with IIIT CAS
          </button>
        </div>
        <div className="text-center mt-4">
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;