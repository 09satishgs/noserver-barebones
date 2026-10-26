import { ICharacterRepository } from '../repositories/interfaces';
import { Character, CharacterListQuery } from '../types/models';

export class CharacterService {
  constructor(private characterRepository: ICharacterRepository) {}

  public async getCharacters(query?: CharacterListQuery): Promise<{ items: Character[]; total: number }> {
    const [items, total] = await Promise.all([
      this.characterRepository.findAll(query),
      this.characterRepository.count(),
    ]);

    return { items, total };
  }

  public async getCharacterById(id: string): Promise<Character | null> {
    if (!id || id.trim() === '') {
      throw new Error('Character ID is required');
    }
    return this.characterRepository.findById(id.trim());
  }
}
