import { useOverlayStore } from '../../store/useOverlayStore';

export interface UseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

export function useModal(props?: UseModalProps) {
  const { closeModal } = useOverlayStore();

  const handleClose = () => {
    props?.onClose?.();
    closeModal();
  };

  return {
    handleClose,
    title: props?.title,
  };
}
