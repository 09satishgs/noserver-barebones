import React from 'react';
import { useCharacterList } from '../useCharacterList';
import styles from '../CharacterList.module.scss';

export const CharacterListWeb: React.FC = () => {
  const {
    characters,
    total,
    isLoading,
    searchQuery,
    handleSearchChange,
    handleSelectCharacter,
  } = useCharacterList();

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.input}
          placeholder="Search characters by name, affiliation, or talent..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <span className={styles.countBadge}>
          {isLoading ? 'Querying...' : `${characters.length} of ${total}`}
        </span>
      </div>

      {isLoading && characters.length === 0 ? (
        <div className={styles.loadingState}>
          <div className={styles.icon}>⚡</div>
          <h3>Querying In-Browser SQLite DB...</h3>
          <p>Worker is evaluating SQL query via OPFS...</p>
        </div>
      ) : characters.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.icon}>⚔️</div>
          <h3>No characters matched your query</h3>
          <p>Try searching for a different name, affiliation, or talent keyword.</p>
        </div>
      ) : (
        <div className={styles.gridWeb}>
          {characters.map((char: any) => (
            <div
              key={char.id}
              className={styles.cardWeb}
              onClick={() => handleSelectCharacter(char)}
            >
              <div>
                <div className={styles.cardHeader}>
                  <h4 className={styles.name}>{char.name}</h4>
                  {char.affiliation && (
                    <span className={styles.affiliation}>{char.affiliation}</span>
                  )}
                </div>

                <div className={styles.metaRow}>
                  {char.crest && (
                    <span className={styles.metaItem}>
                      <strong>Crest:</strong> {char.crest}
                    </span>
                  )}
                  {char.voice_actor_en && (
                    <span className={styles.metaItem}>
                      <strong>VA (EN):</strong> {char.voice_actor_en}
                    </span>
                  )}
                  {char.birthday && (
                    <span className={styles.metaItem}>
                      <strong>Birthday:</strong> {char.birthday}
                    </span>
                  )}
                </div>
              </div>

              {char.unique_talent && (
                <div className={styles.talentSnippet}>
                  <strong>Talent:</strong> {char.unique_talent}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
