import Wallet from '../../models/wallet';
import aws256gsm from '../../utils/aws256gsm';
import handleError from '../../utils/handleError';
import ethereumService from '../../services/ethereumService';
import Network from '../../models/network';
import Transaction from '../../models/transaction';
import bearerAuthorization from '../../middlewares/bearerAuthorization';

const contractResolver = {
  Query: {
    getTokenBalance: async (
      _: any,
      variables: { walletId: string; contractAddress: string },
      { req }: any
    ) => {
      const { contractAddress, walletId } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);
        const wallet = await Wallet.findOne({
          _id: walletId,
          user: loggedInUser.id,
        });

        if (!wallet) {
          throw new Error(`Wallet not found ${walletId}`);
        }

        const network = await Network.findOne({ name: wallet.network });

        if (!network) {
          throw new Error('Network not found');
        }

        let balance;

        if (network.name === 'ethereum') {
          balance = await ethereumService.getContractBalance({
            contractAddress,
            walletAddress: wallet.publicKey,
          });
        }

        return balance;
      } catch (error) {
        handleError(error);
      }
    },

    getGasEstimate: async (
      _: any,
      variables: {
        to: string;
        value: string;
        maxFeePerGas?: string;
        maxPriorityFee: string;
      },
      { req }: any
    ) => {
      const { to, value, maxPriorityFee, maxFeePerGas } = variables;

      try {
        await bearerAuthorization(req);

        const gasEstimate = await ethereumService.calculateGas({
          to,
          value,
          maxFeePerGas,
          maxPriorityFee,
        });

        return gasEstimate;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    sendToken: async (
      _: any,
      variables: {
        to: string;
        amount: number;
        walletId: string;
        contractAddress: string;
      },
      { req }: any
    ) => {
      const { walletId, to, amount, contractAddress } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const wallet = await Wallet.findOne({
          _id: walletId,
        });

        if (!wallet) {
          throw new Error(`Wallet not found ${walletId}`);
        }

        const network = await Network.findOne({ name: wallet.network });
        if (!network) {
          throw new Error('Wallet network not found');
        }

        let tx;

        if (network.name === 'ethereum') {
          tx = await ethereumService.send({
            to,
            contractAddress,
            amount: String(amount),
            signingKey: aws256gsm.decrypt(wallet.privateKey),
          });
        }

        await Transaction.create({
          to: tx.to,
          from: tx.from,
          amount: amount,
          txHash: tx.hash,
          type: 'withdraw',
          user: loggedInUser.id,
          network: network.name,
          confirmations: await tx.confirmations(),
        });

        return tx;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default contractResolver;
