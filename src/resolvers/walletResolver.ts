import { ethers } from 'ethers';
import User from '../models/user';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';
import aws256gsm from '../utils/aws256gsm';
import bearerAuthorization from '../middlewares/bearerAuthorization';

const walletResolver = {
  Query: {
    getWallet: async (
      _: any,
      { platform }: { platform: string },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const wallet = await Wallet.findOne({
          platform,
          userId: user.id,
        });

        if (!wallet) {
          throw new Error('Could not find user wallet');
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

    getBalance: async (_: any, __: any, { req }: any) => {
      try {
        const { id } = await bearerAuthorization(req);

        const wallets = await Wallet.find({ createdBy: id });

        let balance = 0;

        for (const wallet of wallets) {
          switch (wallet.platform) {
            case 'ethereum':
              const ethBalance = await ethereumService.getAssetBalance({
                walletAddress: wallet.publicKey,
              });

              if (ethBalance) {
                balance += ethBalance;
              }
          }
        }

        return { wallets, balance, totalWallets: wallets.length };
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
          platform: string;
          tokenAddress: string;
        };
      },
      { req }: any
    ) => {
      const { platform, tokenAddress } = payload;

      try {
        const { id } = await bearerAuthorization(req);

        const wallet = await Wallet.findOne({ platform, user: id });

        if (!wallet) throw new Error('Wallet not found');

        let balance: undefined | number = undefined;

        switch (wallet.platform) {
          case 'ethereum':
            balance = await ethereumService.getAssetBalance({
              tokenAddress,
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
      { payload }: { payload: { email: string } }
    ) => {
      try {
        const user = await User.findOne({ email: payload.email });

        if (!user) {
          throw new Error('Could not find user account');
        }

        const platforms = ['ethereum', 'bitcoin'];

        for (const platform of platforms) {
          const existingWallet = await Wallet.findOne({
            user: user._id,
            platform,
          });

          if (existingWallet) {
            throw new Error(
              `A wallet for platform "${platform}" already assigned to you`
            );
          }

          let keys: Awaited<ReturnType<typeof ethereumService.createWallet>> =
            undefined;

          switch (platform) {
            case 'ethereum':
              keys = await ethereumService.createWallet();
              break;

            default:
              throw new Error('Unsupported coin platform: ' + platform);
          }

          if (!keys) {
            throw new Error('Failed to create wallet');
          }

          const { publicKey, privateKey } = keys;
          const encryptedPrivateKey = aws256gsm.encrypt(privateKey);

          const wallet = new Wallet({
            platform,
            publicKey,
            user: user._id,
            privateKey: encryptedPrivateKey,
          });

          await wallet.save();

          return wallet;
        }
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    sendAsset: async (
      _: any,
      {
        payload,
      }: {
        payload: {
          to: string;
          from: string;
          amount: string;
          address?: string;
          decimals: number;
        };
      }
    ) => {
      try {
        const wallet = await Wallet.findById(payload.from);

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        let tx: null | ethers.TransactionResponse = null;

        switch (wallet.platform) {
          case 'ethereum':
            tx = await ethereumService.send({
              to: payload.to,
              amount: payload.amount,
              signingKey: wallet.privateKey,
              address: payload.address,
              decimals: payload.decimals,
            });

            return tx;

          default:
            throw new Error('Unsupported blockchain platform');
        }
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default walletResolver;
