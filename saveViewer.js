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
