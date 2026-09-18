import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation Required',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-700/60">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
