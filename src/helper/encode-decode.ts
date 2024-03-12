/* eslint-disable */
import * as cryptoJS from 'crypto-js';

export const encrypt = (data: any, key: any) => {
  const ciphertext = cryptoJS.AES.encrypt(JSON.stringify(data), key);
  return ciphertext.toString();
};

export const decrypt = (ciphertext: any, key: any) => {
  try {
    var bytes = cryptoJS.AES.decrypt(ciphertext.toString(), key);
    if (bytes) {
      var decryptedData = JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
      return decryptedData;
    }
  } catch (error) {
    return;
  }
};

export const hash = (data: any) => cryptoJS.SHA512(data).toString();

export const generateKey = async () => {
  const randomBytes = await Math.floor(Math.random() * Math.floor(16));
  return hash(randomBytes.toString());
};
