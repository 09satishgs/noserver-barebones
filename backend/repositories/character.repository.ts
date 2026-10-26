import { dbManager } from '../database/connection';
import { Character, CharacterListQuery } from '../types/models';
import { ICharacterRepository } from './interfaces';

export class CharacterRepository implements ICharacterRepository {
  public async findAll(query?: CharacterListQuery): Promise<Character[]> {
    const conn = dbManager.getConnection();
    const clauses: string[] = [];
    const bindings: any[] = [];

    if (query?.search && query.search.trim() !== '') {
      clauses.push('(name LIKE ? OR slug LIKE ? OR affiliation LIKE ? OR unique_talent LIKE ?)');
      const term = `%${query.search.trim()}%`;
      bindings.push(term, term, term, term);
    }

    if (query?.affiliation && query.affiliation.trim() !== '') {
      clauses.push('affiliation = ?');
      bindings.push(query.affiliation.trim());
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const limit = query?.limit ?? 50;
    const offset = query?.offset ?? 0;

    const sql = `
      SELECT 
        id, name, slug, affiliation, crest, 
        voice_actor_en, voice_actor_jp, birthday, 
        likes, dislikes, interests, unique_talent,
        combat_art_ids, spell_ids
      FROM characters
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;

    return conn.queryAll<Character>(sql, [...bindings, limit, offset]);
  }

  public async findById(id: string): Promise<Character | null> {
    const conn = dbManager.getConnection();
    const sql = `
      SELECT 
        id, name, slug, affiliation, crest, 
        voice_actor_en, voice_actor_jp, birthday, 
        likes, dislikes, interests, unique_talent,
        combat_art_ids, spell_ids
      FROM characters
      WHERE id = ? OR slug = ?
      LIMIT 1
    `;
    return conn.queryOne<Character>(sql, [id, id]);
  }

  public async count(): Promise<number> {
    const conn = dbManager.getConnection();
    const row = conn.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM characters');
    return row ? Number(row.count) : 0;
  }
}
