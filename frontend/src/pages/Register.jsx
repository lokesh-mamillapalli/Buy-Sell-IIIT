import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import './styling/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
        throw new Error(data.error || 'Registration failed');
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold">Register</h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm input-height"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm input-height"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (@iiit.ac.in)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              pattern="^[a-zA-Z0-9._%+-]+@.*iiit\.ac\.in$"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm input-height"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              required
              min="16"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm input-height"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm input-height"
              value={formData.contactNumber}
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
              minLength="6"
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
              Register
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;