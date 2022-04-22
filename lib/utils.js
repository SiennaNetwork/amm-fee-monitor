const BigNumber = require('bignumber.js');

function timePassedPercentage(launch, start, duration) {
  // If the start and duration is 0 then its already over
  if (start === 0 && duration === 0) {
    return 100;
  }

  const end = launch + duration + start;
  const today = Date.now() / 1000;
  const percent = Math.round(
    (Math.abs(today - launch) / Math.abs(end - launch)) * 100,
  );
  return percent;
}

function convertToken(balance, precision) {
  return BigNumber(balance).shiftedBy(-precision);
}

function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;

  out = '';
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0),
        );
        break;
    }
  }

  return out;
}

module.exports = {
  convertToken,
  Utf8ArrayToStr,
  timePassedPercentage,
};
