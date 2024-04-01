import { v4 as uuidv4 } from 'uuid';
export const generateOtp = (): { otp: string; timestamp: number } => {
  const length = 6;
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  const timestamp = Date.now();
  return { otp, timestamp };
};

export const isWithinExpirationTime = (timestamp: number): boolean => {
  const expirationTime = 5 * 60 * 1000;
  const currentTime = Date.now();

  return currentTime - timestamp <= expirationTime;
};

export const generateShortUuid = () => {
  const uuid = uuidv4().replace(/-/g, '');
  const shortUuid = uuid.substr(0, 5);
  return shortUuid;
};
