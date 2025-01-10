import Wallet, { WalletDocument } from '../../models/wallet';
import ethereumService from '../../services/ethereumService';
import aws256gsm from '../../utils/aws256gsm';
import bearerAuthorization from '../../middlewares/bearerAuthorization';
import handleError from '../../utils/handleError';
import User from '../../models/user';
import Network from '../../models/network';

const walletResolver = {
  Query: {
    getWalletById: async (_: any, { id }: { id: string }, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const wallet = await Wallet.findOne({
          _id: id,
          user: loggedInUser.id,
        });

        if (!wallet) {
          throw new Error('Could not find user wallet');
        }

        return wallet;
      } catch (error) {
        handleError(error);
      }
    },

    getUserWallets: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const wallets = await Wallet.find({ user: loggedInUser.id });

        if (!wallets || wallets.length === 0) {
          throw new Error('No wallets found');
        }

        return wallets;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Wallet: {
    user: async (parent: WalletDocument) => {
      try {
        const wallet = await Wallet.findById(parent._id).populate({
          path: 'user',
          select: '-password',
        });
        return wallet?.user;
      } catch (error) {
        handleError(error);
      }
    },
    network: async (parent: WalletDocument) => {
      try {
        const network = await Network.findOne({ name: parent.network });
        return network;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    createWallets: async (
      _: any,
      variables: { email: string; networks: string }
    ) => {
      const { networks, email } = variables;

      try {
        const count = await Wallet.countDocuments();

        let wallets = [];

        for (const network of networks.split(',')) {
          const user = await User.findOne({ email });

          if (!user) {
            throw new Error('User was not found');
          }

          const existingWallet = await Wallet.findOne({
            user: user._id,
            network: network,
          });

          if (existingWallet) {
            throw new Error('A wallet with the same network already exists');
          }

          let keys;

          switch (network) {
            case 'ethereum':
              keys = await ethereumService.createWallet();
              break;

            default:
              throw new Error('Unsupported network: ' + network);
          }

          if (!keys) {
            throw new Error('Failed to create wallet');
          }

          const wallet = await Wallet.create({
            user: user._id,
            network: network,
            publicKey: keys.publicKey,
            name: `Wallet ${count + 1}`,
            mnemonicPhrase: keys.mnemonicPhrase,
            privateKey: aws256gsm.encrypt(keys.privateKey),
          });

          wallets.push(wallet);
        }

        return wallets;
      } catch (error) {
        handleError(error);
      }
    },

    updateWallet: async (
      _: any,
      variables: { walletId: string; name: string },
      { req }: any
    ) => {
      const { walletId, name } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const wallet = await Wallet.findOneAndUpdate(
          { _id: walletId, user: loggedInUser.id },
          { name },
          { new: true }
        );

        return wallet;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default walletResolver;
