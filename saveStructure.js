import { ABILITY_MAP } from "./data/abilities.js";
import { ITEM_NAMES } from "./data/items.js";
import { MOVE_NAMES } from "./data/moves.js";
import { POKEMON_NAMES } from "./data/pokemonNames.js";
import { POKEMON_BASE_STATS } from "./data/pokemonStats.js";
import {
  getAbilityBySpecies,
  getGenderBySpeciesAndPid,
  getNatureByPid,
  getShininessByPid,
  toBytes,
  toByteString,
  toUint32,
  toUshort32,
} from "./utils.js";

class FieldArray {
  constructor(fields) {
    this.fields = fields;
  }

  decode(bytes) {
    let offset = 0;
    const entries = [];

    this.fields.forEach((field) => {
      offset = field.options?.offset || offset;

      const fieldBytes = bytes.slice(offset, offset + field.size);

      entries.push(field.decode(fieldBytes));

      offset += field.size;
    });

    return {
      fields: Object.fromEntries(entries),
      size: offset,
    };
  }
}

class FieldType {
  static BYTE = "byte";
  static USHORT = "ushort";
  static UINT = "uint";
  static BYTE_ARRAY = "byteArray";
  static STRING = "string";
}

class Field {
  static sizeByType(type) {
    switch (type) {
      case FieldType.BYTE:
        return 1;

      case FieldType.USHORT:
        return 2;

      case FieldType.UINT:
        return 4;

      default:
        throw new Error(`Type ${type} requires size option`);
    }
  }

  constructor(name, type, options) {
    this.name = name;
    this.type = type;
    this.options = options || {};
    this.size = options?.size || this.constructor.sizeByType(type);
  }

  decode(bytes) {
    switch (this.type) {
      case FieldType.BYTE:
        return [this.name, bytes[0]];

      case FieldType.USHORT: {
        const value = toUshort32(bytes);
        return [this.name, value];
      }

      case FieldType.UINT: {
        const value = toUint32(bytes);
        return [this.name, value];
      }

      case FieldType.BYTE_ARRAY: {
        return [this.name, bytes.slice(0, this.size)];
      }

      case FieldType.STRING: {
        return [this.name, toByteString(bytes.slice(0, this.size))];
      }

      default:
        throw new Error(`Unknown field type ${this.type}`);
    }
  }
}

export class DataBlock {
  constructor(bytes, fields) {
    const fieldArray = new FieldArray(fields);

    const { fields: decodedFields, size } = fieldArray.decode(bytes);

    Object.assign(this, decodedFields);

    this.size = size;
  }
}

export class Section extends DataBlock {
  static SIZE = 0x1000;
  static DATA_LEN = 3968;

  static fields = [
    // Offset = 0
    new Field("data", FieldType.BYTE_ARRAY, { size: Section.DATA_LEN }),
    // Offset = 3968
    new Field("sectionId", FieldType.USHORT, { offset: 0xff4 }),
    // Offset = 3970
    new Field("checksum", FieldType.USHORT),
    // Offset = 3972
    new Field("signature", FieldType.UINT),
    // Offset = 3976
    new Field("saveIndex", FieldType.UINT),
  ];

  constructor(bytes) {
    super(bytes, Section.fields);
  }
}

export class Team extends DataBlock {
  static OFFSET = 0x0234;
  static SIZE = 604;
  static POKEMON_LEN = 600;

  static fields = [
    // Offset = 0
    new Field("teamSize", FieldType.UINT),
    // Offset = 4
    new Field("pokemonList", FieldType.BYTE_ARRAY, { size: Team.POKEMON_LEN }),
  ];

  constructor(bytes) {
    super(bytes, Team.fields);
  }
}

export class PokemonGrowth extends DataBlock {
  static SIZE = 12;

  static fields = [
    // Offset = 0
    new Field("species", FieldType.USHORT),
    // Offset = 2
    new Field("item", FieldType.USHORT),
    // Offset = 4
    new Field("experience", FieldType.UINT),
    // Offset = 8
    new Field("ppBonuses", FieldType.BYTE),
    // Offset = 9
    new Field("friendship", FieldType.BYTE),
    // Offset = 10
    new Field("filler", FieldType.USHORT),
  ];

