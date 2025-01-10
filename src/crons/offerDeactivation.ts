import { getCoinsList } from '../apis/coins';
import Offer from '../models/offer';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';
import cache from '../utils/cache';
import handleError from '../utils/handleError';

const offerDeactivation = async () => {
  const offers = await Offer.find().populate([
    { path: 'createdBy' },
    { path: 'coin' },
  ]);

  for (const offer of offers) {
    const wallet = await Wallet.findOne({
      user: offer.createdBy._id,
      network: (offer as any).coin?.network,
    });

    try {
      let balance: undefined | number = 0;

      let coins: any[] = [];

      const cachedCoins = await cache.get(`${offer.fiat}-coins-${1}`);

      if (cachedCoins) {
        coins = JSON.parse(cachedCoins as string);
      } else {
        // Cache miss: Fetch data again
        console.log('Cache miss. Fetching data...');

        await getCoinsList(1, offer.fiat);
        coins = JSON.parse(
          (await cache.get(`${offer.fiat}-coins-${1}`)) || '[]'
        );
      }

      const coin = coins.find((coin: any) => coin.id === Number(offer.coin));

      if (wallet?.network === 'ethereum') {
        balance = await ethereumService.getContractBalance({
          walletAddress: wallet.publicKey,
          contractAddress: coin?.platform?.token_address,
        });
      }

      if (balance === undefined) {
        balance = 0;
      }

      if (balance > offer.amount || offer.isActive === false) return;

      offer.isActive = false;
      await offer.save();

      console.log(
        `offer: ${offer._id} deactivated due to insufficient balance ${balance}`
      );
    } catch (error) {
      handleError(error);
    }
  }
};

export default offerDeactivation;
