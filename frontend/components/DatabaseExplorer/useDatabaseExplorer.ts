import React, { useEffect, useState } from 'react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { useOverlayStore } from '../../store/useOverlayStore';
import styles from './DatabaseExplorer.module.scss';

export function useDatabaseExplorer() {
  const {
    tables,
    activeTable,
    schema,
    columns,
    rows,
    total,
    limit,
    offset,
    search,
    isLoadingTables,
    isLoadingData,
    fetchTables,
    selectTable,
    setSearch,
    setPage,
  } = useExplorerStore();

  const { openModal, addToast } = useOverlayStore();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setPage(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setPage(offset + limit);
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Determine if a cell's value is JSON (object, array, or JSON string)
  const isJsonValue = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'object') return true;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          JSON.parse(trimmed);
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  };

  // Open JSON drilldown modal
  const handleOpenJsonModal = (columnName: string, rawVal: any) => {
    let parsed = rawVal;
    if (typeof rawVal === 'string') {
      try {
        parsed = JSON.parse(rawVal);
      } catch {
        parsed = rawVal;
      }
    }

    const formatted = JSON.stringify(parsed, null, 2);

    openModal({
      title: `JSON Reader: ${columnName}`,
      content: React.createElement('div', { className: styles.jsonModalViewer }, [
        React.createElement('div', { key: 'header', className: styles.jsonHeader }, [
          React.createElement('span', { key: 'col', className: styles.colName }, `${columnName}`),
          React.createElement(
            'button',
            {
              key: 'copy',
              className: styles.copyBtn,
              onClick: () => {
                navigator.clipboard.writeText(formatted);
                addToast('Copied JSON to clipboard!', 'success');
              },
            },
            '📋 Copy JSON'
          ),
        ]),
        React.createElement('pre', { key: 'code', className: styles.codeBox }, formatted),
      ]),
    });
  };

  return {
    tables,
    activeTable,
    schema,
    columns,
    rows,
    total,
    limit,
    offset,
    searchInput,
    setSearchInput,
    handleSearchSubmit,
    handlePrevPage,
    handleNextPage,
    currentPage,
    totalPages,
    isLoadingTables,
    isLoadingData,
    selectTable,
    isJsonValue,
    handleOpenJsonModal,
  };
}
