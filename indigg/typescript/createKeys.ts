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

  fs.writeFileSync("./keys/key.json", JSON.stringify(data));
}

async function fundWallet(alice: AccountAddress) {
  await aptos.fundAccount({
    accountAddress: alice,
    amount: 100_000_000,
  });
  console.log("🚀 ~ fundWallet ~ aptos.faucet:", aptos.coin);
}

async function main() {
    await createWallet();
  let wallet = JSON.parse(fs.readFileSync("./keys/key.json", "utf8"));

  await fundWallet(wallet.accountAddress);
}

main();
