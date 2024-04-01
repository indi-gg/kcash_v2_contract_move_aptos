import {
  Account,
  AnyNumber,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  InputViewFunctionData,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";
import { compilePackage, getPackageBytesToPublish } from "./utils";

// Setup the client
const APTOS_NETWORK: Network =
  NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

/** Return the address of the managed fungible asset that's created when this module is deployed */
async function getMetadata(admin: Account): Promise<string> {
  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::fa_coin::get_metadata`,
    functionArguments: [],
  };
  const res = (await aptos.view<[{ inner: string }]>({ payload }))[0];
  return res.inner;
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

async function main() {
  const privateKeyOwner = new Ed25519PrivateKey(
    "0xb8c6e21fe1c09b0891703c75abe828a7867286f312743011b53d883fa621379c"
  );
  const owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
  const privateKeyUser1 = new Ed25519PrivateKey(
    "0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e"
  );
  const user1 = Account.fromPrivateKey({ privateKey: privateKeyUser1 });

  const privateKeyUser2 = new Ed25519PrivateKey(
    "0x1983c113a674948c187d3132ce0a8718b4e63eb1e2ca49bb132a291dc88bdf4c"
  );
  const user2 = Account.fromPrivateKey({ privateKey: privateKeyUser2 });

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
  console.log(`Transaction hash: ${response.hash}`);

  // await aptos.waitForTransaction({
  //   transactionHash: response.hash,
  // });

  // const metadataAddress = await getMetadata(owner);
  // console.log("metadata address:", metadataAddress);

  // console.log(
  //   "All the balances in this exmaple refer to balance in primary fungible stores of each account."
  // );
  // console.log(
  //   `Owner's initial KCash balance: ${await getFaBalance(
  //     owner,
  //     metadataAddress
  //   )}.`
  // );
  // console.log(
  //   `User1's initial KCash balance: ${await getFaBalance(
  //     user1,
  //     metadataAddress
  //   )}.`
  // );
  // console.log(
  //   `User2's initial balance: ${await getFaBalance(user2, metadataAddress)}.`
  // );

  // console.log("Owner mints Owner 1000000000 coins.");
  // const mintCoinTransactionHash = await mintCoin(
  //   owner,
  //   owner,
  //   100000000000000000
  // );
}

main();
