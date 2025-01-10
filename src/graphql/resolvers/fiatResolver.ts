import { getFiats } from '../../apis/fiat';
import cache from '../../utils/cache';
import handleError from '../../utils/handleError';

const fiatResolver = {
  Query: {
    getAllFiats: async () => {
      try {
        let fiats: any = [];
        const cacheFiats = await cache.get('fiats');

        if (cacheFiats) {
          fiats = JSON.parse(cacheFiats as string);
        } else {
          await getFiats();
          fiats = JSON.parse((await cache.get('fiats')) || '[]');
        }

        return fiats;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default fiatResolver;
