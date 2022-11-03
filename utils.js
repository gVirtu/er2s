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
  ].map((s) => s.split("")).flat(),
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
