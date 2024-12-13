import { ethers } from 'ethers';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';
import solanaService from '../services/solanaService';

const updateBalance = async () => {
  try {
    const wallets = await Wallet.find();

    for (const wallet of wallets) {
      let balance: number | undefined = undefined;

      switch (wallet.platform) {
        case 'ethereum':
          balance = await ethereumService.getAssetBalance({
            walletAddress: wallet.publicKey,
          });
          break;

        case 'solana':
          balance = await solanaService.getBalance(wallet.publicKey);
          break;

        default:
          throw new Error(
            `Unsupported blockchain platform: ${wallet.platform}`
          );
      }

      console.log({ wallet: wallet.publicKey, balance });

      wallet.balance = String(balance);

      await wallet.save();
    }
  } catch (error) {
    console.error('Error updating balance:', error);
  }
};

export default updateBalance;
