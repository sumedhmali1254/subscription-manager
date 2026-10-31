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

    if (strength.score < 4) {
      setError('Password does not meet minimum complexity criteria.');
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
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError('Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-7 sm:p-9 shadow-card">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#202744] font-heading">
          Set New Password
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Create a secure password with at least 8 characters and numbers/symbols.
        </p>
      </div>

      {success ? (
        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-bold text-emerald-900 font-heading">Password Reset Successful!</h4>
          <p className="text-xs text-emerald-700">Redirecting to sign in screen...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <FormField label="New Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              icon={Lock}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </FormField>

          <FormField label="Confirm New Password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              icon={Lock}
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
          >
            Update Password
          </Button>
        </form>
      )}
    </div>
  );
};

