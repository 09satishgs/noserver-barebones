import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { CharacterListWeb } from './Views/CharacterListWeb';
import { CharacterListMobile } from './Views/CharacterListMobile';

export const CharacterList: React.FC = () => {
  const breakpoint = useBreakpoint();
  return React.createElement(breakpoint === 'web' ? CharacterListWeb : CharacterListMobile);
};

export default CharacterList;
