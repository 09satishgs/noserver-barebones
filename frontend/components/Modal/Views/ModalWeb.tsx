import React, { PropsWithChildren } from 'react';
import { useModal, UseModalProps } from '../useModal';
import styles from '../Modal.module.scss';

export interface ModalWebProps extends PropsWithChildren, UseModalProps {}

export const ModalWeb: React.FC<ModalWebProps> = ({ children, title, onClose }) => {
  const { handleClose } = useModal({ onClose, title });

  return (
    <div className={styles.modalWeb}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            ×
          </button>
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
};
