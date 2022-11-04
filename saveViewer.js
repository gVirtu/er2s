import { POKEMON_NAMES } from "./data/pokemonNames.js";
import { POKEMON_BASE_STATS } from "./data/pokemonStats.js";
import { SaveParser } from "./saveParser.js";

function readSave(file) {
  const reader = new FileReader();
  const parser = new SaveParser();

  reader.addEventListener('load', (event) => {
    const bytes = new Uint8Array(event.target.result);

    parser.parseSave(bytes);
  });

  reader.readAsArrayBuffer(file);
}

const fileSelector = document.getElementById('save-file-input');

fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files;

  if (fileList.length > 0) {
    readSave(fileList[0]);
  }
});

console.log('BEGIN INTEGRITY CHECK...');
POKEMON_BASE_STATS.every((stats, index) => {
  if (!Number.isInteger(stats.genderRatio)) {
    console.log(`Unexpected genderRatio ${stats.genderRatio} at index #${index}`);
  }
  if (!Array.isArray(stats.abilities)) {
    console.log(`Unexpected abilities ${stats.abilities} at index #${index}`);
  }
})
console.log('FINISHED INTEGRITY CHECK.');
