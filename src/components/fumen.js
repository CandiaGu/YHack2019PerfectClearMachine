const ENCODE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const DECODE = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

export function fumenToTypes(fumen) {
  const encode_base = ENCODE.length;
  const decode_base = DECODE.length + 1;
  let value = 0;
  let j = fumen.length-1;
  for (let i = 0; i < 5; i++, j--) {
    let c = fumen[j];
    if (c == '?') {
      j--;
      c = fumen[j];
    }
    value = value * encode_base + ENCODE.indexOf(c);
  }
  const types = [];
  while (value > 0) {
    types.push(DECODE[value % decode_base]);
    value = Math.floor(value / decode_base);
  }
  return types;
}

export function fumenToColoredField(fumen, height, width) {
  const encode_base = ENCODE.length;
  const coloredField = Array(height).fill(' ').map(() => Array(width).fill(' '));
  const blocks = height * width;
  const typeArray = [' ', 'I', 'L', 'O', 'Z', 'T', 'J', 'S', ' '];
  const regex = /../g;
  regex.lastIndex = 1+fumen.indexOf('@');
  let i = 1, j = 0;
  while (i < height) {
    const match = regex.exec(fumen)[0];
    let value = 0;
    for (let k = 1; k >= 0; k--)
      value = value * encode_base + ENCODE.indexOf(match.charAt(k));
    const length = value % blocks + 1;
    const type = typeArray[Math.floor(value / blocks) - 8];
    for (let k = 0; k < length; k++) {
      coloredField[i][j] = type;
      j++;
      if (j == width) {
        i++;
        j = 0;
      }
    }
  }
  return coloredField;
}
