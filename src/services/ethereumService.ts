import { ethers } from 'ethers';
import handleError from '../utils/handleError';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() public view returns (uint8)',
];

export const provider = new ethers.InfuraProvider(
  'sepolia',
  process.env.INFURA_KEY
);

const ethereumService = {
  provider,
  createWallet: async () => {
    try {
      const wallet = ethers.Wallet.createRandom(provider);

      return {
        privateKey: wallet.privateKey,
        publicKey: wallet.address,
        mnemonicPhrase: wallet.mnemonic?.phrase,
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
        const balanceOf = await contract.balanceOf(walletAddress);

        balance = parseFloat(ethers.formatUnits(balanceOf, decimals));

        return balance;
      }

      const bigIntBalance = await provider.getBalance(walletAddress);
      balance = parseFloat(ethers.formatEther(bigIntBalance));

      return balance;
    } catch (error) {
      handleError(error);
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
        if (!ethers.isAddress(contractAddress)) {
          throw new Error('Invalid contract address');
        }

        const contract = new ethers.Contract(
          contractAddress,
          ERC20_ABI,
          wallet
        );

        const decimals = await contract.decimals();

        const sender = wallet.address;
        const balanceOfSender = await contract.balanceOf(sender);
        const senderBalance = parseFloat(
          ethers.formatUnits(balanceOfSender, decimals)
        );

        if (senderBalance < parseFloat(amount)) {
          throw new Error('Insufficient balance.');
        }

        const amountInSmallestUnit = ethers.parseUnits(amount, decimals);

        tx = await contract.transfer(to, amountInSmallestUnit);
        await tx.wait();
        return tx;
      }

      const amountInWei = ethers.parseEther(amount);
      tx = await wallet.sendTransaction({ to, value: amountInWei });
      await tx.wait();
      return tx;
    } catch (error) {
      handleError(error);
    }
  },

  getTransactionReceipt: async (hash: string) => {
    try {
      const receipt = await provider.getTransactionReceipt(hash);

      return receipt;
    } catch (error) {
      handleError(error);
    }
  },

  calculateGas: async (transaction: {
    to: string;
    value: string;
    maxFeePerGas?: string;
    maxPriorityFee: string;
  }) => {
    const { to, value, maxPriorityFee, maxFeePerGas } = transaction;

    try {
      const gasLimit = await provider.estimateGas({
        to,
        value: ethers.parseEther(value),
        data: '0x',
      });

      const block = await provider.getBlock('latest');
      const baseFeePerGas = block?.baseFeePerGas || ethers.toBigInt(0);

      const maxPriorityFeePerGas = ethers.parseUnits(maxPriorityFee, 'gwei');
      const maxFeePerGasParsed = maxFeePerGas
        ? ethers.parseUnits(maxFeePerGas, 'gwei')
        : baseFeePerGas + maxPriorityFeePerGas;

      if (maxFeePerGasParsed < baseFeePerGas + maxPriorityFeePerGas) {
        throw new Error(
          'maxFeePerGas must be at least baseFeePerGas + maxPriorityFeePerGas'
        );
      }

      const totalCost = ethers.formatEther(
        gasLimit * (baseFeePerGas + maxPriorityFeePerGas)
      );

      return {
        cost: totalCost,
        limit: gasLimit.toString(),
        baseFeePerGas: ethers.formatUnits(baseFeePerGas, 'gwei'),
        maxFeePerGas: ethers.formatUnits(maxFeePerGasParsed, 'gwei'),
        maxPriorityFeePerGas: ethers.formatUnits(maxPriorityFeePerGas, 'gwei'),
      };
    } catch (error) {
      handleError(error);
    }
  },

  block: async (): Promise<ethers.Block | null> => {
    try {
      return await new Promise((resolve, reject) => {
        provider.once('block', async (blockNumber: number) => {
          try {
            const block = await provider.getBlock(blockNumber);
            resolve(block);
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      handleError(error);
      return null;
    }
  },
};

export default ethereumService;
