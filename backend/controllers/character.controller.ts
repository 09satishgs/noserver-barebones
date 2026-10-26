import { ApiRequest, ApiResponse } from '../types/api';
import { CharacterService } from '../services/character.service';
import { Character, CharacterListQuery } from '../types/models';

export class CharacterController {
  constructor(private characterService: CharacterService) {}

  public async list(req: ApiRequest<undefined, CharacterListQuery>): Promise<ApiResponse<{ items: Character[]; total: number }>> {
    try {
      const result = await this.characterService.getCharacters(req.query);
      return {
        status: 200,
        data: result,
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message,
      };
    }
  }

  public async getById(req: ApiRequest): Promise<ApiResponse<Character>> {
    try {
      const id = req.params?.id;
      if (!id) {
        return { status: 400, error: 'Character ID parameter is required' };
      }

      const character = await this.characterService.getCharacterById(id);
      if (!character) {
        return { status: 404, error: `Character with id '${id}' not found` };
      }

      return {
        status: 200,
        data: character,
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error.message,
      };
    }
  }
}
