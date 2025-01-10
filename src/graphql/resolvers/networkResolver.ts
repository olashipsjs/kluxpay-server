import Network from '../../models/network';
import handleError from '../../utils/handleError';

const data = [
  {
    ticker: 'BTC',
    symbol: 'btc',
    name: 'bitcoin',
    url: 'https://bitcoin.org/',
    image:
      'https://cdn.iconscout.com/icon/free/png-512/free-bitcoin-logo-icon-download-in-svg-png-gif-file-formats--crypto-logos-pack-business-icons-441959.png?f=webp&w=256',
  },
  {
    ticker: 'ETH',
    symbol: 'eth',
    name: 'ethereum',
    url: 'https://ethereum.org/',
    image:
      'https://cdn.iconscout.com/icon/free/png-512/free-ethereum-logo-icon-download-in-svg-png-gif-file-formats--company-brand-world-logos-vol-11-pack-icons-283135.png?f=webp&w=256',
  },
];

const networkResolver = {
  Query: {
    getNetworkByName: async (_: any, { name }: { name: string }) => {
      try {
        const network = await Network.findOne({ name });
        return network;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    createNetworks: async (_: any) => {
      try {
        const networks = await Network.insertMany(data);
        return networks;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default networkResolver;
