import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setMessage(data.message);
            setTimeout(() => navigate('/admin-login'), 3000); // 3 second baad login page par bhejein

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
                    <KeyRound size={48} className="mx-auto text-primary" />
                    <h2 className="mt-4 text-3xl font-bold text-text-primary">Set New Password</h2>
                </div>
                
                {message && <p className="text-green-600 text-center bg-green-50 p-3 rounded-md">{message}</p>}
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input 
                        label="New Password" 
                        id="password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                    <Input 
                        label="Confirm New Password" 
                        id="confirmPassword" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                    <div>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? <Loader className="animate-spin" /> : 'Reset Password'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};