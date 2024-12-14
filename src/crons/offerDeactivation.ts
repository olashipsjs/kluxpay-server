import p2pContracts from '../constants/p2pContracts';
import Offer from '../models/offer';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';

const offerDeactivation = async () => {
  const offers = await Offer.find().populate('createdBy');

  for (const offer of offers) {
    for (const contract of p2pContracts) {
      const wallet = await Wallet.findOne({
        user: offer.createdBy._id,
        platform: contract.platform,
      });

      if (!wallet) throw new Error('Wallet was not found');

      let balance;

      try {
        switch (contract.platform) {
          case 'ethereum':
            balance = await ethereumService.getAssetBalance({
              walletAddress: wallet.publicKey,
              tokenAddress: contract.address,
            });
        }

        if (balance === undefined || balance === null)
          throw new Error('Unable to fetch asset balance.');

        if (balance > offer.amount) return;

        offer.isActive = false;
        await offer.save();
      } catch (error) {
        console.error('An error occurred during offer activation:', error);
        throw error;
      }
    }
  }
};

export default offerDeactivation;
