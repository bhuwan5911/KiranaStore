import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader, Shield } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, user } = useAppContext();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: loginError } = await login(email, password);
    
    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 820);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user && user.role !== 'admin') {
        setError('Access Denied. This login is for administrators only.');
    }
  }, [user, navigate]);


  return (
    <div className="flex justify-center items-center min-h-[60vh] animate-slide-in-up">
      <div className={`w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-soft ${shakeError ? 'animate-shake' : ''}`}>
        <div className="text-center">
            <Shield size={48} className="mx-auto text-primary" />
            <h2 className="mt-4 text-3xl font-bold text-text-primary">Admin Sign In</h2>
        </div>
        {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Admin Email" 
            id="email" 
            type="email" 
            placeholder="admin@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading}
            autoComplete="email"
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
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot Password?
            </Link>
          </div>
          <div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : 'Sign In'}
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-text-secondary">
          Not an admin? <Link to="/login" className="font-medium text-primary hover:underline">Go back to user login</Link>
        </p>
      </div>
    </div>
  );
};

