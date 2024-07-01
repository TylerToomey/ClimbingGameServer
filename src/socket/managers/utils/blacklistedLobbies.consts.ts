export const BANNED_LOBBY_NAMES = [
  "HWEM",
  "HWMM",
  "UJKV",
  "EWEM",
  "EQEM",
  "EQMM",
  "CPWU",
  "CPKU",
  "CTUG",
  "CT\\G",
  "ENKV",
  "MNKV",
  "EQEM",
  "EQQP",
  "MQQP",
  "FCIQ",
  "FCOP",
  "FKEM",
  "FKMM",
  "FKEE",
  "F[MG",
  "FKMG",
  "IQQM",
  "JGGD",
  "JGNN",
  "JQOQ",
  "LK\\\\",
  "MKMG",
  "M[MG",
  "UNWV",
  "UJK\\",
  "VCTF",
  "URKE",
  "URKM",
  "VCTF",
  "VGTF",
  "VKVU",
  "VKV[",
  "VYCV",
  "YCPM",
  "UOGI",
  "RKUU",
  "PC\\K",
  "PCUK",
  "RCMK",
  "PKIC",
  "PIIC",
  "RWU[",
];

export const encrypt = (word: string): string => {
  let encryptedWord = "";
  for (let i = 0; i < word.length; i++) {
    const charCode = word.charCodeAt(i);
    const encryptedCharCode = charCode + 2;
    encryptedWord += String.fromCharCode(encryptedCharCode);
  }
  return encryptedWord;
};

export const getBannedRoomCodes = () => {
  return BANNED_LOBBY_NAMES.map((word) => decrypt(word));
};

export const decrypt = (encryptedWord: string): string => {
  let decryptedWord = "";
  for (let i = 0; i < encryptedWord.length; i++) {
    const charCode = encryptedWord.charCodeAt(i);
    const decryptedCharCode = charCode - 2; // Reverse the offset
    decryptedWord += String.fromCharCode(decryptedCharCode);
  }
  return decryptedWord;
};
