/* eslint-disable no-console */
/* eslint-disable max-len */

import {
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  InputViewRequestData,
  Network,
  NetworkToNetworkName,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import { compilePackage, getPackageBytesToPublish } from "./utils";
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
const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.TESTNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

/** Admin forcefully transfers the newly created coin to the specified receiver address */
export async function transferCoin(
  admin: Account,
  fromAddress: AccountAddress,
  toAddress: AccountAddress,
  amount: AnyNumber,
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::transfer`,
      functionArguments: [fromAddress, toAddress, amount],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
  const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

  return pendingTxn.hash;
}

/** Admin mint the newly created coin to the specified receiver address */
export async function mintCoin(admin: Account, receiver: Account, amount: AnyNumber): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::mint`,
      functionArguments: [receiver.accountAddress, amount],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
  const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

  return pendingTxn.hash;
}

/** Admin burns the newly created coin from the specified receiver address */
export async function burnCoin(admin: Account, fromAddress: AccountAddress, amount: AnyNumber): Promise<string> {
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
}

/** Admin freezes the primary fungible store of the specified account */
export async function freeze(admin: Account, targetAddress: AccountAddress): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::freeze_account`,
      functionArguments: [targetAddress],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
  const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

  return pendingTxn.hash;
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

  const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
  const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

  return pendingTxn.hash;
}

export const getFaBalance = async (owner: Account, assetType: string): Promise<number> => {
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
export async function getMetadata(admin: Account): Promise<string> {
  const payload: InputViewRequestData = {
    function: `${admin.accountAddress}::fa_coin::get_metadata`,
    functionArguments: [],
  };
  const res = (await aptos.view<[{ inner: string }]>({ payload }))[0];
  return res.inner;
}

async function main() {

  const privateKeyOwner = new  Ed25519PrivateKey("0xc0b7560f4648498369994339f457929754eb1b0da42a99d35eb75f6a6124df33");
  const owner = Account.fromPrivateKey({ privateKey:privateKeyOwner });

  const privateKeyUser1 = new  Ed25519PrivateKey("0xab64477b0871e1fdaf15dc836aa26573e0632f9c2f1b3322241dcf69af20dd4c");
  const user1 = Account.fromPrivateKey({ privateKey:privateKeyUser1 });

  const privateKeyUser2 = new  Ed25519PrivateKey("0xfe4296f3d6a6d008fb3e9a1f4735f42bd6459454eff77dfe7706c5db96aa2aa8");
  const user2 = Account.fromPrivateKey({ privateKey:privateKeyUser2 });

  console.log("\n=== Addresses ===");
  console.log(`Owner: ${owner.accountAddress.toString()}`);
  console.log(`User1: ${user1.accountAddress.toString()}`);
  console.log(`User2: ${user2.accountAddress.toString()}`);

  console.log("\n=== Compiling KCash package locally ===");
  compilePackage("move/facoin", "move/facoin/facoin.json", [{ name: "FACoin", address: owner.accountAddress }]);

  const { metadataBytes, byteCode } = getPackageBytesToPublish("move/facoin/facoin.json");

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
  console.log(`Transaction hash: ${response.hash}`);
  await aptos.waitForTransaction({
    transactionHash: response.hash,
  });
  console.log("-------------------------------");
  const metadataAddress = await getMetadata(owner);
  console.log("metadata address:", metadataAddress);

  console.log("All the balances in this exmaple refer to balance in primary fungible stores of each account.");
  console.log(`Owner's initial KCashlance: ${await getFaBalance(owner, metadataAddress)}.`);
  console.log(`User1's initial KCash balance: ${await getFaBalance(user1, metadataAddress)}.`);
  console.log(`User2's initial balance: ${await await getFaBalance(user2, metadataAddress)}.`);

  console.log("Owner mints User2 1000000000 coins.");
  const mintCoinTransactionHash = await mintCoin(owner, owner, 100000000000000000);

  await aptos.waitForTransaction({ transactionHash: mintCoinTransactionHash });
  console.log(
    `User2's updated KCash primary fungible store balance: ${await getFaBalance(user2, metadataAddress)}.`,
  );

  console.log("done.");
}

main();


