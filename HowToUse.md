# Developer Guide: In-Browser Full-Stack React & SQLite Architecture

This document provides a comprehensive guide on how the in-browser full-stack application is structured, and **exactly which files to update when adding, modifying, or removing an API** and consuming it in the frontend.

---

## 1. System Architecture & Request Lifecycle

Unlike a traditional web app where HTTP requests travel over the network to an external server, this app runs an **entire server and database inside the browser**:

```
[React View] (e.g. DatabaseExplorerWeb.tsx)
     │
     ▼
[Component Hook] (useDatabaseExplorer.ts)
     │
     ▼
[Zustand Store] (useExplorerStore.ts)
     │
     ▼
[API Client / RPC Bridge] (backend/client/apiClient.ts)
     │
     │  (postMessage across Web Worker boundary)
     ▼
[Worker Entry] (backend/worker.ts)
     │
     ▼
[REST Router] (backend/routes/index.ts)
     │
     ▼
[Controller] (backend/controllers/explorer.controller.ts)
     │
     ▼
[Service (Business Logic)] (backend/services/explorer.service.ts)
     │
     ▼
[Repository (Data Access)] (backend/repositories/explorer.repository.ts)
     │
     ▼
[SQLite-WASM + OPFS] (backend/database/connection.ts)
```

This strict **SOLID separation of concerns** ensures that database logic, business logic, request parsing, and UI rendering never leak into each other.

---

## 2. Checklist: Adding a New API

Suppose you want to add a new endpoint: `GET /api/weapons` to list weapons from the database.

Here is the exact checklist of files you need to touch:

### Step 1: Define Models and DTOs
- **File**: `backend/types/models.ts`
  Add the entity interface:
  ```ts
  export interface Weapon {
    id: string;
    name: string;
    weapon_type: string;
    might: number;
    hit: number;
    weight: number;
  }
  ```

### Step 2: Define Data Access in Repository
- **Files**:
  - `backend/repositories/interfaces.ts`: Define repository contract:
    ```ts
    export interface IWeaponRepository {
      findAll(query?: { search?: string }): Promise<Weapon[]>;
      findById(id: string): Promise<Weapon | null>;
    }
    ```
  - `backend/repositories/weapon.repository.ts` *(New file)*: Implement the SQL queries:
    ```ts
    import { dbManager } from '../database/connection';
    import { Weapon } from '../types/models';
    import { IWeaponRepository } from './interfaces';

    export class WeaponRepository implements IWeaponRepository {
      public async findAll(query?: { search?: string }): Promise<Weapon[]> {
        const conn = dbManager.getConnection();
        const sql = query?.search
          ? 'SELECT * FROM weapons WHERE name LIKE ? ORDER BY name ASC'
          : 'SELECT * FROM weapons ORDER BY name ASC';
        const bindings = query?.search ? [`%${query.search}%`] : [];
        return conn.queryAll<Weapon>(sql, bindings);
      }

      public async findById(id: string): Promise<Weapon | null> {
        const conn = dbManager.getConnection();
        return conn.queryOne<Weapon>('SELECT * FROM weapons WHERE id = ?', [id]);
      }
    }
    ```

### Step 3: Add Business Logic in Service
- **File**: `backend/services/weapon.service.ts` *(New file)*:
  ```ts
  import { IWeaponRepository } from '../repositories/interfaces';
  import { Weapon } from '../types/models';

  export class WeaponService {
    constructor(private weaponRepo: IWeaponRepository) {}

    public async getWeapons(search?: string): Promise<Weapon[]> {
      return this.weaponRepo.findAll({ search });
    }
  }
  ```

### Step 4: Add Request Controller
- **File**: `backend/controllers/weapon.controller.ts` *(New file)*:
  ```ts
  import { ApiRequest, ApiResponse } from '../types/api';
  import { WeaponService } from '../services/weapon.service';
  import { Weapon } from '../types/models';

  export class WeaponController {
    constructor(private weaponService: WeaponService) {}

    public async list(req: ApiRequest): Promise<ApiResponse<Weapon[]>> {
      try {
        const search = req.query?.search as string | undefined;
        const data = await this.weaponService.getWeapons(search);
        return { status: 200, data };
      } catch (err: any) {
        return { status: 500, error: err.message || 'Failed to list weapons' };
      }
    }
  }
  ```

### Step 5: Register Route in Router
- **File**: `backend/routes/index.ts`:
  1. Instantiate the new repository, service, and controller in `createRouter()`:
     ```ts
     const weaponRepo = new WeaponRepository();
     const weaponService = new WeaponService(weaponRepo);
     const weaponController = new WeaponController(weaponService);
     ```
  2. Register the endpoint in `registerRoutes()`:
     ```ts
     this.addRoute('GET', '/api/weapons', (req) => this.weaponController.list(req));
     ```

