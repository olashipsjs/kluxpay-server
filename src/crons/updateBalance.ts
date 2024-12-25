import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';

const updateBalance = async () => {
  try {
    const wallets = await Wallet.find();

    for (const wallet of wallets) {
      let balance: number | undefined = undefined;

      switch (wallet.network) {
        case 'ethereum':
          balance = await ethereumService.getContractBalance({
            walletAddress: wallet.publicKey,
          });
          break;

        default:
          throw new Error(`Unsupported blockchain network: ${wallet.network}`);
      }

      console.log({ wallet: wallet.publicKey, balance });

      wallet.balance = balance || 0;

      await wallet.save();
    }
  } catch (error) {
    console.error('Error updating balance:', error);
  }
};

export default updateBalance;
