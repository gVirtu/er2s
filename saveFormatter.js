import { NO_ITEM } from "./data/items.js";
import { NO_MOVE } from "./data/moves.js";

export class TeamFormatter {
  constructor(save) {
    this.save = save;
  }

  format() {
    return this.save.teamPokemon.map(this.formatPokemon, this).join("\n\n");
  }

  formatPokemon(pokemon) {
    return [
      this.formatPokemonHeader(pokemon),
      this.formatPokemonAbility(pokemon),
      this.formatPokemonLevel(pokemon),
      this.formatPokemonShininess(pokemon),
      this.formatPokemonEVs(pokemon),
      this.formatPokemonNature(pokemon),
      this.formatPokemonIVs(pokemon),
      this.formatPokemonMoves(pokemon),
    ]
      .filter(Boolean)
      .join("\n");
  }

  formatPokemonHeader(pokemon) {
    const { itemName } = pokemon.growth;
    const heldItem = itemName === NO_ITEM ? null : `@ ${itemName}`;
    const gender = pokemon.gender && `(${pokemon.gender})`;

    return [
      pokemon.nickname,
      `(${pokemon.growth.speciesName})`,
      gender,
      heldItem
    ].filter(Boolean).join(' ');
  }

  formatPokemonAbility(pokemon) {
    return `Ability: ${pokemon.abilityName}`;
  }

  formatPokemonLevel(pokemon) {
    if (pokemon.level === 100) return null;

    return `Level: ${pokemon.level}`;
  }

  formatPokemonShininess(pokemon) {
    if (!pokemon.shiny) return null;

    return "Shiny: Yes";
  }

  formatPokemonEVs(pokemon) {
    if (
      pokemon.evsCondition.hpEV +
        pokemon.evsCondition.atkEV +
        pokemon.evsCondition.defEV +
        pokemon.evsCondition.speedEV +
        pokemon.evsCondition.spAtkEV +
        pokemon.evsCondition.spDefEV ===
      0
    )
      return null;

    const formattedEVs = [
      this.formatStat("HP", pokemon.evsCondition.hpEV),
      this.formatStat("Atk", pokemon.evsCondition.atkEV),
      this.formatStat("Def", pokemon.evsCondition.defEV),
      this.formatStat("Spe", pokemon.evsCondition.speedEV),
      this.formatStat("SpA", pokemon.evsCondition.spAtkEV),
      this.formatStat("SpD", pokemon.evsCondition.spDefEV),
    ]
      .filter(Boolean)
      .join(" / ");

    return `EVs: ${formattedEVs}`;
  }

  formatStat(label, value) {
    if (!value) return null;
    return `${value} ${label}`;
  }

  formatPokemonNature(pokemon) {
    return `${pokemon.nature} Nature`;
  }

  formatPokemonIVs(pokemon) {
    if (
      pokemon.ivs.hpIV +
        pokemon.ivs.atkIV +
        pokemon.ivs.defIV +
        pokemon.ivs.speedIV +
        pokemon.ivs.spAtkIV +
        pokemon.ivs.spDefIV >=
      (31 * 6)
    )
      return null;

    const formattedIVs = [
      this.formatStat("HP", pokemon.ivs.hpIV),
      this.formatStat("Atk", pokemon.ivs.atkIV),
      this.formatStat("Def", pokemon.ivs.defIV),
      this.formatStat("Spe", pokemon.ivs.speedIV),
      this.formatStat("SpA", pokemon.ivs.spAtkIV),
      this.formatStat("SpD", pokemon.ivs.spDefIV),
    ]
      .filter(Boolean)
      .join(" / ");

    return `IVs: ${formattedIVs}`;
  }

  formatPokemonMoves(pokemon) {
    return [
      pokemon.attacks.move1Name,
      pokemon.attacks.move2Name,
      pokemon.attacks.move3Name,
      pokemon.attacks.move4Name,
    ]
      .filter((move) => move !== NO_MOVE)
      .map(this.formatMove)
      .join("\n");
  }

  formatMove(move) {
    return `- ${move}`;
  }
}
