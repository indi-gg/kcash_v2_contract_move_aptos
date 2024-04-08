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
const APTOS_NETWORK: Network =
  NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.DEVNET;
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
async function customTransfer(
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
  amount: AnyNumber
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::mint`,
      functionArguments: [receiver.accountAddress, amount],
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

/** Admin burns the newly created coin from the specified receiver address */
async function burnCoin(
  admin: Account,
  fromAddress: AccountAddress,
  amount: AnyNumber
): Promise<string> {
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
}

/** Admin freezes the primary fungible store of the specified account */
async function freeze(
  admin: Account,
  targetAddress: AccountAddress
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::freeze_account`,
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
}

/** Admin unfreezes the primary fungible store of the specified account */
async function unfreeze(
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
}

const getFaBalance = async (
  owner: Account,
  assetType: string
): Promise<number> => {
  const data = await aptos.getCurrentFungibleAssetBalances({
    options: {
      where: {
        owner_address: { _eq: owner.accountAddress.toStringLong() },
        asset_type: { _eq: assetType },
      },
    },
  });

  return data[0]?.amount ?? 0;
};

/** Return the address of the managed fungible asset that's created when this module is deployed */
async function getMetadata(admin: Account) {
  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::fa_coin::get_metadata`,
    functionArguments: [],
  };
  const res = (await aptos.view<[{ inner: AccountAddress }]>({ payload }))[0];
  console.log("🚀 ~ getMetadata ~ res:", res);
  return res.inner;
}

async function main() {
  const privateKeyUser2 = new Ed25519PrivateKey(
    "0xd9c1d14c0c87920367d07c26888be311f7bd879971437130a865d0ae8f080b15"
  );
  const user2 = Account.fromPrivateKey({ privateKey: privateKeyUser2 });

  console.log("\n=== Addresses ===");
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
  console.log(`Transaction hash: ${response.hash}`);

  const metadata = await getMetadata(owner);
  let metadataAddress = metadata.toString();
  console.log("metadata address:", metadataAddress);

  console.log(
    "All the balances in this exmaple refer to balance in primary fungible stores of each account."
  );
  console.log(
    `Owner's initial KCash balance: ${await getFaBalance(
      owner,
      metadataAddress
    )}.`
  );
  console.log(
    `User1's initial KCash balance: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );

  console.log("Owner mints Owner 1000000000 coins.");
  const mintCoinTransactionHash = await mintCoin(
    owner,
    user1,
    100000000000000000
  );

  await aptos.waitForTransaction({ transactionHash: mintCoinTransactionHash });
  console.log("🚀 ~ main ~ mint trx hash:", mintCoinTransactionHash);

  console.log(
    `User1's updated KCash primary fungible store balance: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );

  console.log(
    "--------Now try to transfer the funds using native transfer method-------------"
  );
  console.log("Transfer amount: ", 100000000000000);

  let ntx = await nativeTransfer(
    user1,
    metadata,
    user2.accountAddress,
    100000000000000
  );

  console.log("Native tx hash: ", ntx);

  console.log(
    `User1's updated KCash balance After native transfer: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );

  console.log("Owner freezes User1's account.");
  const freezeTransactionHash = await freeze(owner, user1.accountAddress);
  await aptos.waitForTransaction({ transactionHash: freezeTransactionHash });
  console.log("🚀 ~ main ~ freezed Transaction Hash:", freezeTransactionHash);

  console.log("Check if we can transfer funds after freezing the account");

  let ntx2 = await nativeTransfer(
    user1,
    metadata,
    user2.accountAddress,
    100000000000000
  );
  console.log("🚀 ~ main ~ ntx2:", ntx2);
  if (!ntx2) {
    console.log("Can not transfer the funds");

    console.log(
      "Now try to transfer 100000000000000 via our module transfer method"
    );
    let ctx = await customTransfer(
      owner,
      user1.accountAddress,
      user2.accountAddress,
      100000000000000
    );
    console.log("🚀 ~ main ~ ctx:", ctx);
    console.log(
      `User1's updated KCash balance After custom transfer: ${await getFaBalance(
        user1,
        metadataAddress
      )}.`
    );
  }

  console.log("done.");
}

main();
