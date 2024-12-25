const walletDef = `#graphql

    scalar JSON

    type Wallet {
        user: User!
        _id: String!
        name: String
        escrow: String!
        balance: String!
        network: String!,
        publicKey: String!,
        privateKey: String!,
    }

    input GetAssetBalancePayload {
        walletId: String!
        contractAddress: String
    }

    type Query {
        getWallets: [Wallet]
        getUserWallets: [Wallet]
        getWallet(id: ID!): Wallet
        getAssetBalance(payload: GetAssetBalancePayload!): JSON
    }

    input CreateWalletPayload {
        email: String!
        networks: String!
    }

   
    input SendAssetPayload {
        to: String!
        amount: Float!
        walletId: String!
        contractAddress: String
    }

    input UpdateWalletPayload {
        network: String
        name: String
    }

    type Mutation {
        sendAsset(payload: SendAssetPayload!): JSON
        updateWallet(id: ID! payload: UpdateWalletPayload!): Wallet
        createWallet(payload: CreateWalletPayload!): [Wallet!]
    }

`;

export default walletDef;
