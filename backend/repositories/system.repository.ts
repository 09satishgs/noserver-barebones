import { dbManager } from '../database/connection';
import { DEFAULT_SQLITE_GZ_URL } from '../database/seeder';
import { SystemStatus } from '../types/models';
import { ISystemRepository } from './interfaces';

export class SystemRepository implements ISystemRepository {
  private lastSyncedAt?: string;
  private currentSyncUrl: string = DEFAULT_SQLITE_GZ_URL;

  public setLastSynced(url: string) {
    this.lastSyncedAt = new Date().toISOString();
    this.currentSyncUrl = url;
  }

  public async getAllTableNames(): Promise<string[]> {
    const conn = dbManager.getConnection();
    const rows = conn.queryAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC"
    );
    return rows.map((r) => r.name);
  }

  public async getStatus(): Promise<SystemStatus> {
    const conn = dbManager.getConnection();
    const tables = await this.getAllTableNames();
    const charCountRow = conn.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM characters');

    return {
      isInitialized: true,
      dbType: conn.dbType,
      characterCount: charCountRow ? Number(charCountRow.count) : 0,
      tableCount: tables.length,
      tables,
      lastSyncedAt: this.lastSyncedAt,
      syncUrl: this.currentSyncUrl,
    };
  }
}
