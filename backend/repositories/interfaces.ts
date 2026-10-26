import { Character, CharacterListQuery, SystemStatus } from '../types/models';

export interface ICharacterRepository {
  findAll(query?: CharacterListQuery): Promise<Character[]>;
  findById(id: string): Promise<Character | null>;
  count(): Promise<number>;
}

export interface ISystemRepository {
  getStatus(): Promise<SystemStatus>;
  getAllTableNames(): Promise<string[]>;
}
