import React from 'react';
import { useCharacterList } from '../useCharacterList';
import styles from '../CharacterList.module.scss';

export const CharacterListMobile: React.FC = () => {
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
          placeholder="Filter characters..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <span className={styles.countBadge}>{total}</span>
      </div>

      {isLoading && characters.length === 0 ? (
        <div className={styles.loadingState}>
          <div className={styles.icon}>⚡</div>
          <h3>Loading database...</h3>
        </div>
      ) : characters.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No characters found</h3>
        </div>
      ) : (
        <div className={styles.listMobile}>
          {characters.map((char: any) => (
            <div
              key={char.id}
              className={styles.cardMobile}
              onClick={() => handleSelectCharacter(char)}
            >
              <div className={styles.mobileTitleRow}>
                <span className={styles.name}>{char.name}</span>
                {char.affiliation && (
                  <span className={styles.affiliation}>{char.affiliation}</span>
                )}
              </div>
              <div className={styles.mobileSub}>
                {char.crest ? `Crest: ${char.crest}` : char.unique_talent}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
