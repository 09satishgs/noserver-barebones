import {
  ExplorerRepository,
  TableSummary,
  ColumnInfo,
  TableDataResult,
} from '../repositories/explorer.repository';

export class ExplorerService {
  constructor(private explorerRepo: ExplorerRepository) {}

  public async getTables(): Promise<TableSummary[]> {
    return this.explorerRepo.getTables();
  }

  private async validateTable(tableName: string): Promise<void> {
    if (!tableName || tableName.trim() === '') {
      throw new Error('Table name is required');
    }

    const tables = await this.explorerRepo.getTables();
    const exists = tables.some((t) => t.name.toLowerCase() === tableName.trim().toLowerCase());
    if (!exists) {
      throw new Error(`Table '${tableName}' does not exist in the database`);
    }
  }

  public async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    await this.validateTable(tableName);
    return this.explorerRepo.getTableSchema(tableName.trim());
  }

  public async getTableData(
    tableName: string,
    options: { limit?: number; offset?: number; search?: string }
  ): Promise<TableDataResult> {
    await this.validateTable(tableName);
    return this.explorerRepo.getTableData(tableName.trim(), options);
  }
}
