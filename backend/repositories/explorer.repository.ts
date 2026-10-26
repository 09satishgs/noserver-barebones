import { dbManager } from '../database/connection';

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableSummary {
  name: string;
  rowCount: number;
}

export interface TableDataResult {
  columns: string[];
  rows: Record<string, any>[];
  total: number;
}

export class ExplorerRepository {
  public async getTables(): Promise<TableSummary[]> {
    const conn = dbManager.getConnection();
    const tableRows = conn.queryAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC"
    );

    const summaries: TableSummary[] = [];
    for (const row of tableRows) {
      try {
        const countRow = conn.queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM "${row.name}"`);
        summaries.push({
          name: row.name,
          rowCount: countRow ? Number(countRow.count) : 0,
        });
      } catch {
        summaries.push({ name: row.name, rowCount: 0 });
      }
    }

    return summaries;
  }

  public async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    const conn = dbManager.getConnection();
    const rows = conn.queryAll<ColumnInfo>(`PRAGMA table_info("${tableName}")`);
    return rows;
  }

  public async getTableData(
    tableName: string,
    options: { limit?: number; offset?: number; search?: string }
  ): Promise<TableDataResult> {
    const conn = dbManager.getConnection();
    const schema = await this.getTableSchema(tableName);
    const columns = schema.map((c) => c.name);

    const limit = options.limit ?? 25;
    const offset = options.offset ?? 0;
    const search = options.search?.trim();

    let whereClause = '';
    const bindings: any[] = [];

    if (search && search.length > 0) {
      // Filter across text/varchar/char columns
      const textCols = schema
        .filter((c) => {
          const type = (c.type || '').toUpperCase();
          return type.includes('CHAR') || type.includes('TEXT') || type.includes('CLOB') || type === '';
        })
        .map((c) => `"${c.name}" LIKE ?`);

      if (textCols.length > 0) {
        whereClause = `WHERE (${textCols.join(' OR ')})`;
        const term = `%${search}%`;
        for (let i = 0; i < textCols.length; i++) {
          bindings.push(term);
        }
      }
    }

    const countSql = `SELECT COUNT(*) as total FROM "${tableName}" ${whereClause}`;
    const totalRow = conn.queryOne<{ total: number }>(countSql, bindings);
    const total = totalRow ? Number(totalRow.total) : 0;

    const dataSql = `SELECT * FROM "${tableName}" ${whereClause} LIMIT ? OFFSET ?`;
    const rows = conn.queryAll<Record<string, any>>(dataSql, [...bindings, limit, offset]);

    return {
      columns,
      rows,
      total,
    };
  }
}
