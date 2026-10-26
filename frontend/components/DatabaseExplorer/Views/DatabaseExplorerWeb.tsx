import React from 'react';
import { useDatabaseExplorer } from '../useDatabaseExplorer';
import styles from '../DatabaseExplorer.module.scss';

export const DatabaseExplorerWeb: React.FC = () => {
  const {
    tables,
    activeTable,
    schema,
    columns,
    rows,
    total,
    searchInput,
    setSearchInput,
    handleSearchSubmit,
    handlePrevPage,
    handleNextPage,
    currentPage,
    totalPages,
    isLoadingData,
    selectTable,
    isJsonValue,
    handleOpenJsonModal,
  } = useDatabaseExplorer();

  return (
    <div className={styles.explorerLayoutWeb}>
      {/* 1. Left Sidebar: Table List */}
      <aside className={styles.sidebarWeb}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Tables</span>
          <span className={styles.tableCountBadge}>{tables.length}</span>
        </div>

        <div className={styles.tableList}>
          {tables.map((t) => (
            <button
              key={t.name}
              className={`${styles.tableItem} ${activeTable === t.name ? styles.active : ''}`}
              onClick={() => selectTable(t.name)}
            >
              <span>{t.name}</span>
              <span className={styles.rowCount}>{t.rowCount}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className={styles.mainContentWeb}>
        {/* Table Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.tableTitleArea}>
            <span className={styles.tableName}>{activeTable || 'Select Table'}</span>
            <span className={styles.totalRecords}>
              {isLoadingData ? 'Querying...' : `${total} records`}
            </span>
          </div>

          <form className={styles.searchBox} onSubmit={handleSearchSubmit}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        {/* Schema Inspector Bar */}
        {schema.length > 0 && (
          <div className={styles.schemaBar}>
            <span className={styles.schemaLabel}>Schema:</span>
            {schema.map((col) => (
              <span key={col.name} className={styles.columnPill}>
                <span>{col.name}</span>
                <span className={styles.colType}>{col.type || 'ANY'}</span>
                {col.pk === 1 && <span className={styles.pkBadge}>PK</span>}
              </span>
            ))}
          </div>
        )}

        {/* Data Grid */}
        <div className={styles.tableContainer}>
          {isLoadingData ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Querying table in Web Worker...
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              No rows found in table {activeTable}.
            </div>
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {columns.map((col) => {
                      const val = row[col];
                      const isJson = isJsonValue(val);

                      return (
                        <td key={col}>
                          {isJson ? (
                            <button
                              className={styles.jsonBadge}
                              onClick={() => handleOpenJsonModal(col, val)}
                              title="Click to inspect formatted JSON"
                            >
                              <span>{'{...}'}</span>
                              <span>View JSON</span>
                            </button>
                          ) : val === null || val === undefined ? (
                            <span className={styles.nullCell}>null</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className={styles.paginationBar}>
          <div className={styles.pageInfo}>
            Page {currentPage} of {totalPages} ({total} total rows)
          </div>
          <div className={styles.navButtons}>
            <button onClick={handlePrevPage} disabled={currentPage <= 1 || isLoadingData}>
              ← Previous
            </button>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages || isLoadingData}>
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
