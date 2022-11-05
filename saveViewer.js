import { TeamFormatter } from "./saveFormatter.js";
import { SaveParser } from "./saveParser.js";

function readSave(file) {
  const reader = new FileReader();
  const parser = new SaveParser();
  let formatter;

  reader.addEventListener('load', (event) => {
    const bytes = new Uint8Array(event.target.result);

    const save = parser.parseSave(bytes);
    formatter = new TeamFormatter(save);

    const outputSelector = document.getElementById('save-contents');
    outputSelector.value = formatter.format();
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
