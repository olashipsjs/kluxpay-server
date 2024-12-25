import { ethers } from 'ethers';

const ERC20_ABI = [
  'function transfer(address to, uint amount) public returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export const provider = new ethers.InfuraProvider(
  'mainnet',
  process.env.INFURA_KEY
);

const ethereumService = {
  createWallet: async (): Promise<
    | {
        privateKey: string;
        publicKey: string;
      }
    | undefined
  > => {
    try {
      const { address, privateKey } = ethers.Wallet.createRandom();

      return {
        privateKey,
        publicKey: address,
      };
    } catch (error) {
      console.log(error);
      throw new Error((error as Error).message);
    }
  },

  getContractBalance: async (args: {
    walletAddress: string;
    contractAddress?: string;
  }): Promise<number | undefined> => {
    const { walletAddress, contractAddress } = args;

    try {
      let balance = 0;

      if (contractAddress) {
        if (!ethers.isAddress(contractAddress)) {
          throw new Error('Invalid token address');
        }

        const contract = new ethers.Contract(
          contractAddress,
          ERC20_ABI,
          provider
        );
        const decimals = await contract.decimals();

        const formattedDecimals = Number(decimals);

        const balanceOf = await contract.balanceOf(walletAddress);

        balance = parseFloat(ethers.formatUnits(balanceOf, formattedDecimals));

        return balance;
      }

      const bigIntBalance = await provider.getBalance(walletAddress);
      balance = parseFloat(ethers.formatEther(bigIntBalance));

      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error((error as Error).message);
    }
  },

  getTx: async (hash: string) => {
    try {
      const tx = await provider.getTransaction(hash);
      return tx;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  },

  send: async ({
    to,
    amount,
    signingKey,
    contractAddress,
  }: {
    to: string;
    amount: string;
    signingKey: string;
    contractAddress?: string;
  }) => {
    try {
      const wallet = new ethers.Wallet(signingKey, provider);
      let tx = null;

      if (contractAddress) {
        const contract = new ethers.Contract(
          contractAddress,
          ERC20_ABI,
          wallet
        );

        const decimals = await contract.decimals();

        const formattedDecimals = Number(decimals);

        const tokenAmount = ethers.parseUnits(amount, formattedDecimals);

        tx = await contract.transfer(to, tokenAmount);
        await tx.wait();
      } else {
        const amountInWei = ethers.parseEther(amount);
        tx = await wallet.sendTransaction({ to, value: amountInWei });
      }

      return tx;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new Error('Transaction failed');
    }
  },

  getTransactionReceipt: async (hash: string) => {
    try {
      const receipt = await provider.getTransactionReceipt(hash);

      return receipt;
    } catch (error) {
      console.log(error);
      throw new Error((error as Error).message);
    }
  },
};

export default ethereumService;
