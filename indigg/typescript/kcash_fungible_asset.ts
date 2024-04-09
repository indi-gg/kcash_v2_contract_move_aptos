/* eslint-disable no-console */
/* eslint-disable max-len */

import {
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  Ed25519Account,
  InputViewFunctionData,
  Network,
  NetworkToNetworkName,
  Ed25519PrivateKey,
  
} from "@aptos-labs/ts-sdk";
import { compilePackage, getPackageBytesToPublish } from "./utils";
import fs from "fs";

/**
 * This example demonstrate how one can compile, deploy, and mint its own fungible asset (FA)
 * It uses the fa_coin.move module that can be found in the move folder
 *
 * Before running this example, we should compile the package locally:
 * 1. Acquire the Aptos CLI, see https://aptos.dev/cli-tools/aptos-cli/use-cli/install-aptos-cli
 * 2. cd `~/aptos-ts-sdk/examples/typescript`
 * 3. Run `pnpm run your_coin`
 */

// Setup the client
const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
console.log("APTOS_NETWORK3000",APTOS_NETWORK);

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const module_name = "move/counter"; // Path to the package which has the module
const output_file_path = "move/counter/counter.json"; // Path to JSON file
const address_name = "CAddr"; // Address name from move.toml

let owner_kp = JSON.parse(fs.readFileSync("./keys/owner.json", "utf8"));
const privateKeyOwner = new Ed25519PrivateKey(owner_kp.privateKey);
const owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });

let user_kp = JSON.parse(fs.readFileSync("./keys/user.json", "utf8"));
const privateKeyuser = new Ed25519PrivateKey(user_kp.privateKey);
const user1 = Account.fromPrivateKey({ privateKey: privateKeyuser });

/** Admin forcefully transfers the newly created coin to the specified receiver address */
export async function transferCoin(
  admin: Account,
  fromAddress: AccountAddress,
  toAddress: AccountAddress,
  amount: AnyNumber
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::transfer`,
      functionArguments: [fromAddress, toAddress, amount],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

/** Admin mint the newly created coin to the specified receiver address */
// async function mintCoin(
//   admin: Account,
//   receiver: Account,
//   amount: AnyNumber
// ): Promise<string> {
//   const transaction = await aptos.transaction.build.simple({
//     sender: admin.accountAddress,
//     data: {
//       function: `${admin.accountAddress}::fa_coin::mint`,
//       functionArguments: [receiver.accountAddress, amount],
//     },
//   });

//   const senderAuthenticator = await aptos.transaction.sign({
//     signer: admin,
//     transaction,
//   });
//   const pendingTxn = await aptos.transaction.submit.simple({
//     transaction,
//     senderAuthenticator,
//   });

//   return pendingTxn.hash;
// }

export async function mintCoin(owner: Account, receiver: Account, amount: AnyNumber): Promise<string> {
  console.log(`71111Request received to mint ${amount} coins for receiver ${receiver.accountAddress} by admin ${owner.accountAddress}`);
// console.log(`${receiver},${owner}`);
// console.log("admin74",typeof owner.accountAddress.toString());
// console.log("admin.accountAddress.toString()",owner.accountAddress.toString());

  // console.time("mintCoin"); // Start the timer

  try {
    // const senderAddress: string = admin.accountAddress.toString(); // Convert admin account address to string
    const transaction = await aptos.transaction.build.simple({
      sender: owner.accountAddress,
      data: {
        function: `${owner.accountAddress}::fa_coin::mint`,
        functionArguments: [receiver.accountAddress, amount],
      },
    });
  // console.log("transaction88",transaction);
  
    const senderAuthenticator =  aptos.transaction.sign({ signer: owner, transaction });
    // console.log("senderAuthenticator91",senderAuthenticator);
    
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    console.log("pendingTxn96",pendingTxn);
    
    // console.timeEnd("mintCoin"); // End the timer and log the elapsed time

    return pendingTxn.hash;
  } catch (error) {
    console.log("An error occurred while minting coins:", error);
    throw error;
  }
}








export async function burnCoin(admin: Account, fromAddress: AccountAddress, amount: AnyNumber): Promise<string> {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${admin.accountAddress}::fa_coin::burn`,
        functionArguments: [fromAddress, amount],
      },
    });

    const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

    return pendingTxn.hash;
  } catch (error) {
    console.log("Error while burning coins:", error);
    throw error; // Rethrow the error to handle it at the caller's level if needed
  }
}


/** Admin freezes the primary fungible store of the specified account */

