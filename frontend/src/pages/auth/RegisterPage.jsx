import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/forms/Input';
import { FormField } from '../../components/forms/FormField';
import { Checkbox } from '../../components/forms/Checkbox';
import { Button } from '../../components/common/Button';
import { validateEmail, checkPasswordStrength } from '../../utils/validators';
import { Eye, EyeOff, Lock, Mail, User, Building, ArrowRight, Check, X } from 'lucide-react';

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
    if (strength.score < 4) {
      setError('Please choose a stronger password that satisfies all security requirements.');
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
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-7 sm:p-9 shadow-card">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Create Customer Account
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Get started with self-service subscription & billing management.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField label="Full Name" required>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            icon={User}
          />
        </FormField>

        <FormField label="Email Address" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@acme.com"
            icon={Mail}
          />
        </FormField>

        <FormField label="Company Name">
          <Input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Technologies"
            icon={Building}
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            icon={Lock}
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

        {/* Real-time Password Strength Feedback */}
        {password && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Strength: <strong className="text-[#202744]">{strength.label}</strong></span>
              <span className="text-[11px] text-[#64748B]">{strength.percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${strength.percentage}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 text-[#64748B]">
              <div className={`flex items-center gap-1 ${strength.checks.length ? 'text-emerald-600' : ''}`}>
                {strength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                8+ characters
              </div>
              <div className={`flex items-center gap-1 ${strength.checks.uppercase ? 'text-emerald-600' : ''}`}>
                {strength.checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                Uppercase letter
              </div>
              <div className={`flex items-center gap-1 ${strength.checks.lowercase ? 'text-emerald-600' : ''}`}>
                {strength.checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                Lowercase letter
              </div>
              <div className={`flex items-center gap-1 ${strength.checks.special ? 'text-emerald-600' : ''}`}>
                {strength.checks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                Special symbol
              </div>
            </div>
          </div>
        )}

        <FormField label="Confirm Password" required>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            icon={Lock}
          />
        </FormField>

        <div className="pt-1">
          <Checkbox
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            label="I accept the Brightloop Terms of Service and Privacy Policy"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-[#64748B] pt-4 border-t border-[#E7EAF0]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#5263D9] font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