### Step 6: Expose API in Frontend Client
- **File**: `backend/client/apiClient.ts`:
  Add a helper to `api`:
  ```ts
  public weapons = {
    list: async (search?: string) => {
      return this.request<Weapon[]>({
        method: 'GET',
        path: '/api/weapons',
        query: { search },
      });
    },
  };
  ```

### Step 7: Consume in Frontend
1. **Zustand Store**: `frontend/store/useWeaponStore.ts`:
   ```ts
   import { create } from 'zustand';
   import { api } from '../../backend/client/apiClient';
   import { Weapon } from '../../backend/types/models';

   export const useWeaponStore = create((set) => ({
     weapons: [],
     fetchWeapons: async () => {
       const res = await api.weapons.list();
       if (res.status === 200 && res.data) {
         set({ weapons: res.data });
       }
     },
   }));
   ```
2. **Hook**: Import `useWeaponStore` in your component's `useComponentName.ts`.
3. **Views**: Render data in `ComponentNameWeb.tsx` and `ComponentNameMobile.tsx`.

---

## 3. Checklist: Updating an Existing API

When modifying an existing API (e.g. adding filtering by affiliation to `GET /api/characters`):

1. **Update Query/Payload Types**:
   - `backend/types/models.ts`: Add fields to `CharacterListQuery` or body payload.
2. **Update Repository Query**:
   - `backend/repositories/character.repository.ts`: Add SQL `WHERE` clauses and bindings.
3. **Update Service**:
   - `backend/services/character.service.ts`: Handle any new business rules or default values.
4. **Update Controller**:
   - `backend/controllers/character.controller.ts`: Parse any new query or body parameters from `req`.
5. **Update Client Helper**:
   - `backend/client/apiClient.ts`: Update TypeScript parameter types.
6. **Update Frontend Consumer**:
   - Update `useCharacterStore.ts` and the UI view component.

---

## 4. Checklist: Removing an API

1. **Router**: Remove `this.addRoute(...)` from `backend/routes/index.ts`.
2. **Controller**: Remove the method from the controller.
3. **Service / Repository**: Remove unused methods.
4. **Client**: Remove the helper function from `backend/client/apiClient.ts`.
5. **Frontend**: Clean up any stores or components calling the removed method.

---

## 5. Frontend Component Architecture Standard

Every reusable component in `frontend/components/` strictly adheres to this structure:

```
components/
└── ComponentName/
    ├── Views/
    │   ├── ComponentNameWeb.tsx      # Desktop / wide viewport UI
    │   └── ComponentNameMobile.tsx   # Mobile / compact viewport UI
    ├── ComponentName.module.scss     # Single shared styles module
    ├── useComponentName.ts           # All state, effects, & business logic
    └── index.ts                      # Evaluates useBreakpoint() to render Web or Mobile
```

### Why this pattern?
- **Zero code duplication**: All business logic, event handlers, and data fetching live in `useComponentName.ts`.
- **Optimal UI/UX per device**: `ComponentNameWeb.tsx` and `ComponentNameMobile.tsx` consume the exact same hook output, but are free to optimize layouts (e.g. data grids vs touch lists) without tangled conditional JSX.
- **Easy maintenance**: Adding a third view (e.g. tablet or kiosk) simply means adding a view file and switching in `index.ts`.

---

## 6. Overlays System (Modals & Toasts)

To trigger a toast from anywhere (frontend or backend callbacks):
```ts
import { useOverlayStore } from '../store/useOverlayStore';

const { addToast } = useOverlayStore.getState();
addToast('Operation completed successfully!', 'success'); // 'info' | 'success' | 'warning' | 'error'
```

To display a custom modal:
```ts
import { useOverlayStore } from '../store/useOverlayStore';

useOverlayStore.getState().openModal({
  title: 'Confirm Action',
  content: <div>Are you sure you want to proceed?</div>,
  onClose: () => console.log('Closed'),
});
```

---

## 7. Database Synchronization & Environment Configuration

The initial database URL is configured via the `.env` file in the project root:
```env
VITE_REMOTE_SQLITE_GZ_URL=https://raw.githubusercontent.com/pogobonfire-hash/fefw-artifacts/master/fefw.sqlite.gz
```

In Settings (`#/settings`):
- The user can trigger a sync to redownload and replace the local OPFS database, or specify a custom URL.
- The sync process runs entirely in `backend/database/seeder.ts` and `backend/database/connection.ts` inside the Web Worker.
- Progress updates are automatically streamed to the UI via `api.onEvent`.