export async function freeze(admin: Account, targetAddress: AccountAddress): Promise<string> {
  try {
    // console.log("Request received to freeze account:", targetAddress);

    const transaction = await aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${admin.accountAddress}::fa_coin::freeze_account`,
        functionArguments: [targetAddress],
      },
    });

    // console.log("Transaction built for freezing account:", transaction);

    const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
    // console.log("Transaction signed successfully.");

    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
    // console.log("Transaction submitted successfully.");

    return pendingTxn.hash;
  } catch (error) {
    console.error("Error occurred while freezing account:", error);
    throw error; // Re-throw the error for handling in the caller function
  }
}


/** Admin unfreezes the primary fungible store of the specified account */
export async function unfreeze(admin: Account, targetAddress: AccountAddress): Promise<string> {
  
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::unfreeze_account`,
      functionArguments: [targetAddress],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash ;
}



export const getFaBalance = async (owner: Account, assetType: string): Promise<number> => {
  // console.log(`Request for balance of asset type ${owner} for owner ${assetType} received.`);
  
  try {
    const data = await aptos.getCurrentFungibleAssetBalances({
      options: {
        where: {
          owner_address: { _eq: owner.accountAddress.toStringLong() },
          asset_type: { _eq: assetType },
        },
      },
    });
  
    // console.log(`Successfully retrieved balance data:`, data);
    return data[0]?.amount ?? 0;
  } catch (error) {
    // console.log(`Error while retrieving balance data:`, error);
    return 0;
  }
};


export async function getMetadata(admin: Account): Promise<string> {
  // console.log(`Request for metadata for admin account ${admin} received.`);

  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::fa_coin::get_metadata`,
    functionArguments: [],
  };
  
  try {
    const res = (await aptos.view<[{ inner: string }]>({ payload }))[0];
    // console.log(`Metadata retrieved successfully:`, res);
    return res.inner;
  } catch (error) {
    // console.log(`Error while retrieving metadata:`, error);
    throw error; // Rethrow the error to handle it at the caller's level if needed
  }
}


async function main() {
  let privateKeyOwner = new Ed25519PrivateKey("0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a");
  let owner = Account.fromPrivateKey({ privateKey:privateKeyOwner });

  const privateKeyUser2 = new Ed25519PrivateKey(
    "0x1983c113a674948c187d3132ce0a8718b4e63eb1e2ca49bb132a291dc88bdf4c"
  );
  const user2 = Account.fromPrivateKey({ privateKey: privateKeyUser2 });

//   console.log("\n=== Addresses ===");
  console.log(`Owner: ${owner.accountAddress.toString()}`);
  console.log(`User1: ${user1.accountAddress.toString()}`);
  console.log(`User2: ${user2.accountAddress.toString()}`);

  console.log("\n=== Compiling KCash package locally ===");
  compilePackage("move/facoin", "move/facoin/facoin.json", [
    { name: "FACoin", address: owner.accountAddress },
  ]);

  const { metadataBytes, byteCode } = getPackageBytesToPublish(
    "move/facoin/facoin.json"
  );

  console.log("\n===Publishing KCash package===");
  const transaction = await aptos.publishPackageTransaction({
    account: owner.accountAddress,
    metadataBytes,
    moduleBytecode: byteCode,
  });
  const response = await aptos.signAndSubmitTransaction({
    signer: owner,
    transaction,
  });
  await aptos.waitForTransaction({
    transactionHash: response.hash,
  });
  console.log(`Transaction hash28000: ${response.hash}`);

     let metadataAddress = await getMetadata(owner);
     let metadataAddress1 = await getMetadata(user1);

  
   console.log("metadata address:", metadataAddress);

  console.log("All the balances in this exmaple refer to balance in primary fungible stores of each account.");
   console.log(`Owner's initial KCash balance: ${await getFaBalance(owner, metadataAddress)}.`);
  console.log(`User1's initial KCash balance: ${await getFaBalance(user1, metadataAddress1)}.`);
  console.log(`User2's initial balance: ${await getFaBalance(user2, metadataAddress)}.`);

  console.log("Owner mints Owner 1000000000 coins.");

  console.log("owner287",owner);
  let mintCoinTransactionHash = await mintCoin(owner, user1, 100000000000000000);
    console.log("mintCoinTransactionHash295",mintCoinTransactionHash);
     
     
console.log("mintCoinTransactionHash",mintCoinTransactionHash);

  await aptos.waitForTransaction({ transactionHash: mintCoinTransactionHash });
  console.log(
    `User2's updated KCash primary fungible store balance: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );

  console.log("Owner freezes User1's account.");
  const freezeTransactionHash = await freeze(owner, user1.accountAddress);
  await aptos.waitForTransaction({ transactionHash: freezeTransactionHash });

  console.log("done.");
 }

main();
