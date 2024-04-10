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
  Secp256k1PrivateKey,
  Secp256k1Signature,
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
console.log("APTOS_NETWORK3000", APTOS_NETWORK);

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const module_path = "move/facoin"; // Path to the package which has the module
const output_file_path = "move/facoin/facoin.json"; // Path to JSON file
const address_name = "FACoin"; // Address name from move.toml
const amount_to_mint = 100000000000;
const amount_to_withdraw = 65000000000;

let owner_kp = JSON.parse(fs.readFileSync("./keys/owner.json", "utf8"));
const privateKeyOwner = new Ed25519PrivateKey(owner_kp.privateKey);
const owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });

let user_kp = JSON.parse(fs.readFileSync("./keys/user.json", "utf8"));
const privateKeyuser = new Ed25519PrivateKey(user_kp.privateKey);
const user1 = Account.fromPrivateKey({ privateKey: privateKeyuser });

let user2_kp = JSON.parse(fs.readFileSync("./keys/user2.json", "utf8"));
const privateKeyuser2 = new Ed25519PrivateKey(user2_kp.privateKey);
const user2 = Account.fromPrivateKey({ privateKey: privateKeyuser2 });

/** Admin forcefully transfers the newly created coin to the specified receiver address */
async function transferCoin(
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

// User transfer the funds
async function nativeTransfer(
  sender: Account,
  metadata: AccountAddress,
  receiver: AccountAddress,
  amount: AnyNumber
) {
  try {
    let tx = await aptos.transferFungibleAsset({
      sender: sender,
      fungibleAssetMetadataAddress: metadata,
      recipient: receiver,
      amount: amount,
    });

    const senderAuthenticator = await aptos.transaction.sign({
      signer: sender,
      transaction: tx,
    });

    const transferTx = await aptos.transaction.submit.simple({
      transaction: tx,
      senderAuthenticator,
    });
    await aptos.waitForTransaction({
      transactionHash: transferTx.hash,
    });
    console.log("🚀 ~ transferTx:", transferTx.hash);

    return transferTx.hash;
  } catch (error) {
    // console.log("🚀 ~ error:", error);
    return false;
  }
}

/** Admin mint the newly created coin to the specified receiver address */
async function mintCoin(
  admin: Account,
  receiver: Account,
  amount: AnyNumber,
  reward1: AnyNumber,
  reward2: AnyNumber,
  reward3: AnyNumber
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::mint`,
      functionArguments: [
        receiver.accountAddress,
        amount,
        reward1,
        reward2,
        reward3,
      ],
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

export async function burnCoin(
  admin: Account,
  fromAddress: AccountAddress,
  amount: AnyNumber
): Promise<string> {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${admin.accountAddress}::fa_coin::burn`,
        functionArguments: [fromAddress, amount],
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
  } catch (error) {
    console.log("Error while burning coins:", error);
    throw error; // Rethrow the error to handle it at the caller's level if needed
  }
}

/** Admin freezes the primary fungible store of the specified account */

export async function freeze(
  admin: Account,
  targetAddress: AccountAddress
): Promise<string> {
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

    const senderAuthenticator = await aptos.transaction.sign({
      signer: admin,
      transaction,
    });
    // console.log("Transaction signed successfully.");

    const pendingTxn = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });
    // console.log("Transaction submitted successfully.");
    return pendingTxn.hash;
  } catch (error) {
    console.error("Error occurred while freezing account:", error);
    throw error; // Re-throw the error for handling in the caller function
  }
}

/** Admin unfreezes the primary fungible store of the specified account */

export async function unfreeze(
  admin: Account,
  targetAddress: AccountAddress
): Promise<string> {
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

  return pendingTxn.hash;
  return pendingTxn.hash;
}

export const getFaBalance = async (
  owner: Account,
  assetType: string
): Promise<number> => {
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

/** Return the address of the managed fungible asset that's created when this module is deployed */
export const getIs_freez = async (
  owner: Account,
  assetType: string
): Promise<boolean> => {
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

    console.log("data ---", data);

    // console.log(`Successfully retrieved balance data:`, data);

    return data[0]?.is_frozen ?? false;
  } catch (error) {
    // console.log(`Error while retrieving balance data:`, error);
    return false;
  }
};

export async function getMetadata(admin: Account) {
  // console.log(`Request for metadata for admin account ${admin} received.`);

  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::fa_coin::get_metadata`,
    functionArguments: [],
  };
  const res = (await aptos.view<[{ inner: AccountAddress }]>({ payload }))[0];
  console.log("🚀 ~ getMetadata ~ res:", res);
  return res.inner;
}

async function hasBucket(admin: Account) {
  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::fa_coin::has_bucket_store`,
    functionArguments: [admin.accountAddress],
  };
  const res = (await aptos.view({ payload }))[0];
  console.log("🚀 ~ hasBucket ~ res:", res);
  return res;
}

