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
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 sm:p-6 shadow-card">
      <div className="mb-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#5263D9] hover:underline mb-2.5 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Reset Password
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Enter your registered email address to receive recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-emerald-900 font-heading">Check your inbox</h4>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            We have dispatched password reset instructions to <strong>{email}</strong>.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block text-xs font-semibold text-[#5263D9] hover:underline"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

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

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 py-2 text-xs font-semibold"
            loading={loading}
          >
            Send Reset Link
          </Button>
        </form>
      )}
    </div>
  );
};
