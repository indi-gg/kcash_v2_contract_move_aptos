import {
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  InputViewFunctionData,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";
import fs from "fs";
import { compilePackage, getPackageBytesToPublish } from "./utils";

// Setup the client
const APTOS_NETWORK: Network =
  NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

/** Return the address of the managed fungible asset that's created when this module is deployed */
async function getMetadata(admin: Account): Promise<string> {
  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::kcashFA::get_metadata`,
    functionArguments: [],
  };
  const res = (await aptos.view<[{ inner: string }]>({ payload }))[0];
  return res.inner;
}

/** Return the Bucket values */
async function getReward1(admin: Account, user: Account): Promise<string> {
  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::kcashFA::get_fungible_store`,
    functionArguments: [user.accountAddress],
  };
  const res = (await aptos.view({ payload }))[0];
  console.log("🚀 ~ getReward1 ~ res:", res);
  return res.toString();
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
  console.log("🚀 ~ data:", data);

  return data[0]?.amount ?? 0;
};

/** Admin mint the newly created coin to the specified receiver address */
async function mintCoin(
  admin: Account,
  receiver: Account,
  amount: AnyNumber,
  r1: AnyNumber,
  r2: AnyNumber,
  r3: AnyNumber
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::kcashFA::mint`,
      functionArguments: [receiver.accountAddress, amount, r1, r2, r3],
    },
  });

  const senderAuthenticator = aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

async function transferMint(
  sender: Account,
  receiver: AccountAddress,
  amount: AnyNumber,
  meta: any
) {
  let tx = await aptos.transferFungibleAsset({
    sender: sender,
    fungibleAssetMetadataAddress: meta,
    recipient: receiver,
    amount: amount,
  });

  const response = await aptos.signAndSubmitTransaction({
    signer: sender,
    transaction: tx,
  });
  console.log(`Transaction hash: ${response.hash}`);

  await aptos.waitForTransaction({
    transactionHash: response.hash,
  });
  console.log(`Transaction hash2: ${response.hash}`);

  return response.hash;
}

async function main() {
  let owner_kp = JSON.parse(fs.readFileSync("./keys/owner.json", "utf8"));
  console.log("🚀 ~ main ~ owner_kp:", owner_kp.accountAddress);
  let user_kp = JSON.parse(fs.readFileSync("./keys/user.json", "utf8"));

  const privateKeyOwner = new Ed25519PrivateKey(owner_kp.privateKey);
  const owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
  const privateKeyUser1 = new Ed25519PrivateKey(user_kp.privateKey);
  const user1 = Account.fromPrivateKey({ privateKey: privateKeyUser1 });

  const privateKeyUser2 = new Ed25519PrivateKey(
    "0x1983c113a674948c187d3132ce0a8718b4e63eb1e2ca49bb132a291dc88bdf4c"
  );
  const user2 = Account.fromPrivateKey({ privateKey: privateKeyUser2 });

  console.log("\n=== Compiling KCash package locally ===");
  compilePackage("move/kcashFA", "move/kcashFA/kcashFA.json", [
    { name: "kcash_addr", address: owner.accountAddress },
  ]);

  const { metadataBytes, byteCode } = getPackageBytesToPublish(
    "move/kcashFA/kcashFA.json"
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
  console.log(`Transaction hash: ${response.hash}`);

  await aptos.waitForTransaction({
    transactionHash: response.hash,
  });
  console.log(`Transaction hash2: ${response.hash}`);

  const metadataAddress = await getMetadata(owner);
  console.log("metadata address:", metadataAddress);

  console.log(
    "All the balances in this exmaple refer to balance in primary fungible stores of each account."
  );
  console.log(
    `Owner's initial KCash balance: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );
  // console.log(
  //   `User1's initial KCash balance: ${await getFaBalance(
  //     user1,
  //     metadataAddress
  //   )}.`
  // );
  // console.log(
  //   `User2's initial balance: ${await getFaBalance(user2, metadataAddress)}.`
  // );

  console.log("Owner mints ");
  const mintCoinTransactionHash = await mintCoin(
    owner,
    user1,
    100000000000000000n,
    20000000000000000n,
    30000000000000000n,
    50000000000000000n
  );
  await aptos.waitForTransaction({
    transactionHash: mintCoinTransactionHash,
  });
  console.log("🚀 ~ main ~ mintCoinTransactionHash:", mintCoinTransactionHash);
  console.log(
    `Owner's initial KCash balance: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );

  console.log("TRANSFER -----");

  let tx = await transferMint(
    user1,
    owner.accountAddress,
    1000000000000000,
    metadataAddress
  );
  console.log("txxxxxxx", tx);

  console.log(
    `Owner's initial KCash balance: ${await getFaBalance(
      owner,
      metadataAddress
    )}.`
  );
}

main();
