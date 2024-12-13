import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Factory } from 'bip32';
import { randomBytes } from 'crypto';

const bitcoinService = {
  createWallet: () => {
    const network = bitcoin.networks.bitcoin;
    const path = `m/44'/0'/0'/0`;
    const bip32 = BIP32Factory(ecc);

    const seed = randomBytes(32);
    const root = bip32.fromSeed(seed, network);

    const account = root.derivePath(path);
    const node = account.derive(0).derive(0);

    const { address } = bitcoin.payments.p2pkh({
      pubkey: node.publicKey,
      network: network,
    });

    if (!address) {
      throw new Error('Error occurred while creating bitcoin wallet');
    }

    return {
      publicKey: address,
      privateKey: node.toWIF(),
    };
  },

  getBalance: () => {},
};

export default bitcoinService;
