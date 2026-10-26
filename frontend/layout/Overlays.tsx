import React from 'react';
import { useOverlayStore } from '../store/useOverlayStore';
import styles from './Overlays.module.scss';

export const Overlays: React.FC = () => {
  const { toasts, removeToast, modal, closeModal } = useOverlayStore();

  return (
    <>
      {/* Toast Notification Container */}
      <div className={styles.toastContainer} role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className={styles.icon}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <span className={styles.message}>{toast.message}</span>
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Global Modal Host */}
      {modal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            {modal.title && (
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>{modal.title}</h3>
                <button className={styles.modalClose} onClick={closeModal}>
                  ×
                </button>
              </div>
            )}
            <div className={styles.modalBody}>{modal.content}</div>
          </div>
        </div>
      )}
    </>
  );
};