  constructor(bytes) {
    super(bytes, PokemonGrowth.fields);

    this.putItemName();
    this.putSpeciesName();
  }

  putItemName() {
    this.itemName = ITEM_NAMES[this.item];
  }

  putSpeciesName() {
    this.speciesName = POKEMON_NAMES[this.species];
  }
}

export class PokemonAttacks extends DataBlock {
  static SIZE = 12;

  static fields = [
    // Offset = 0
    new Field("move1", FieldType.USHORT),
    // Offset = 2
    new Field("move2", FieldType.USHORT),
    // Offset = 4
    new Field("move3", FieldType.USHORT),
    // Offset = 6
    new Field("move4", FieldType.USHORT),
    // Offset = 8
    new Field("pp1", FieldType.BYTE),
    // Offset = 9
    new Field("pp2", FieldType.BYTE),
    // Offset = 10
    new Field("pp3", FieldType.BYTE),
    // Offset = 11
    new Field("pp4", FieldType.BYTE),
  ];

  constructor(bytes) {
    super(bytes, PokemonAttacks.fields);

    this.putMoveNames();
  }

  putMoveNames() {
    this.move1Name = MOVE_NAMES[this.move1];
    this.move2Name = MOVE_NAMES[this.move2];
    this.move3Name = MOVE_NAMES[this.move3];
    this.move4Name = MOVE_NAMES[this.move4];
  }
}

export class PokemonEVsCondition extends DataBlock {
  static SIZE = 12;

  static fields = [
    // Offset = 0
    new Field("hpEV", FieldType.BYTE),
    // Offset = 1
    new Field("atkEV", FieldType.BYTE),
    // Offset = 2
    new Field("defEV", FieldType.BYTE),
    // Offset = 3
    new Field("speedEV", FieldType.BYTE),
    // Offset = 4
    new Field("spAtkEV", FieldType.BYTE),
    // Offset = 5
    new Field("spDefEV", FieldType.BYTE),
    // Offset = 6
    new Field("coolness", FieldType.BYTE),
    // Offset = 7
    new Field("beauty", FieldType.BYTE),
    // Offset = 8
    new Field("cuteness", FieldType.BYTE),
    // Offset = 9
    new Field("smartness", FieldType.BYTE),
    // Offset = 10
    new Field("toughness", FieldType.BYTE),
    // Offset = 11
    new Field("feel", FieldType.BYTE),
  ];

  constructor(bytes) {
    super(bytes, PokemonEVsCondition.fields);
  }
}

export class PokemonMiscellaneous extends DataBlock {
  static SIZE = 12;

  static fields = [
    // Offset = 0
    new Field("pokerus", FieldType.BYTE),
    // Offset = 1
    new Field("metLocation", FieldType.BYTE),
    // Offset = 2
    new Field("origins", FieldType.USHORT),
    // Offset = 4
    new Field("ivEggAbility", FieldType.UINT),
    // Offset = 8
    new Field("ribbonsObedience", FieldType.UINT),
  ];

  constructor(bytes) {
    super(bytes, PokemonMiscellaneous.fields);
  }
}

class PokemonIVs {
  constructor(ivEggAbility) {
    this.hpIV = ivEggAbility & 31;
    this.atkIV = (ivEggAbility >> 5) & 31;
    this.defIV = (ivEggAbility >> 10) & 31;
    this.speedIV = (ivEggAbility >> 15) & 31;
    this.spAtkIV = (ivEggAbility >> 20) & 31;
    this.spDefIV = (ivEggAbility >> 25) & 31;
  }
}

export class Pokemon extends DataBlock {
  static SIZE = 100;
  static NICKNAME_LEN = 10;
  static OTNAME_LEN = 7;

  static SUBSTRUCTURES = [
    PokemonGrowth,
    PokemonAttacks,
    PokemonEVsCondition,
    PokemonMiscellaneous,
  ];

  static SUBSTRUCTURE_FIELD_NAMES = [
    "growth",
    "attacks",
    "evsCondition",
    "misc",
  ];

