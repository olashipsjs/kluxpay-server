const walletDef = `#graphql

    scalar JSON

    type Wallet {
        user: User!
        _id: String!
        escrow: String!
        balance: String!
        platform: String!,
        publicKey: String!,
        privateKey: String!,
    }

    input GetAssetBalancePayload {
        platform: String!
        tokenAddress: String
    }

    input WalletBalancePayload {
        platform: String!
    }

    type Query {
        getWallets: [Wallet]
        getUserWallets: [Wallet]
        getBalance: JSON
        getWallet(platform: String!): Wallet
        getAssetBalance(payload: GetAssetBalancePayload!): JSON
    }

    input CreateWalletPayload {
        email: String!
    }

   
    input SendPayload {
        to: String!
        from: String!
        amount: Float!
        address: String
        decimals: Int
    }

    type Mutation {
        sendAsset(payload: SendPayload!): JSON
        createWallet(payload: CreateWalletPayload!): Wallet
    }

`;

export default walletDef;