async function getBucketStore(admin: Account) {
  const payload: InputViewFunctionData = {
    function: `${owner.accountAddress}::fa_coin::get_bucket_store`,
    functionArguments: [admin.accountAddress],
  };
  const res = await aptos.view({ payload });
  console.log("🚀 ~ hasBucket ~ res:", res);
  return res;
}

async function compileAndDeploy() {
  console.log("*** Compiling KCash package ***");
  compilePackage(module_path, output_file_path, [
    { name: address_name, address: owner.accountAddress },
  ]);

  const { metadataBytes, byteCode } =
    getPackageBytesToPublish(output_file_path);

  console.log("\n *** Publishing KCash package ***");
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
  console.log(`Transaction hash: ${response.hash}`);
  return response.hash;
}

async function main() {
  //   console.log("\n=== Addresses ===");
  console.log(`Owner: ${owner.accountAddress.toString()}`);
  console.log(`User1: ${user1.accountAddress.toString()}`);
  console.log(`User2: ${user2.accountAddress.toString()}`);

  let deployedTx = await compileAndDeploy();
  console.log("🚀 ~ main ~ deployedTx:", deployedTx);

  const metadata = await getMetadata(owner);
  let metadataAddress = metadata.toString();
  console.log("metadata address:", metadataAddress);

  console.log(
    "\n All the balances in this exmaple refer to balance in primary fungible stores of each account."
  );
  console.log(
    `Owner's initial KCash balance: ${await getFaBalance(
      owner,
      metadataAddress
    )}.`
  );
  console.log(
    `User1's initial balance: ${await getFaBalance(user1, metadataAddress)}.`
  );
  console.log(
    `User2's initial balance: ${await getFaBalance(user2, metadataAddress)}.`
  );

  console.log("Owner mints Owner 1000000000 coins.");
  const mintCoinTransactionHash = await mintCoin(
    owner,
    user1,
    amount_to_mint,
    amount_to_mint * 0.5,
    amount_to_mint * 0.2,
    amount_to_mint * 0.3
  );

  await aptos.waitForTransaction({
    transactionHash: mintCoinTransactionHash,
  });
  console.log("🚀 ~ main ~ mint trx hash:", mintCoinTransactionHash);

  console.log(
    `User1's updated KCash primary fungible store balance: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );

  let bs = await getBucketStore(user1);
  console.log("🚀 ~ main ~ bs:", bs);

  // TO Transfer coin
  let transferTx = await transferCoin(
    owner,
    user1.accountAddress,
    user2.accountAddress,
    amount_to_withdraw
  );
  await aptos.waitForTransaction({ transactionHash: transferTx });
  console.log("🚀 ~ main ~ transferTx:", transferTx);

  console.log("Now user2 bucket balance is");
  console.log("🚀 ~ main ~ user1 bucket :", await getBucketStore(user1));
  console.log("🚀 ~ main ~ user2 bucket :", await getBucketStore(user2));
  console.log(
    `User2's final balance: ${await getFaBalance(user2, metadataAddress)}.`
  );

  // console.log(
  //   "--------Now try to transfer the funds using native transfer method-------------"
  // );
  // console.log("Transfer amount: ", 100000000000000);

  // let ntx = await nativeTransfer(
  //   user1,
  //   metadata,
  //   user2.accountAddress,
  //   100000000000000
  // );

  // console.log("Native tx hash: ", ntx);

  // console.log(
  //   `User1's updated KCash balance After native transfer: ${await getFaBalance(
  //     user1,
  //     metadataAddress
  //   )}.`
  // );

  // console.log("Owner freezes User1's account.");
  // const freezeTransactionHash = await freeze(owner, user1.accountAddress);
  // await aptos.waitForTransaction({ transactionHash: freezeTransactionHash });
  // console.log("🚀 ~ main ~ freezed Transaction Hash:", freezeTransactionHash);

  // console.log("Check if we can transfer funds after freezing the account");

  // let ntx2 = await nativeTransfer(
  //   user1,
  //   metadata,
  //   user2.accountAddress,
  //   100000000000000
  // );
  // console.log("🚀 ~ main ~ ntx2:", ntx2);
  // if (!ntx2) {
  //   console.log("Can not transfer the funds");

  //   console.log(
  //     "Now try to transfer 100000000000000 via our module transfer method"
  //   );
  //   let ctx = await transfer(
  //     owner,
  //     user1.accountAddress,
  //     user2.accountAddress,
  //     100000000000000
  //   );
  //   console.log("🚀 ~ main ~ ctx:", ctx);
  //   console.log(
  //     `User1's updated KCash balance After custom transfer: ${await getFaBalance(
  //       user1,
  //       metadataAddress
  //     )}.`
  //   );
  console.log("done.");
}

main();
