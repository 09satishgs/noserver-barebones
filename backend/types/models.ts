// Database Entities and Domain Models

export interface Character {
  id: string;
  name: string;
  slug: string;
  affiliation?: string;
  crest?: string;
  voice_actor_en?: string;
  voice_actor_jp?: string;
  birthday?: string;
  likes?: string;
  dislikes?: string;
  interests?: string;
  unique_talent?: string;
  combat_art_ids?: string;
  spell_ids?: string;
}

export interface CharacterListQuery {
  search?: string;
  affiliation?: string;
  limit?: number;
  offset?: number;
}

export interface SystemStatus {
  isInitialized: boolean;
  dbType: 'OPFS';
  characterCount: number;
  tableCount: number;
  tables: string[];
  lastSyncedAt?: string;
  syncUrl: string;
}

export interface SyncPayload {
  url?: string;
}
