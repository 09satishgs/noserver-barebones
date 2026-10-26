// Non-generic Character List hook (commented out for barebones reference; use in forked apps):
/*
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useSystemStore } from '../../store/useSystemStore';
import { Character } from '../../../backend/types/models';

export function useCharacterList() {
  const navigate = useNavigate();
  const { characters, total, isLoading, searchQuery, setSearchQuery, fetchCharacters } =
    useCharacterStore();
  const { phase } = useSystemStore();

  useEffect(() => {
    if (phase === 'ready' && characters.length === 0) {
      fetchCharacters();
    }
  }, [phase]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectCharacter = (character: Character) => {
    navigate(`/characters/${character.id || character.slug}`);
  };

  return {
    characters,
    total,
    isLoading,
    searchQuery,
    handleSearchChange,
    handleSelectCharacter,
  };
}
*/
export function useCharacterList(): any {
  return {
    characters: [],
    total: 0,
    isLoading: false,
    searchQuery: '',
    handleSearchChange: () => {},
    handleSelectCharacter: () => {},
  };
}
