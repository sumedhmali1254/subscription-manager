import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/forms/Input';
import { FormField } from '../../components/forms/FormField';
import { Checkbox } from '../../components/forms/Checkbox';
import { Button } from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Users } from 'lucide-react';

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
      if (res.user.role === 'CUSTOMER') {
        navigate('/portal');
      } else {
        navigate(from === '/portal' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    }
  };

  const fillCredentials = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@brightloop.io');
      setPassword('Password@123');
    } else if (role === 'STAFF') {
      setEmail('staff@brightloop.io');
      setPassword('Password@123');
    } else {
      setEmail('customer@acme.com');
      setPassword('Password@123');
    }
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-7 sm:p-9 shadow-card">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Sign In to Recurix
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Access your Brightloop subscription operations workspace.
        </p>
      </div>

      {/* Quick Demo Fill Buttons for Hackathon Jury */}
      <div className="mb-6 p-3 bg-[#EEF0FD]/60 border border-indigo-100 rounded-xl">
        <span className="text-[11px] font-semibold text-[#5263D9] uppercase tracking-wider block mb-2">
          Demo Quick Fill Accounts:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('ADMIN')}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-[#5263D9] shadow-2xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('STAFF')}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            Staff
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('CUSTOMER')}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            Customer
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Enter your password"
            icon={Lock}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </FormField>

        <div className="flex items-center justify-between text-xs pt-1">
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            label="Remember me"
          />
          <Link
            to="/forgot-password"
            className="text-[#5263D9] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-[#64748B] pt-4 border-t border-[#E7EAF0]">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-[#5263D9] font-semibold hover:underline">
          Create customer account
        </Link>
      </div>
    </div>
  );
};

