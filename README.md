## Aptos Move Project: Building KCash Fungible Asset Token

Welcome to the Aptos Move Project! In this project, we are building a KCash fungible asset token with customized logic to facilitate efficient reward distribution among users.

#### Overview
The KCash token is designed to represent a fungible asset on the Aptos blockchain. It will enable users to transfer value seamlessly within the ecosystem while incorporating unique reward distribution mechanisms.

### Installation

##### For use in Node.js or a web application

Install with your favorite package manager such as npm, yarn, or pnpm:

Run this command in root as well as in the typescript directory.

```bash
pnpm install 
```

Run this command in root directory.

```bash
pnpm build 
```
## Token Deployment

To deploy or publish your token, follow these steps:

1. Navigate to the TypeScript directory:
   ```bash
   cd typescript
   ```
2. Run script file:
    ```bash
    pnpm run kcash_fungible_asset
    ```

#### Customized Logic
To enhance user engagement and participation, we have implemented a customized reward distribution system based on three distinct buckets:
- **Bot Balance**: Reserved for rewards generated through automated processes or interactions.
- **Earning Balance**: Accumulates rewards from user activities such as transactions, referrals, or other engagements.
- **Bonus Balance**: Intended for additional incentives or special rewards based on predefined criteria or events.


#### Implementation Details
The KCash token utilizes Move programming language to implement the reward distribution logic securely and efficiently. By leveraging Move's robust capabilities, we ensure that rewards are distributed accurately and transparently while maintaining the integrity of the blockchain network.
