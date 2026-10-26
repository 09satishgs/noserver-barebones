// Non-generic Character Detail hook (commented out for barebones reference; use in forked apps):
/*
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useSystemStore } from '../../store/useSystemStore';

export function useCharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCharacter, isLoadingDetail, fetchCharacterById, clearSelected } =
    useCharacterStore();
  const { phase } = useSystemStore();

  useEffect(() => {
    if (id && phase === 'ready') {
      fetchCharacterById(id);
    }

    return () => {
      clearSelected();
    };
  }, [id, phase]);

  const handleBack = () => {
    navigate('/');
  };

  return {
    character: selectedCharacter,
    isLoading: isLoadingDetail,
    handleBack,
  };
}
*/
export function useCharacterDetail(): any {
  return {
    character: null,
    isLoading: false,
    handleBack: () => {},
  };
}
