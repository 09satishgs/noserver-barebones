import { ApiRequest, ApiResponse } from '../types/api';
import { SyncService } from '../services/sync.service';
import { SyncPayload, SystemStatus } from '../types/models';
import { ProgressCallback } from '../database/seeder';

export class SystemController {
  constructor(private syncService: SyncService) {}

  public async getStatus(): Promise<ApiResponse<SystemStatus>> {
    try {
      const status = await this.syncService.getStatus();
      return {
        status: 200,
        data: status,
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message,
      };
    }
  }

  public async sync(
    req: ApiRequest<SyncPayload>,
    onProgress?: ProgressCallback
  ): Promise<ApiResponse<SystemStatus>> {
    try {
      const url = req.body?.url;
      const updatedStatus = await this.syncService.syncDatabase(url, onProgress);
      return {
        status: 200,
        data: updatedStatus,
        message: 'Database synced successfully from remote URL',
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message,
      };
    }
  }

  public async upload(req: ApiRequest<{ buffer: Uint8Array | ArrayBuffer }>): Promise<ApiResponse<SystemStatus>> {
    try {
      const raw = req.body?.buffer;
      if (!raw) {
        return { status: 400, error: 'Database file buffer is required' };
      }
      const uint8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
      const updatedStatus = await this.syncService.uploadDatabase(uint8);
      return {
        status: 200,
        data: updatedStatus,
        message: 'Database uploaded and mounted to OPFS successfully',
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message,
      };
    }
  }
}
