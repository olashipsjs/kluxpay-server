import axios from 'axios';
import handleError from '../utils/handleError';
import cache from '../utils/cache';

const headers = {
  'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY!,
};

export const getFiats = async () => {
  const url = 'https://pro-api.coinmarketcap.com/v1/fiat/map';

  try {
    const response = await axios.get(url, { headers });
    const fiats = await response.data.data;

    // expires in 60 seconds
    await cache.set('fiats', JSON.stringify(fiats), 30000);
  } catch (error) {
    handleError(error);
  }
};
