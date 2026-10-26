import React from 'react';
import { useCharacterDetail } from '../useCharacterDetail';
import styles from '../CharacterDetail.module.scss';

export const CharacterDetailWeb: React.FC = () => {
  const { character, isLoading, handleBack } = useCharacterDetail();

  if (isLoading || !character) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← Back to Roster
        </button>
        <div className={styles.card} style={{ padding: 40, textAlign: 'center' }}>
          <h3>Fetching character record from in-browser SQLite...</h3>
        </div>
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
          <div>
            <h1 className={styles.name}>{character.name}</h1>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>ID: {character.id}</span>
          </div>
          {character.affiliation && (
            <span className={styles.affiliation}>{character.affiliation}</span>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.grid}>
            {character.crest && (
              <div className={styles.infoBox}>
                <div className={styles.label}>Bloodmark / Crest</div>
                <div className={styles.value}>{character.crest}</div>
              </div>
            )}
            {character.birthday && (
              <div className={styles.infoBox}>
                <div className={styles.label}>Birthday</div>
                <div className={styles.value}>{character.birthday}</div>
              </div>
            )}
            {character.voice_actor_en && (
              <div className={styles.infoBox}>
                <div className={styles.label}>Voice Actor (EN)</div>
                <div className={styles.value}>{character.voice_actor_en}</div>
              </div>
            )}
            {character.voice_actor_jp && (
              <div className={styles.infoBox}>
                <div className={styles.label}>Voice Actor (JP)</div>
                <div className={styles.value}>{character.voice_actor_jp}</div>
              </div>
            )}
          </div>

          {character.unique_talent && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Unique Exploration Talent</div>
              <div className={styles.box}>{character.unique_talent}</div>
            </div>
          )}

          {character.likes && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Likes</div>
              <div className={styles.box}>{character.likes}</div>
            </div>
          )}

          {character.dislikes && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Dislikes</div>
              <div className={styles.box}>{character.dislikes}</div>
            </div>
          )}

          {character.interests && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Interests</div>
              <div className={styles.box}>{character.interests}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
