import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";
import { compilePackage, getPackageBytesToPublish } from "./utils";
import { mintAmount, userBuck } from "./kcashV2";

const APTOS_NETWORK: Network =
  NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.TESTNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

async function main() {
  const privateKeyAlice = new Ed25519PrivateKey(
    "0xc0b7560f4648498369994339f457929754eb1b0da42a99d35eb75f6a6124df33"
  );
  const alice = Account.fromPrivateKey({ privateKey: privateKeyAlice });
  console.log("\n=== Compiling PersonAge package locally ===");
  compilePackage("move/facoin", "move/facoin/facoin.json", [
    { name: "FACoin", address: alice.accountAddress },
  ]);
  console.log("12345678-------------------------------");

  // Publish the code
  // const { metadataBytes, byteCode } = getPackageBytesToPublish(
  //   "move/facoin/facoin.json"
  // );

  // console.log("\n===Publishing kcash package===");
  // const transaction = await aptos.publishPackageTransaction({
  //   account: alice.accountAddress,
  //   metadataBytes,
  //   moduleBytecode: byteCode,
  // });
  // const response = await aptos.signAndSubmitTransaction({
  //   signer: alice,
  //   transaction,
  // });
  // console.log(`Transaction hash: ${response.hash}`);
  // await aptos.waitForTransaction({
  //   transactionHash: response.hash,
  // });
  // console.log("-------------------------------");
}

main();
