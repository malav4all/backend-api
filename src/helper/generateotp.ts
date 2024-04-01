import { randomInt } from 'crypto';
export const generateOtp = () => {
  const otp = randomInt(100000, 1000000);
  return otp;
};
