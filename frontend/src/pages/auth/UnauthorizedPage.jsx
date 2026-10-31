import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-[#202744] font-heading">Access Denied (403)</h1>
      <p className="text-sm text-[#64748B] max-w-md mt-2 leading-relaxed">
        Your current role (<strong className="text-[#202744]">{user?.role || 'Guest'}</strong>) does not have sufficient permission to view this module.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          icon={ArrowLeft}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(user?.role === 'CUSTOMER' ? '/portal' : '/dashboard')}
          icon={Home}
        >
          Dashboard
        </Button>
      </div>
    </div>
  );
};

