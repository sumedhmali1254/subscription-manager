import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Input } from '../../components/forms/Input';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError('Could not process reset request. Please check email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-7 sm:p-9 shadow-card">
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#5263D9] hover:underline mb-4 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Reset Your Password
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Enter your registered email address and we'll send you recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-emerald-900 font-heading">Check your inbox</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            We've sent a password reset link to <strong className="font-semibold">{email}</strong>.
            Please check your spam folder if it doesn't arrive within 2 minutes.
          </p>
          <div className="pt-2">
            <Link
              to="/reset-password?token=mock-token-sample"
              className="text-xs font-semibold text-[#5263D9] hover:underline"
            >
              [Demo Test] Open Reset Password Screen →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <FormField label="Registered Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@brightloop.io"
              icon={Mail}
              autoComplete="email"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
          >
            Send Reset Instructions
          </Button>
        </form>
      )}
    </div>
  );
};

