import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  
  // --- BADLAV: Default values ko khaali kar diya gaya hai ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- BADLAV END ---

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await login(email, password);
    if (error) {
      setError(error.message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 820); // Match shake animation duration
    } else {
      // Login safal hone par user ko uske role ke hisaab se redirect karein
      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (loggedInUser.role === 'admin') {
          navigate('/admin/dashboard');
      } else {
          navigate('/account');
      }
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');
    // --- BADLAV: Admin ka password yahaan se set karein (database waala password) ---
    const { error } = await login('admin@kiranastore.com', '123456');
    if (error) {
      setError("Admin login failed. Make sure admin user exists with these credentials.");
      setShakeError(true);
      setTimeout(() => setShakeError(false), 820);
    } else {
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className={`w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-soft ${shakeError ? 'animate-shake' : ''}`}>
        <h2 className="text-3xl font-bold text-center text-text-primary">Welcome Back!</h2>
        {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-md">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email Address" 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading}
            // Browser autofill ko rokne ke liye
            autoComplete="off"
          />
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading}
            autoComplete="current-password"
          />
          <div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : 'Sign In'}
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>
        <Button onClick={handleAdminLogin} variant="secondary" className="w-full" disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : 'Login as Admin'}
        </Button>
        <p className="text-center text-sm text-text-secondary">
          Don't have an account? <Link to="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
