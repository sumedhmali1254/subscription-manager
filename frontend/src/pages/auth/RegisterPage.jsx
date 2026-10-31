import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/forms/Input';
import { FormField } from '../../components/forms/FormField';
import { Checkbox } from '../../components/forms/Checkbox';
import { Button } from '../../components/common/Button';
import { validateEmail, checkPasswordStrength } from '../../utils/validators';
import { Eye, EyeOff, Lock, Mail, User, Building, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const strength = checkPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email || !validateEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (strength.score < 3) {
      setError('Password must have 8+ characters, uppercase, lowercase, and special characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the terms of service.');
      return;
    }

    try {
      await register({ name, email, company, password });
      navigate('/portal');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 sm:p-6 shadow-card">
      <div className="mb-3.5">
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Create Account
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Sign up for self-service subscription and billing management.
        </p>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <FormField label="Full Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              icon={User}
            />
          </FormField>

          <FormField label="Company Name">
            <Input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Tech"
              icon={Building}
            />
          </FormField>
        </div>

        <FormField label="Email Address" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. priya@acme.com"
            icon={Mail}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <FormField label="Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
              icon={Lock}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              }
            />
          </FormField>

          <FormField label="Confirm Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              icon={Lock}
            />
          </FormField>
        </div>

        {/* Minimal Password Strength Meter */}
        {password && (
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${strength.percentage}%` }}
              />
            </div>
            <span className="text-[10px] text-[#64748B] shrink-0 font-medium">
              {strength.label}
            </span>
          </div>
        )}

        <div className="pt-0.5">
          <Checkbox
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            label="I accept the Terms of Service & Privacy Policy"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-1 py-2 text-xs font-semibold"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
        >
          Create Customer Account
        </Button>
      </form>

      <div className="mt-3.5 text-center text-xs text-[#64748B] pt-2.5 border-t border-[#E7EAF0]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#5263D9] font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
