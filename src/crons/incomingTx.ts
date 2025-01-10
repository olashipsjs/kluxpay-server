import { ethers } from 'ethers';
import Network from '../models/network';
import Transaction from '../models/transaction';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';
import handleError from '../utils/handleError';

const incomingTx = async () => {
  try {
    const wallets = await Wallet.find().populate({ path: 'user' });

    if (!wallets) {
      console.error('No wallets found');
    }

    for (const wallet of wallets) {
      const network = await Network.findOne({ name: wallet.network });

      if (network?.name !== 'ethereum') continue;

      // Fetch the transaction history of the wallet
      // Get the latest block number
      const latestBlock = await ethereumService.provider.getBlockNumber();

      const transactions: any[] = [];

      // Loop through the last few blocks to get transaction data (you can adjust the range)
      for (let i = latestBlock; i >= latestBlock - 10; i--) {
        const block = await ethereumService.provider.getBlock(i);
        if (!block || !block.transactions) {
          console.log('No transactions found');
          continue;
        }

        block.transactions.forEach(async (tx) => {
          const transaction = await ethereumService.provider.getTransaction(tx);

          if (
            transaction?.from?.toLowerCase() ===
              wallet.publicKey.toLowerCase() ||
            transaction?.to?.toLowerCase() === wallet.publicKey.toLowerCase()
          ) {
            transactions.push(tx);
          }
        });
      }

      // Output the transactions
      console.log(transactions);
    }
  } catch (error) {
    handleError(error);
  }
};

export default incomingTx;
