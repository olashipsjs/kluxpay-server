import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { isBase58 } from 'validator';
import * as ed25519 from 'ed25519-hd-key';
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import mnemonicService from './mnemonicService';

const solanaService = {
  isValidWalletAddress: (address: string): boolean => isBase58(address),

  createWallet: async (
    mnemonic: string
  ): Promise<
    | {
        privateKey: string;
        publicKey: string;
      }
    | undefined
  > => {
    try {
      // Use BIP44 path for Solana (m/44'/501'/0'/0')
      const path = "m/44'/501'/0'/0'";
      const seed = mnemonicService.toSeed(mnemonic);

      // Derive the ed25519 keypair using the BIP44 path
      const { key } = ed25519.derivePath(path, seed.toString('hex'));

      const newKeyPair = Keypair.fromSeed(key.slice(0, 32));
      const publicKey = newKeyPair.publicKey.toBase58();
      const privateKey = Buffer.from(newKeyPair.secretKey).toString('hex');

      return { privateKey, publicKey };
    } catch (error) {
      console.log(error);
      throw new Error((error as Error).message);
    }
  },

  getBalance: async (walletAddress: string): Promise<number | undefined> => {
    try {
      if (!solanaService.isValidWalletAddress(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      const connection = new Connection(process.env.SOLANA_RPC!);
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      return balance / 1e9; // covert lamports to solana
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error(
        `Failed to fetch balance for wallet ${walletAddress}: ${
          (error as Error).message
        }`
      );
    }
  },

  getTokenBalance: async (
    walletAddress: string,
    tokenMintAddress: string
  ): Promise<any | undefined> => {
    // Connect to Solana devnet (or use 'mainnet-beta' for production)
    const connection = new Connection(
      'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    // Convert wallet address and token mint address to PublicKey
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    // Fetch all token accounts owned by the wallet
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      walletPublicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    // Loop through token accounts and find the one matching the token mint address
    for (const tokenAccountInfo of tokenAccounts.value) {
      const accountInfo = AccountLayout.decode(tokenAccountInfo.account.data);
      const mintAddress = new PublicKey(accountInfo.mint);

      // Check if this account is for the specified token mint
      if (mintAddress.equals(tokenMintPublicKey)) {
        const balance = accountInfo.amount;
        console.log(`Token Balance: ${balance}`);
        return Number(balance);
      }
    }

    console.log('Token not found for the specified mint address.');
    return null;
  },
};

export default solanaService;
