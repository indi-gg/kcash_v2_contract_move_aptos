import {
  Account,
  AnyNumber,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  InputViewRequestData,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";
import { compilePackage, getPackageBytesToPublish } from "./utils";

const APTOS_NETWORK: Network =
  NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.TESTNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

/** Admin mint the newly created coin to the specified receiver address */
export async function mintAmount(
  admin: Account,
  amount: AnyNumber
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::kcash_v2::mint`,
      functionArguments: [amount],
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

// To check balance
export async function userBuck(admin: Account) {
  const payload: InputViewRequestData = {
    function: `${admin.accountAddress}::kcash_v2::user_bucket`,
    functionArguments: [admin.accountAddress.toString()],
  };
  const res = (await aptos.view({ payload }))[0];
  return res;
}

async function main() {
  const privateKeyAlice = new Ed25519PrivateKey(
    "0xc0b7560f4648498369994339f457929754eb1b0da42a99d35eb75f6a6124df33"
  );
  const alice = Account.fromPrivateKey({ privateKey: privateKeyAlice });
  console.log("\n=== Compiling PersonAge package locally ===");
  compilePackage("move/kcash", "move/kcash/kcash_v2.json", [
    { name: "kcashV2", address: alice.accountAddress },
  ]);

  // Publish the code
  const { metadataBytes, byteCode } = getPackageBytesToPublish(
    "move/kcash/kcash_v2.json"
  );

  console.log("\n===Publishing kcash package===");
  const transaction = await aptos.publishPackageTransaction({
    account: alice.accountAddress,
    metadataBytes,
    moduleBytecode: byteCode,
  });
  const response = await aptos.signAndSubmitTransaction({
    signer: alice,
    transaction,
  });
  console.log(`Transaction hash: ${response.hash}`);
  await aptos.waitForTransaction({
    transactionHash: response.hash,
  });
  console.log("-------------------------------");

  const mintHash = await mintAmount(alice, 100);
  console.log("metadata address:", mintHash);
  console.log("-------------------------------");

  const user_bal = await userBuck(alice);
  console.log("metadata address:", user_bal);
}

main();
