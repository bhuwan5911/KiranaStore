import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Eye icons ko import karein

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', type, ...props }) => {
  // --- BADLAV START ---
  // Ek state banayein jo password ke visible hone ko track karegi
  const [showPassword, setShowPassword] = useState(false);

  // Toggle function jo state ko badlega
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Agar input ka type 'password' hai, to icon dikhayein
  const isPassword = type === 'password';
  // --- BADLAV END ---

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {/* --- BADLAV START --- */}
      {/* Input aur icon ko ek relative container mein daalein */}
      <div className="relative">
        <input
          id={id}
          // Agar yeh password field hai, to type ko state ke hisaab se badlein
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          // Icon ke liye jagah banane ke liye right padding add karein
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isPassword ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {/* Agar yeh password field hai, to icon button ko render karein */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {/* --- BADLAV END --- */}
    </div>
  );
};