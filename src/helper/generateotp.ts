import { randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
export const generateOtp = () => {
  const otp = randomInt(100000, 1000000);
  return otp;
};

export const generateShortUuid = () => {
  const uuid = uuidv4().replace(/-/g, '');
  const shortUuid = uuid.substr(0, 5);
  return shortUuid;
};

export function getDistanceInMeters(coord1, coord2) {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1.latitude * Math.PI) / 180; // φ, λ in radians
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export const generateUniqueID = () => {
  const characters = '0123456789';
  let result = '';
  const charactersLength = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return 'IMZ' + result;
};
