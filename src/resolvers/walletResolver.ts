import { ethers } from 'ethers';
import User from '../models/user';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';
import aws256gsm from '../utils/aws256gsm';
import bearerAuthorization from '../middlewares/bearerAuthorization';

const walletResolver = {
  Query: {
    getWallet: async (_: any, { id }: { id: string }, { req }: any) => {
      try {
        const user = await bearerAuthorization(req);

        const wallet = await Wallet.findById(id);

        if (!wallet) {
          throw new Error('Could not find user wallet');
        }

        if (user.id.toString() !== wallet.user.toString()) {
          throw new Error('Unauthorized request.');
        }

        return wallet;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    getUserWallets: async (_: any, __: any, { req }: any) => {
      try {
        const { id } = await bearerAuthorization(req);
        const wallets = await Wallet.find({ user: id });

        if (!wallets || wallets.length === 0) {
          throw new Error('No wallets found');
        }

        return wallets;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    getWallets: async (_: any, __: any, { req }: any) => {
      try {
        await bearerAuthorization(req);

        const wallets = await Wallet.find();

        if (!wallets || wallets.length === 0) {
          throw new Error('No existing wallets was found');
        }

        return wallets;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    getAssetBalance: async (
      _: any,
      {
        payload,
      }: {
        payload: {
          walletId: string;
          contractAddress: string;
        };
      },
      { req }: any
    ) => {
      const { walletId, contractAddress } = payload;

      try {
        const { id } = await bearerAuthorization(req);

        const wallet = await Wallet.findById(walletId);

        if (!wallet) throw new Error('Wallet not found');

        if (id.toString() !== wallet.user.toString())
          throw new Error('Unauthorized request.');

        let balance: undefined | number = undefined;

        switch (wallet.network) {
          case 'ethereum':
            balance = await ethereumService.getContractBalance({
              contractAddress,
              walletAddress: wallet.publicKey,
            });
            break;

          default:
            throw new Error('Invalid blockchain platform');
        }

        return balance;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Wallet: {
    user: async ({ user }: any) => {
      try {
        const document = await User.findById(user);
        return document;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    createWallet: async (
      _: any,
      { payload }: { payload: { email: string; networks: string } }
    ) => {
      try {
        const user = await User.findOne({ email: payload.email });

        if (!user) {
          throw new Error('Could not find user account');
        }

        const networks = payload.networks.split(',');
        const wallets = [];

        for (const network of networks) {
          let keys: Awaited<ReturnType<typeof ethereumService.createWallet>> =
            undefined;

          switch (network.trim().toLowerCase()) {
            case 'ethereum':
              keys = await ethereumService.createWallet();
              break;

            default:
              throw new Error('Unsupported network: ' + network);
          }

          if (!keys) {
            throw new Error('Failed to create wallet');
          }

          const { publicKey, privateKey } = keys;
          const encryptedPrivateKey = aws256gsm.encrypt(privateKey);

          const wallet = new Wallet({
            network,
            publicKey,
            user: user._id,
            privateKey: encryptedPrivateKey,
          });

          await wallet.save();
          wallets.push(wallet);
        }

        return wallets;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    updateWallet: async (
      _: any,
      { id, payload }: { id: string; payload: { publicKey?: string } },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const wallet = await Wallet.findOneAndUpdate(
          { _id: id, user: user.id },
          payload,
          { new: true }
        );

        return wallet;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    sendToken: async (
      _: any,
      {
        payload,
      }: {
        payload: {
          to: string;
          amount: string;
          walletId: string;
          contractAddress?: string;
        };
      },
      { req }: any
    ) => {
      try {
        const { id } = await bearerAuthorization(req);

        const wallet = await Wallet.findOne({
          _id: payload.walletId,
          user: id,
        });

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        let tx: null | ethers.TransactionResponse = null;

        switch (wallet.network) {
          case 'ethereum':
            tx = await ethereumService.send({
              to: payload.to,
              amount: payload.amount,
              signingKey: wallet.privateKey,
              contractAddress: payload.contractAddress,
            });
        }

        return { to: payload.to, amount: payload.amount };
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default walletResolver;
