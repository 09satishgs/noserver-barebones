import React from 'react';
import { useCharacterDetail } from '../useCharacterDetail';
import styles from '../CharacterDetail.module.scss';

export const CharacterDetailMobile: React.FC = () => {
  const { character, isLoading, handleBack } = useCharacterDetail();

  if (isLoading || !character) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← Back
        </button>
        <p style={{ textAlign: 'center', padding: 20 }}>Loading character...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleBack}>
        ← Back to Roster
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.name}>{character.name}</h2>
          {character.affiliation && (
            <span className={styles.affiliation}>{character.affiliation}</span>
          )}
        </div>

        <div className={styles.content}>
          {character.crest && (
            <div className={styles.infoBox}>
              <div className={styles.label}>Crest</div>
              <div className={styles.value}>{character.crest}</div>
            </div>
          )}

          {character.unique_talent && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Talent</div>
              <div className={styles.box}>{character.unique_talent}</div>
            </div>
          )}

          {character.voice_actor_en && (
            <div className={styles.infoBox}>
              <div className={styles.label}>VA (EN)</div>
              <div className={styles.value}>{character.voice_actor_en}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
