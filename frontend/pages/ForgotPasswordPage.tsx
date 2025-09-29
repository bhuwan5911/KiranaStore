import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader, Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setMessage(data.message);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-soft">
                <div className="text-center">
                    <Mail size={48} className="mx-auto text-primary" />
                    <h2 className="mt-4 text-3xl font-bold text-text-primary">Forgot Password</h2>
                    <p className="mt-2 text-text-secondary">Enter your email and we'll send you a link to reset your password.</p>
                </div>
                
                {message && <p className="text-green-600 text-center bg-green-50 p-3 rounded-md">{message}</p>}
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input 
                        label="Email Address" 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                    <div>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? <Loader className="animate-spin" /> : 'Send Reset Link'}
                        </Button>
                    </div>
                </form>
                <p className="text-center text-sm text-text-secondary">
                    Remember your password? <Link to="/admin-login" className="font-medium text-primary hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};