import { TeamFormatter } from "./saveFormatter.js";
import { SaveParser } from "./saveParser.js";

// DOM Elements //

const DROPZONE_SELECTOR = document.getElementById("drop-zone");
const FILE_SELECTOR = document.getElementById("save-file-input");
const LABEL_SELECTOR = document.getElementById("save-file-input-label");
const OUTPUT_SELECTOR = document.getElementById("output");
const ERROR_SELECTOR = document.getElementById("error-detail");
const ERROR_CONTENT_SELECTOR = document.getElementById("error-content");
const OUTPUT_TEXT_SELECTOR = document.getElementById("formatted-team");
const BUTTON_SELECTOR = document.getElementById("copy-button");

//////////////////

// File input and save parsing
function readSave(file) {
  LABEL_SELECTOR.innerText = file.name;
  OUTPUT_SELECTOR.classList.remove("show");
  ERROR_SELECTOR.classList.remove("show");

  const reader = new FileReader();
  const parser = new SaveParser();
  let formatter;

  reader.addEventListener("load", (event) => {
    const bytes = new Uint8Array(event.target.result);

    try {
      const save = parser.parseSave(bytes);
      formatter = new TeamFormatter(save);

      OUTPUT_SELECTOR.classList.add("show");
      OUTPUT_TEXT_SELECTOR.value = formatter.format();
    } catch (error) {
      ERROR_SELECTOR.classList.add("show");
      ERROR_CONTENT_SELECTOR.innerText = error.stack;
    }
  });

  reader.readAsArrayBuffer(file);
}

FILE_SELECTOR.addEventListener("change", (event) => {
  const fileList = event.target.files;

  if (fileList.length > 0) {
    readSave(fileList[0]);
  }
});

LABEL_SELECTOR.addEventListener("click", (event) => {
  FILE_SELECTOR.click();
});

// Dropzone shenanigans
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  DROPZONE_SELECTOR.classList.add("highlight");
}

function unhighlight() {
  DROPZONE_SELECTOR.classList.remove("highlight");
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const fileList = dt.files;

  if (fileList.length > 0) {
    readSave(fileList[0]);
  }
}

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  DROPZONE_SELECTOR.addEventListener(eventName, preventDefaults, false);
});

[("dragenter", "dragover")].forEach((eventName) => {
  DROPZONE_SELECTOR.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
  DROPZONE_SELECTOR.addEventListener(eventName, unhighlight, false);
});

DROPZONE_SELECTOR.addEventListener('drop', handleDrop, false);

// Copy button
function resetCopyButtonText() {
  BUTTON_SELECTOR.innerText = '📋 Copy to clipboard';
}

function copyFormattedOutput() {
  OUTPUT_TEXT_SELECTOR.select();
  navigator.clipboard.writeText(OUTPUT_TEXT_SELECTOR.value);
  BUTTON_SELECTOR.innerText = '✔️ Copied!';

  setTimeout(resetCopyButtonText, 3000);
}

BUTTON_SELECTOR.addEventListener("click", copyFormattedOutput);
