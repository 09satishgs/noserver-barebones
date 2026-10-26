import { ApiRequest, ApiResponse } from '../types/api';
import { ExplorerService } from '../services/explorer.service';
import {
  TableSummary,
  ColumnInfo,
  TableDataResult,
} from '../repositories/explorer.repository';

export class ExplorerController {
  constructor(private explorerService: ExplorerService) {}

  public async getTables(): Promise<ApiResponse<TableSummary[]>> {
    try {
      const tables = await this.explorerService.getTables();
      return { status: 200, data: tables };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  public async getSchema(req: ApiRequest): Promise<ApiResponse<ColumnInfo[]>> {
    try {
      const tableName = (req.query?.table as string) || (req.params?.table as string);
      const schema = await this.explorerService.getTableSchema(tableName);
      return { status: 200, data: schema };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  public async getData(req: ApiRequest): Promise<ApiResponse<TableDataResult>> {
    try {
      const tableName = (req.query?.table as string) || (req.params?.table as string);
      const limit = req.query?.limit ? Number(req.query.limit) : 25;
      const offset = req.query?.offset ? Number(req.query.offset) : 0;
      const search = req.query?.search as string | undefined;

      const data = await this.explorerService.getTableData(tableName, { limit, offset, search });
      return { status: 200, data };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
}