  static SUBSTRUCTURE_ORDER = [
    [0, 1, 2, 3], // GAEM
    [0, 1, 3, 2], // GAME
    [0, 2, 1, 3], // GEAM
    [0, 2, 3, 1], // GEMA
    [0, 3, 1, 2], // GMAE
    [0, 3, 2, 1], // GMEA
    [1, 0, 2, 3], // AGEM
    [1, 0, 3, 2], // AGME
    [1, 2, 0, 3], // AEGM
    [1, 2, 3, 0], // AEMG
    [1, 3, 0, 2], // AMGE
    [1, 3, 2, 0], // AMEG
    [2, 0, 1, 3], // EGAM
    [2, 0, 3, 1], // EGMA
    [2, 1, 0, 3], // EAGM
    [2, 1, 3, 0], // EAMG
    [2, 3, 0, 1], // EMGA
    [2, 3, 1, 0], // EMAG
    [3, 0, 1, 2], // MGAE
    [3, 0, 2, 1], // MGEA
    [3, 1, 0, 2], // MAGE
    [3, 1, 2, 0], // MAEG
    [3, 2, 0, 1], // MEGA
    [3, 2, 1, 0], // MEAG
  ];

  static fields = [
    // Offset = 0
    new Field("PID", FieldType.UINT),
    // Offset = 4
    new Field("OTID", FieldType.UINT),
    // Offset = 8
    new Field("nickname", FieldType.STRING, { size: Pokemon.NICKNAME_LEN }),
    // Offset = 18
    new Field("lang", FieldType.BYTE),
    // Offset = 19
    new Field("isEgg", FieldType.BYTE),
    // Offset = 20
    new Field("originalTrainerName", FieldType.STRING, {
      size: Pokemon.OTNAME_LEN,
    }),
    // Offset = 27
    new Field("markings", FieldType.BYTE),
    // Offset = 28
    new Field("checksum", FieldType.USHORT),
    // Offset = 30
    new Field("unused", FieldType.BYTE_ARRAY, { size: 2 }),
    // Offset = 32
    new Field("data", FieldType.BYTE_ARRAY, { size: 48 }),
  ];

  constructor(bytes) {
    super(bytes, Pokemon.fields);

    this.decodeSubstructures();
    this.decodeGender();
    this.decodeNature();
    this.decodeIVs();
    this.decodeAbility();
    this.decodeShininess();
  }

  decodeSubstructures() {
    const substructureOrder = Pokemon.SUBSTRUCTURE_ORDER[this.PID % 24];
    const substructureDecryptKey = (this.PID ^ this.OTID) >>> 0;

    let offset = 0;

    for (let index = 0; index < Pokemon.SUBSTRUCTURES.length; index++) {
      const substructureIndex = substructureOrder[index];

      const substructure = Pokemon.SUBSTRUCTURES[substructureIndex];
      const substructureFieldName =
        Pokemon.SUBSTRUCTURE_FIELD_NAMES[substructureIndex];

      const substructureBytes = this.data.slice(
        offset,
        offset + substructure.SIZE
      );

      const decryptedBytes = this.decryptBytes(
        substructureBytes,
        substructureDecryptKey
      );

      this[substructureFieldName] = new substructure(decryptedBytes);

      offset += substructure.SIZE;
    }
  }

  decryptBytes(bytes, key) {
    const decrypted = [...bytes];

    for (let index = 0; index < bytes.length; index += 4) {
      const dataSlice = bytes.slice(index, index + 4);
      const data = toUint32(dataSlice);
      const res = toBytes((data ^ key) >>> 0);
      decrypted[index] = res[0];
      decrypted[index + 1] = res[1];
      decrypted[index + 2] = res[2];
      decrypted[index + 3] = res[3];
    }

    return decrypted;
  }

  decodeGender() {
    this.gender = getGenderBySpeciesAndPid(this.growth.species, this.PID);
  }

  decodeNature() {
    this.nature = getNatureByPid(this.PID);
  }

  decodeIVs() {
    this.ivs = new PokemonIVs(this.misc.ivEggAbility);
  }

  decodeAbility() {
    const abilityNum = (this.misc.ribbonsObedience >> 28) & 3;
    const abilityCode = getAbilityBySpecies(this.growth.species, abilityNum);

    this.abilityName = ABILITY_MAP[abilityCode];
  }

  decodeShininess() {
    this.shiny = getShininessByPid(this.PID, this.OTID);
  }
}
