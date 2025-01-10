import { getCoinsList } from '../../apis/coins';
import cache from '../../utils/cache';
import handleError from '../../utils/handleError';

const coinResolver = {
  Query: {
    getAllCoins: async (_: any, variables: any) => {
      const { page = 1, convert = 'USD' } = variables;

      try {
        let coins: any[] = [];

        const cachedCoins = await cache.get(`${convert}-coins-${page}`);

        if (cachedCoins) {
          coins = JSON.parse(cachedCoins as string);
        } else {
          // Cache miss: Fetch data again
          console.log('Cache miss. Fetching data...');

          await getCoinsList(page, convert);
          coins = JSON.parse(
            (await cache.get(`${convert}-coins-${page}`)) || '[]'
          );
        }

        const platforms = 'ethereum';
        const PLATFORMS = platforms.split(',');

        const allCoins = coins.filter(
          (coin: any) =>
            (coin.platform &&
              PLATFORMS.includes(coin.platform.name.toLowerCase())) ||
            coin.name === 'Ethereum'
        );

        return allCoins;
      } catch (error) {
        handleError(error);
      }
    },

    getAllP2PCoins: async (_: any, variables: any) => {
      const { convert = 'USD' } = variables;
      const page = 1;

      try {
        let coins: any[] = [];

        const cachedCoins = await cache.get(`${convert}-coins-${page}`);

        if (cachedCoins) {
          coins = JSON.parse(cachedCoins as string);
        } else {
          // Cache miss: Fetch data again
          console.log('Cache miss. Fetching data...');

          await getCoinsList(1, convert);
          coins = JSON.parse(
            (await cache.get(`${convert}-coins-${page}`)) || '[]'
          );
        }

        const ids = [1027, 825, 3408];

        const allCoins = coins.filter((coin: any) => ids.includes(coin.id));

        return allCoins;
      } catch (error) {
        handleError(error);
      }
    },

    getCoinQuote: async (
      _: any,
      variables: { coinId: number; convert: string }
    ) => {
      const { coinId, convert } = variables;

      try {
        let page = 1;
        const maxPage = 10;
        let coin = null;

        while (page <= maxPage) {
          const cacheKey = `${convert}-coins-${page}`;
          let coins: any[] = [];

          // Fetch coins from cache or API
          const cachedCoins = await cache.get(cacheKey);

          if (cachedCoins) {
            coins = JSON.parse(cachedCoins as string);
          } else {
            // Fetch from API if not in cache
            await getCoinsList(page, convert);
            const newCachedCoins = await cache.get(cacheKey);
            if (newCachedCoins) {
              coins = JSON.parse(newCachedCoins as string);
            }
          }

          // Check if the coin is in the current page's list
          coin = coins.find((c: any) => c.id === coinId);
          if (coin) {
            return coin; // Return the coin and stop further iteration
          }

          page++; // Move to the next page
        }

        // If no coin is found after all pages are checked
        return null;
      } catch (error) {
        handleError(error);
        return null;
      }
    },

    getCoinByName: async (
      _: any,
      variables: { coinName: number; convert: string }
    ) => {
      const { coinName, convert } = variables;

      try {
        let page = 1;
        const maxPage = 10;
        let coin = null;

        while (page <= maxPage) {
          const cacheKey = `${convert}-coins-${page}`;
          let coins: any[] = [];

          // Fetch coins from cache or API
          const cachedCoins = await cache.get(cacheKey);

          if (cachedCoins) {
            coins = JSON.parse(cachedCoins as string);
          } else {
            // Fetch from API if not in cache
            await getCoinsList(page, convert);
            const newCachedCoins = await cache.get(cacheKey);
            if (newCachedCoins) {
              coins = JSON.parse(newCachedCoins as string);
            }
          }

          // Check if the coin is in the current page's list
          coin = coins.find((c: any) => c.slug === coinName);
          if (coin) {
            return coin; // Return the coin and stop further iteration
          }

          page++; // Move to the next page
        }

        // If no coin is found after all pages are checked
        return null;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
  },
};

export default coinResolver;
