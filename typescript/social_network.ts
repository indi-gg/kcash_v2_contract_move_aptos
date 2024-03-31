import {
  Account,
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

export async function setAge(admin: Account, new_age: number) {
  const payload: InputViewRequestData = {
    function: `${admin.accountAddress}::PersonAge::setAge`,
    functionArguments: [new_age],
  };
  const res = (await aptos.view({ payload }))[0];
  return res;
}

async function main(new_age: number) {
  const privateKeyAlice = new Ed25519PrivateKey(
    "0xc0b7560f4648498369994339f457929754eb1b0da42a99d35eb75f6a6124df33"
  );
  const alice = Account.fromPrivateKey({ privateKey: privateKeyAlice });
  console.log("\n=== Compiling PersonAge package locally ===");
  compilePackage("move/test1", "move/test1/person_age.json", [
    { name: "person_address", address: alice.accountAddress },
  ]);

  // Publish the code
  const { metadataBytes, byteCode } = getPackageBytesToPublish(
    "move/test1/person_age.json"
  );

  console.log("\n===Publishing Social package===");
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

  const metadataAddress = await setAge(alice, new_age);
  console.log("metadata address:", metadataAddress);
}

main(23);
