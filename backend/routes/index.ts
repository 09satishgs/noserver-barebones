import { ApiRequest, ApiResponse } from '../types/api';
// Non-generic character imports commented out for barebones reference:
// import { CharacterRepository } from '../repositories/character.repository';
// import { CharacterService } from '../services/character.service';
// import { CharacterController } from '../controllers/character.controller';
import { SystemRepository } from '../repositories/system.repository';
import { SyncService } from '../services/sync.service';
import { SystemController } from '../controllers/system.controller';
import { ExplorerRepository } from '../repositories/explorer.repository';
import { ExplorerService } from '../services/explorer.service';
import { ExplorerController } from '../controllers/explorer.controller';
import { ProgressCallback } from '../database/seeder';

export type RouteHandler = (req: ApiRequest, onProgress?: ProgressCallback) => Promise<ApiResponse>;

interface RouteEntry {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: RouteEntry[] = [];

  constructor(
    private systemController: SystemController,
    private explorerController: ExplorerController
    // private characterController?: CharacterController
  ) {
    this.registerRoutes();
  }

  private addRoute(method: string, path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    this.routes.push({
      method: method.toUpperCase(),
      pattern: new RegExp(`^${regexPath}$`),
      paramNames,
      handler,
    });
  }

  private registerRoutes() {
    // Non-generic Character Routes (commented out in barebones):
    // this.addRoute('GET', '/api/characters', (req) => this.characterController!.list(req));
    // this.addRoute('GET', '/api/characters/:id', (req) => this.characterController!.getById(req));

    // System & Sync Routes
    this.addRoute('GET', '/api/system/status', () => this.systemController.getStatus());
    this.addRoute('POST', '/api/system/sync', (req, onProgress) => this.systemController.sync(req, onProgress));
    this.addRoute('POST', '/api/system/upload', (req) => this.systemController.upload(req));

    // Generic Database Explorer Routes
    this.addRoute('GET', '/api/explorer/tables', () => this.explorerController.getTables());
    this.addRoute('GET', '/api/explorer/schema', (req) => this.explorerController.getSchema(req));
    this.addRoute('GET', '/api/explorer/data', (req) => this.explorerController.getData(req));
  }

  public async dispatch(req: ApiRequest, onProgress?: ProgressCallback): Promise<ApiResponse> {
    const normalizedMethod = req.method.toUpperCase();
    const cleanPath = req.path.split('?')[0];

    for (const route of this.routes) {
      if (route.method !== normalizedMethod) continue;

      const match = cleanPath.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });

        const enrichedReq: ApiRequest = {
          ...req,
          params: { ...req.params, ...params },
        };

        return await route.handler(enrichedReq, onProgress);
      }
    }

    return {
      status: 404,
      error: `Endpoint '${req.method} ${cleanPath}' not found`,
    };
  }
}

// Factory to create fully wired router
export function createRouter(): Router {
  const sysRepo = new SystemRepository();
  const syncService = new SyncService(sysRepo);
  const sysController = new SystemController(syncService);

  const explorerRepo = new ExplorerRepository();
  const explorerService = new ExplorerService(explorerRepo);
  const explorerController = new ExplorerController(explorerService);

  // Character domain instances commented out:
  // const charRepo = new CharacterRepository();
  // const charService = new CharacterService(charRepo);
  // const charController = new CharacterController(charService);

  return new Router(sysController, explorerController);
}
