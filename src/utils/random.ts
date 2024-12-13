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
    const randomString = randomBytes(length).toString('hex');

    return randomString;
  },
};

export default random;
