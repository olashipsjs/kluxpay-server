const walletDef = `#graphql
    type Wallet {
        user: User!
        _id: String!
        name: String
        network: Network!,
        publicKey: String!,
        privateKey: String!,
        mnemonicPhrase: String
    }

    type Query {
        getUserWallets: [Wallet]
        getWalletById(walletId: ID!): Wallet
    }

    type Mutation {
        createWallets(email: String!, networks: String!): [Wallet]!
        updateWallet(walletId: ID!, name: String!): Wallet
    }

`;

export default walletDef;
