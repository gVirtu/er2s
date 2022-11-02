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
        const value = (bytes[1] << 8) | bytes[0];
        return [this.name, value];
      }

      case FieldType.UINT: {
        const value =
          (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
        return [this.name, value];
      }

      case FieldType.BYTE_ARRAY: {
        return [this.name, bytes.slice(0, this.size)];
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
  static SIZE = 604;
  static POKEMON_LEN = 600;

  static fields = [
    // Offset = 0
    new Field("teamSize", FieldType.UINT, { offset: 0x0234}),
    // Offset = 4
    new Field("pokemonList", FieldType.BYTE_ARRAY, { size: Team.POKEMON_LEN }),
  ];

  constructor(bytes) {
    super(bytes, Team.fields);
  }
}

export class Pokemon extends DataBlock {
  static SIZE = 100;
  static NICKNAME_LEN = 10;
  static OTNAME_LEN = 7;

  // TODO:
  // Doc: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_substructures_(Generation_III)
  // Separar as substructures, determinar a ordem pelo PID,
  // descriptografar cada uma e ler uma a uma no saveParser

  static fields = [
    // Offset = 0
    new Field("PID", FieldType.UINT),
    // Offset = 4
    new Field("OTID", FieldType.UINT),
    // Offset = 8
    new Field("nickname", FieldType.BYTE_ARRAY, { size: Pokemon.NICKNAME_LEN }),
    // Offset = 18
    new Field("lang", FieldType.BYTE),
    // Offset = 19
    new Field("isEgg", FieldType.BYTE),
    // Offset = 20
    new Field("originalTrainerName", FieldType.BYTE_ARRAY, {
      size: Pokemon.OTNAME_LEN,
    }),
    // Offset = 27
    new Field("markings", FieldType.BYTE),
    // Offset = 28
    new Field("checksum", FieldType.USHORT),
    // Offset = 30
    new Field("unused", FieldType.BYTE_ARRAY, { size: 2 }),
    // Offset = 32
    // Begin Substructure0
    new Field("species", FieldType.USHORT),
    // Offset = 34
    new Field("item", FieldType.USHORT),
    // Offset = 36
    new Field("experience", FieldType.UINT),
    // Offset = 40
    new Field("ppBonuses", FieldType.BYTE),
    // Offset = 41
    new Field("friendship", FieldType.BYTE),
    // Offset = 42
    new Field("filler", FieldType.USHORT),
    // End Substructure0
    // Begin Substructure1
    // Offset = 44
    new Field("move1", FieldType.USHORT),
    // Offset = 46
    new Field("move2", FieldType.USHORT),
    // Offset = 48
    new Field("move3", FieldType.USHORT),
    // Offset = 50
    new Field("move4", FieldType.USHORT),
    // Offset = 52
    new Field("pp1", FieldType.BYTE),
    // Offset = 53
    new Field("pp2", FieldType.BYTE),
    // Offset = 54
    new Field("pp3", FieldType.BYTE),
    // Offset = 55
    new Field("pp4", FieldType.BYTE),
    // End Substructure1
    // Begin Substructure2
    // Offset = 56
    new Field("hpEV", FieldType.BYTE),
    // Offset = 57
    new Field("atkEV", FieldType.BYTE),
    // Offset = 58
    new Field("defEV", FieldType.BYTE),
    // Offset = 59
    new Field("speedEV", FieldType.BYTE),
    // Offset = 60
    new Field("spAtkEV", FieldType.BYTE),
    // Offset = 61
    new Field("spDefEV", FieldType.BYTE),
    // Offset = 62
    new Field("coolness", FieldType.BYTE),
    // Offset = 63
    new Field("beauty", FieldType.BYTE),
    // Offset = 64
    new Field("cuteness", FieldType.BYTE),
    // Offset = 65
    new Field("smartness", FieldType.BYTE),
    // Offset = 66
    new Field("toughness", FieldType.BYTE),
    // Offset = 67
    new Field("feel", FieldType.BYTE),
    // End Substructure2
    // Begin Substructure3
    // Offset = 68
    new Field("pokerus", FieldType.BYTE),
    // Offset = 69
    new Field("metLocation", FieldType.BYTE),
    // Offset = 70
    new Field("origins", FieldType.USHORT),
    // Offset = 72
    new Field("ivEggAbility", FieldType.UINT),
    // Offset = 76
    new Field("ribbonsObedience", FieldType.UINT),
    // End Substructure3
    // Offset = 80
  ];

  constructor(bytes) {
    super(bytes, Pokemon.fields);
  }
}
