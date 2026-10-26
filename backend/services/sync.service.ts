import { dbManager } from '../database/connection';
import { DEFAULT_SQLITE_GZ_URL, ProgressCallback } from '../database/seeder';
import { SystemRepository } from '../repositories/system.repository';
import { SystemStatus } from '../types/models';

export class SyncService {
  constructor(private systemRepository: SystemRepository) {}

  public async getStatus(): Promise<SystemStatus> {
    return this.systemRepository.getStatus();
  }

  public async syncDatabase(url: string = DEFAULT_SQLITE_GZ_URL, onProgress?: ProgressCallback): Promise<SystemStatus> {
    const targetUrl = url && url.trim() !== '' ? url.trim() : DEFAULT_SQLITE_GZ_URL;
    // Force re-download and re-write to OPFS / Memory
    await dbManager.initialize(targetUrl, true, onProgress);
    this.systemRepository.setLastSynced(targetUrl);
    return this.systemRepository.getStatus();
  }

  public async uploadDatabase(buffer: Uint8Array): Promise<SystemStatus> {
    await dbManager.importBuffer(buffer);
    this.systemRepository.setLastSynced('Direct File Upload');
    return this.systemRepository.getStatus();
  }
}
