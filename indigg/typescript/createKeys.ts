import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Ed25519Account,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";
import fs from "fs";

// Setup the client
const APTOS_NETWORK: Network =
  NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

async function createWallet() {
  const alice = Account.generate();
  const data = {
    publicKey: alice.publicKey.toString(),
    accountAddress: alice.accountAddress.toStringLong(),
    privateKey: alice.privateKey.toString(),
  };
  return data;
}

async function fundWallet(alice: AccountAddress) {
  await aptos.fundAccount({
    accountAddress: alice,
    amount: 100_000_000,
  });
}

async function main() {
  let owner = await createWallet();
  fs.writeFileSync("./keys/owner.json", JSON.stringify(owner));
  let user = await createWallet();
  fs.writeFileSync("./keys/user.json", JSON.stringify(user));

  let user2 = await createWallet();
  fs.writeFileSync("./keys/user2.json", JSON.stringify(user2));

  let own = JSON.parse(fs.readFileSync("./keys/owner.json", "utf8"));
  await fundWallet(own.accountAddress);
  console.log("🚀 ~ main ~ own.accountAddress:", own.accountAddress);

  let use = JSON.parse(fs.readFileSync("./keys/user.json", "utf8"));
  await fundWallet(use.accountAddress);
  console.log("🚀 ~ main ~ use.accountAddress:", use.accountAddress);

  let use2 = JSON.parse(fs.readFileSync("./keys/user2.json", "utf8"));
  await fundWallet(use2.accountAddress);
  console.log("🚀 ~ main ~ se2.accountAddress:", use2.accountAddress);
}

main();
