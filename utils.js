import { NATURE_NAMES } from "./data/natures.js";
import {
  MON_FEMALE,
  MON_GENDERLESS,
  MON_MALE,
  POKEMON_BASE_STATS,
} from "./data/pokemonStats.js";

export function toUint32(bytes) {
  return (
    ((bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0]) >>> 0
  );
}

export function toUshort32(bytes) {
  return ((bytes[1] << 8) | bytes[0]) >>> 0;
}

export function toBytes(uint32) {
  let remainder = uint32;
  const byteArray = [0, 0, 0, 0];

  for (let index = 0; index < byteArray.length; index++) {
    const byte = remainder & 0xff;
    byteArray[index] = byte;
    remainder = (remainder - byte) / 256;
  }

  return byteArray;
}

const TERMINATOR = String.fromCharCode(0xff);
const CHAR_TABLE = [
  [
    " ÀÁÂÇÈÉÊËÌ ÎÏÒÓÔ", // 0
    "ŒÙÚÛÑßàá çèéêëìí", // 1
    "îïòóôœùúûñºª &+ ", // 2
    "    ˡ=;         ", // 3
    "                ", // 4
    "▯¿¡       Í%()  ", // 5
    "        â      í", // 6
    "         ⬆⬇⬅⮕***", // 7
    "****ᵉ<>         ", // 8
    "                ", // 9
    " 0123456789!?.-・", // A
    "…“”‘’♂♀$,×/ABCDE", // B
    "FGHIJKLMNOPQRSTU", // C
    "VWXYZabcdefghijk", // D
    "lmnopqrstuvwxyz▶", // E
    ":ÄÖÜäöü   ", // F
  ]
    .map((s) => s.split(""))
    .flat(),
  // Make the total length 256 so that any byte access is always within the array
  TERMINATOR,
  TERMINATOR,
  TERMINATOR,
  TERMINATOR,
  TERMINATOR,
  TERMINATOR,
].flat();

export function toByteString(bytes) {
  let res = "";

  bytes.every((byte) => {
    const char = CHAR_TABLE[byte];
    if (char === TERMINATOR) return false;

    res += char;
    return true;
  });

  return res;
}

export const getGenderBySpeciesAndPid = (species, pid) => {
  const threshold = POKEMON_BASE_STATS[species].genderRatio;

  if (threshold == MON_GENDERLESS) return "";
  if (threshold == MON_FEMALE) return "F";
  if (threshold == MON_MALE) return "M";

  return (pid & 0xff) >= threshold ? "M" : "F";
};

export const getNatureByPid = (pid) => {
  return NATURE_NAMES[pid % NATURE_NAMES.length];
};

export const getShininessByPid = (pid, otid) => {
  const trainer = (otid & 0xFFFF);
  const secret = (otid >>> 16);
  const p1 = (pid & 0xFFFF);
  const p2 = (pid >>> 16);
  return (trainer ^ secret ^ p1 ^ p2) < 8;
}

const NUM_NORMAL_ABILITY_SLOTS = 2;
const NUM_HIDDEN_ABILITY_SLOTS = 1;
const NUM_ABILITY_SLOTS = NUM_NORMAL_ABILITY_SLOTS + NUM_HIDDEN_ABILITY_SLOTS;

export function getAbilityBySpecies(species, abilityNum) {
  let lastUsedAbility;

  if (abilityNum < NUM_ABILITY_SLOTS) {
    lastUsedAbility = POKEMON_BASE_STATS[species].abilities[abilityNum];
  } else {
    lastUsedAbility = "ABILITY_NONE";
  }

  // if abilityNum is empty hidden ability, look for other hidden abilities
  if (abilityNum >= NUM_NORMAL_ABILITY_SLOTS) {
    for (
      let i = NUM_NORMAL_ABILITY_SLOTS;
      i < NUM_ABILITY_SLOTS && lastUsedAbility == "ABILITY_NONE";
      i++
    ) {
      lastUsedAbility = POKEMON_BASE_STATS[species].abilities[i];
    }
  }

  // look for any non-empty ability
  for (
    let i = 0;
    i < NUM_ABILITY_SLOTS && lastUsedAbility == "ABILITY_NONE";
    i++
  ) {
    lastUsedAbility = POKEMON_BASE_STATS[species].abilities[i];
  }

  return lastUsedAbility;
}
