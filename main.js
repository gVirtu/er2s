import { TeamFormatter } from "./saveFormatter.js";
import { SaveParser } from "./saveParser.js";

// DOM Elements //

const FILE_SELECTOR = document.getElementById("save-file-input");
const OUTPUT_SELECTOR = document.getElementById("save-contents");
const BUTTON_SELECTOR = document.getElementById("copy-button");

//////////////////

function readSave(file) {
  const reader = new FileReader();
  const parser = new SaveParser();
  let formatter;

  reader.addEventListener("load", (event) => {
    const bytes = new Uint8Array(event.target.result);

    const save = parser.parseSave(bytes);
    formatter = new TeamFormatter(save);

    OUTPUT_SELECTOR.value = formatter.format();
  });

  reader.readAsArrayBuffer(file);
}

function copyFormattedOutput() {
  OUTPUT_SELECTOR.select();
  navigator.clipboard.writeText(OUTPUT_SELECTOR.value);
}

FILE_SELECTOR.addEventListener("change", (event) => {
  const fileList = event.target.files;

  if (fileList.length > 0) {
    readSave(fileList[0]);
  }
});

BUTTON_SELECTOR.addEventListener("click", copyFormattedOutput);
