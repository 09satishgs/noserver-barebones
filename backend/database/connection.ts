import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { downloadAndDecompressSqliteGz, DEFAULT_SQLITE_GZ_URL, ProgressCallback } from './seeder';

export interface DatabaseConnection {
  db: any;
  sqlite3: any;
  dbType: 'OPFS';
  queryAll<T = any>(sql: string, bind?: any[]): T[];
  queryOne<T = any>(sql: string, bind?: any[]): T | null;
  execute(sql: string, bind?: any[]): void;
  close(): void;
}

const DB_FILENAME = '/fefw.sqlite';
const RAW_FILENAME = 'fefw.sqlite';

class DatabaseManager {
  private sqlite3: any = null;
  private dbInstance: any = null;
  private dbType: 'OPFS' = 'OPFS';

  public async getSqlite() {
    if (!this.sqlite3) {
      this.sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });
    }
    return this.sqlite3;
  }

  private async opfsFileExists(filename: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) {
      return false;
    }
    try {
      const root = await navigator.storage.getDirectory();
      await root.getFileHandle(filename);
      return true;
    } catch {
      return false;
    }
  }

  private async writeToOpfs(filename: string, data: Uint8Array): Promise<void> {
    const root = await navigator.storage.getDirectory();
    const handle: any = await root.getFileHandle(filename, { create: true });
    // Prefer synchronous access handle in worker if available
    if ('createSyncAccessHandle' in handle) {
      const accessHandle = await handle.createSyncAccessHandle();
      accessHandle.truncate(0);
      accessHandle.write(data, { at: 0 });
      accessHandle.flush();
      accessHandle.close();
    } else {
      const writable = await handle.createWritable();
      await writable.write(data);
      await writable.close();
    }
  }

  public async initialize(
    url: string = DEFAULT_SQLITE_GZ_URL,
    forceDownload: boolean = false,
    onProgress?: ProgressCallback
  ): Promise<DatabaseConnection> {
    const sqlite3 = await this.getSqlite();

    if (this.dbInstance) {
      try {
        this.dbInstance.close();
      } catch (err) {
        console.warn('Error closing existing database instance:', err);
      }
      this.dbInstance = null;
    }

    const hasOpfs = !!sqlite3.oo1?.OpfsDb && typeof navigator !== 'undefined' && !!navigator.storage?.getDirectory;

    if (!hasOpfs) {
      throw new Error('OPFS storage is not supported or available in this browser environment');
    }

    const exists = await this.opfsFileExists(RAW_FILENAME);
    if (!exists || forceDownload) {
      onProgress?.('downloading', `Fetching remote database archive from ${url}...`);
      const decompressed = await downloadAndDecompressSqliteGz(url, onProgress);
      onProgress?.('extracting', 'Saving database binary to OPFS...');
      await this.writeToOpfs(RAW_FILENAME, decompressed);
    }

    this.dbInstance = new sqlite3.oo1.OpfsDb(DB_FILENAME, 'c');
    this.dbType = 'OPFS';

    return this.getConnection();
  }

  public async importBuffer(data: Uint8Array): Promise<DatabaseConnection> {
    const sqlite3 = await this.getSqlite();

    if (this.dbInstance) {
      try {
        this.dbInstance.close();
      } catch (err) {
        console.warn('Error closing existing database instance:', err);
      }
      this.dbInstance = null;
    }

    const hasOpfs = !!sqlite3.oo1?.OpfsDb && typeof navigator !== 'undefined' && !!navigator.storage?.getDirectory;
    if (!hasOpfs) {
      throw new Error('OPFS storage is not supported or available in this browser environment');
    }

    let finalData = data;
    // Auto-detect gzip magic bytes (0x1F, 0x8B)
    if (data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b) {
      const response = new Response(data as any);
      if (response.body) {
        const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];
        let totalBytes = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            totalBytes += value.length;
          }
        }
        finalData = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) {
          finalData.set(chunk, offset);
          offset += chunk.length;
        }
      }
    }

    await this.writeToOpfs(RAW_FILENAME, finalData);
    this.dbInstance = new sqlite3.oo1.OpfsDb(DB_FILENAME, 'c');
    this.dbType = 'OPFS';

    return this.getConnection();
  }

  public getConnection(): DatabaseConnection {
    if (!this.dbInstance) {
      throw new Error('Database is not initialized. Call initialize() first.');
    }

    const db = this.dbInstance;
    const sqlite3 = this.sqlite3;
    const dbType = this.dbType;

    return {
      db,
      sqlite3,
      dbType,
      queryAll<T = any>(sql: string, bind: any[] = []): T[] {
        const results: T[] = [];
        db.exec({
          sql,
          bind,
          rowMode: 'object',
          callback: (row: any) => {
            results.push(row as T);
          },
        });
        return results;
      },
      queryOne<T = any>(sql: string, bind: any[] = []): T | null {
        let result: T | null = null;
        db.exec({
          sql,
          bind,
          rowMode: 'object',
          callback: (row: any) => {
            if (!result) result = row as T;
          },
        });
        return result;
      },
      execute(sql: string, bind: any[] = []): void {
        db.exec({ sql, bind });
      },
      close(): void {
        db.close();
      },
    };
  }
}

export const dbManager = new DatabaseManager();
