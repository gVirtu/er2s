import { Pokemon, Section, Team } from "./saveStructure.js";

class SaveSlot {
  static SIZE = 0xE000;
  static SECTION_COUNT = 14;

  static TEAM_SECTION_ID = 1;

  sections = {};
  teamPokemon = [];
  saveIndex = 0;

  readSections(saveBytes) {
    let offset = 0;

    for (let index = 0; index < SaveSlot.SECTION_COUNT; index++) {
      const sectionBytes = saveBytes.slice(offset, offset + Section.SIZE);

      const sectionData = new Section(sectionBytes);

      this.saveIndex = Math.max(this.saveIndex, sectionData.saveIndex);
      this.sections[sectionData.sectionId] = sectionData;

      offset += Section.SIZE;
    }
  }

  readTeamPokemon() {
    const section = this.sections[SaveSlot.TEAM_SECTION_ID];

    const teamBytes = section.data.slice(Team.OFFSET, Team.OFFSET + Team.SIZE);
    const teamData = new Team(teamBytes);

    for (let index = 0; index < teamData.teamSize; index++) {
      const offset = index * Pokemon.SIZE;
      const pokemonBytes = teamData.pokemonList.slice(offset, offset + Pokemon.SIZE);

      this.teamPokemon.push(new Pokemon(pokemonBytes));
    }
  }

  constructor(bytes, start) {
    const saveBytes = bytes.slice(start, start + SaveSlot.SIZE);

    this.readSections(saveBytes);
    this.readTeamPokemon();
  }

}

export class SaveParser {
  static SAVE_A_OFFSET = 0;
  static SAVE_B_OFFSET = 0xE000;

  parseSave(bytes) {
    const saveA = new SaveSlot(bytes, SaveParser.SAVE_A_OFFSET);
    const saveB = new SaveSlot(bytes, SaveParser.SAVE_B_OFFSET);

    return (saveA.saveIndex > saveB.saveIndex) ? (saveA) : (saveB);
  }
}
