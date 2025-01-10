import { randomBytes, randomInt } from 'crypto';

const random = {
  number: (length: number = 6): string => {
    let index = 0;
    let str = '';

    while (index < length) {
      const randomNumber = randomInt(9);
      str += randomNumber;
      index++;
    }

    return str;
  },

  string: (length: number = 64) => {
    const randomString = randomBytes(64).toString('hex').substring(0, length);

    return randomString;
  },
};

export default random;
