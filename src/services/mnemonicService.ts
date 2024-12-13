import * as bip39 from 'bip39';

const mnemonicService = {
  generate: () => {
    const mnemonic = bip39.generateMnemonic();

    if (!mnemonicService.validate(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }

    return mnemonic;
  },

  toSeed: (mnemonic: string) => {
    if (!mnemonicService.validate(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }

    return bip39.mnemonicToSeedSync(mnemonic);
  },

  validate: (mnemonic: string) => {
    return bip39.validateMnemonic(mnemonic);
  },
};

export default mnemonicService;
