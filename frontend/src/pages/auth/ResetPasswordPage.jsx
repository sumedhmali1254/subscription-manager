import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Input } from '../../components/forms/Input';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { checkPasswordStrength } from '../../utils/validators';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = checkPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (strength.score < 3) {
      setError('Password must have 8+ characters, uppercase, lowercase, and special characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword('sample-token', password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 sm:p-6 shadow-card">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Set New Password
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Create a secure password with at least 8 characters.
        </p>
      </div>

      {success ? (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="text-xs font-bold text-emerald-900 font-heading">Password Reset Successful!</h4>
          <p className="text-[11px] text-emerald-700">Redirecting you to sign in...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <FormField label="New Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

          <FormField label="Confirm New Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 py-2 text-xs font-semibold"
            loading={loading}
          >
            Update Password
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-[#5263D9] hover:underline font-semibold">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
