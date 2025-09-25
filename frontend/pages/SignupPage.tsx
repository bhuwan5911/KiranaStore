import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUp, addToast } = useAppContext();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signUp(name, email, password);

    if (error) {
      setError(error.message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 820);
    } else {
      addToast('Account created successfully! Please check your email to verify your account.', 'success');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className={`w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md ${shakeError ? 'animate-shake' : ''}`}>
        <h2 className="text-3xl font-bold text-center text-text-primary">Create an Account</h2>
        {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-md">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-6">
          <Input 
            label="Full Name" 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            value={name}
            onChange={e => setName(e.target.value)}
            required 
            disabled={loading}
          />
          <Input 
            label="Email Address" 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
            disabled={loading}
          />
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
            disabled={loading}
          />
          <div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader className="animate-spin"/> : 'Sign Up'}
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};