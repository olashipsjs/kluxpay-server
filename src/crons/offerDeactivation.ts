import p2pContracts from '../constants/p2pContracts';
import Offer from '../models/offer';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';

const offerDeactivation = async () => {
  const offers = await Offer.find().populate('createdBy');

  for (const offer of offers) {
    for (const contract of p2pContracts) {
      const wallets = await Wallet.find({
        user: offer.createdBy._id,
      });

      for (const wallet of wallets) {
        let balance;

        try {
          switch (contract.network) {
            case 'ethereum':
              balance = await ethereumService.getContractBalance({
                walletAddress: wallet.publicKey,
                contractAddress: contract.address,
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
  }
};

export default offerDeactivation;
