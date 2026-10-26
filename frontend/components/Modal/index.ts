import React, { PropsWithChildren } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ModalWeb, ModalWebProps } from './Views/ModalWeb';
import { ModalMobile } from './Views/ModalMobile';

export interface ModalProps extends PropsWithChildren, ModalWebProps {}

export const Modal: React.FC<ModalProps> = (props) => {
  const breakpoint = useBreakpoint();
  return React.createElement(breakpoint === 'web' ? ModalWeb : ModalMobile, props);
};

export default Modal;
