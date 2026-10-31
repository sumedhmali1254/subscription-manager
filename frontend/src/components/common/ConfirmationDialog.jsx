import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This operation cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  type = 'danger',
}) => {
  const icons = {
    danger: <AlertTriangle className="w-10 h-10 text-rose-500" />,
    warning: <AlertCircle className="w-10 h-10 text-amber-500" />,
    info: <Info className="w-10 h-10 text-indigo-500" />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={!loading}>
      <div className="flex flex-col items-center text-center p-2">
        <div className="p-3 bg-slate-50 rounded-full mb-3">
          {icons[type] || icons.danger}
        </div>
        <h4 className="text-lg font-bold text-[#202744] font-heading">{title}</h4>
        <p className="text-sm text-[#64748B] mt-2 leading-relaxed">{message}</p>

        <div className="flex items-center gap-3 mt-6 w-full">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

