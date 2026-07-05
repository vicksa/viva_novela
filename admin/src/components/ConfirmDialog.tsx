import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Excluir',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--danger, #ef4444)" />
            {title}
          </h2>
          <button className="close-button" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" className="glass-button secondary" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </button>
          <button
            type="button"
            className="glass-button"
            style={{ flex: 1, background: 'var(--danger, #ef4444)' }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Excluindo...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
