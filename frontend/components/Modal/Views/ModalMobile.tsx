import React, { PropsWithChildren } from 'react';
import { useModal, UseModalProps } from '../useModal';
import styles from '../Modal.module.scss';

export interface ModalMobileProps extends PropsWithChildren, UseModalProps {}

export const ModalMobile: React.FC<ModalMobileProps> = ({ children, title, onClose }) => {
  const { handleClose } = useModal({ onClose, title });

  return (
    <div className={styles.modalMobile}>
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
