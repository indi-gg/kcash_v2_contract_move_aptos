## Aptos Move Project: Building KCash Fungible Asset Token

Welcome to the Aptos Move Project! In this project, we are building a KCash fungible asset token with customized logic to facilitate efficient reward distribution among users.

#### Overview
The KCash token is designed to represent a fungible asset on the Aptos blockchain. It will enable users to transfer value seamlessly within the ecosystem while incorporating unique reward distribution mechanisms.

### Installation

##### For use in Node.js or a web application

Install with your favorite package manager such as npm, yarn, or pnpm:

Here 'pnpm' is used

1. Run this command in root directory.

    ```bash
    pnpm install 
    ```

    ```bash
    pnpm build 
    ```

2. Navigate to the typescript directory and Install there as well.

    ```bash
    cd indigg/typescript
    ```

    ```bash
    pnpm install 
    ```


To install Jest for testing, run below command:

```bash
cd indigg/typescript
```

```bash
pnpm install
```

```bash
pnpm jest
```



## Token Deployment

To deploy or publish your token, follow these steps:

1. Navigate to the TypeScript directory:
   ```bash
   cd indigg/typescript
   ```
2. Run script file:
    ```bash
    pnpm run kcash_fungible_asset
    ```

## Creating Keys 

To generate keys including public key, private key, and address for all users including admins, run the following command:
```bash
pnpm run createKeys
```

## Testing 

1. Navigate to the typescript folder.

```bash
cd indigg/typescript
```

2. Run the following command to test:
```bash
pnpm jest
```

## Update Network 

1. Open the tsup.config.ts file and find the line:
    ```bash
    APTOS_NETWORK: process.env.APTOS_NETWORK ?? "Devnet",
    ```
    And update Devnet with Testnet or Mainnet.
    ```bash
    APTOS_NETWORK: process.env.APTOS_NETWORK ?? "Testnet",
    ```

2. Also Update in Typescript file.
    ```bash
    // Setup the client
    const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
    ```
    And update Devnet with Testnet or Mainnet.
    ```bash
    // Setup the client
    const APTOS_NETWORK: Network = NetworkToNetworkName[Network.TESTNET];
    ```



#### Customized Logic
To enhance user engagement and participation, we have implemented a customized reward distribution system based on three distinct buckets:
- **Bot Balance**: Reserved for rewards generated through automated processes or interactions.
- **Earning Balance**: Accumulates rewards from user activities such as transactions, referrals, or other engagements.
- **Bonus Balance**: Intended for additional incentives or special rewards based on predefined criteria or events.


#### Implementation Details
The KCash token utilizes Move programming language to implement the reward distribution logic securely and efficiently. By leveraging Move's robust capabilities, we ensure that rewards are distributed accurately and transparently while maintaining the integrity of the blockchain network.