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
