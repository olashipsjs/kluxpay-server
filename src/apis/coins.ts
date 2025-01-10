import axios from 'axios';
import cache from '../utils/cache';
import handleError from '../utils/handleError';

const headers = {
  'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY!,
};

export const getCoinsList = async (page: number, convert: string) => {
  try {
    const limit = 200;
    const start = (page - 1) * limit + 1;

    const params = {
      start,
      limit,
      convert: convert || 'USD',
    };

    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`,
      { headers, params }
    );

    const coins = await response.data.data;

    const data = coins?.map((coin: any) => {
      return {
        ...coin,
        logo: `https://s2.coinmarketcap.com/static/img/coins/128x128/${coin.id}.png`,
      };
    });

    // expires after 60 seconds
    await cache.set(`${convert}-coins-${page}`, JSON.stringify(data), 60000);
  } catch (error) {
    handleError(error);
  }
};
