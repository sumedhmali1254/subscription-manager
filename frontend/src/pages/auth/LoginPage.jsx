import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/forms/Input';
import { FormField } from '../../components/forms/FormField';
import { Checkbox } from '../../components/forms/Checkbox';
import { Button } from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      const res = await login({ email, password, rememberMe });
      if (res?.user?.role === 'CUSTOMER') {
        navigate('/portal');
      } else {
        navigate(from === '/portal' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 sm:p-6 shadow-card">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Sign In
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Enter your credentials to access your subscription workspace.
        </p>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Email Address" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@brightloop.io"
            icon={Mail}
            autoComplete="email"
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            }
          />
        </FormField>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            label="Remember me"
          />
          <Link
            to="/forgot-password"
            className="text-[#5263D9] hover:underline font-medium text-[11px]"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2 py-2 text-xs font-semibold"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-4 text-center text-xs text-[#64748B] pt-3 border-t border-[#E7EAF0]">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-[#5263D9] font-semibold hover:underline">
          Create customer account
        </Link>
      </div>
    </div>
  );
};
