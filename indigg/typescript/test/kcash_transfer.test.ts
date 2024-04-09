import {
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  Ed25519Account,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  AptosSettings,
  Network,
  AptosApiType,
  NetworkToNodeAPI,
  NetworkToFaucetAPI,
  NetworkToIndexerAPI,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";
import {
  transferCoin,
  mintCoin,
  burnCoin,
  freeze,
  unfreeze,
  getFaBalance,
  getMetadata,
} from "../kcash_fungible_asset";
import { compilePackage, getPackageBytesToPublish } from "../utils";

const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
console.log("APTOS_NETWORK3000", APTOS_NETWORK);

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

let privateKeyOwner = new Ed25519PrivateKey(
  "0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a"
);

let privateKeyBob = new Ed25519PrivateKey(
  "0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e"
);

let privateKeyCharlie = new Ed25519PrivateKey(
  "0x1983c113a674948c187d3132ce0a8718b4e63eb1e2ca49bb132a291dc88bdf4c"
);

let owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
let user1 = Account.fromPrivateKey({ privateKey: privateKeyBob });
let user2 = Account.fromPrivateKey({ privateKey: privateKeyCharlie });

let metadataAddress: string;

describe("Testing Aptos Blockchain Functions", () => {
  beforeEach(async () => {
    // Get metadata address
    metadataAddress = await getMetadata(owner);
    console.log("metadataAddress", metadataAddress);
  }, 20000);

  describe("fromPrivateKeyAndAddress", () => {
    it("derives the correct account from a  ed25519 private key", () => {
      let privateKeyOwner = new Ed25519PrivateKey(
        "0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a"
      );
      let owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
      expect(owner).toBeInstanceOf(Ed25519Account);
      expect(owner.publicKey).toBeInstanceOf(Ed25519PublicKey);
      expect(owner.privateKey).toBeInstanceOf(Ed25519PrivateKey);
      expect(owner.privateKey.toString()).toEqual(privateKeyOwner.toString());
    });
  });
  describe("aptos config", () => {
    it("it should set urls based on a local network", () => {
      const settings: AptosSettings = {
        network: Network.LOCAL,
      };
      const aptosConfig = new AptosConfig(settings);
      expect(aptosConfig.network).toEqual("local");
      expect(aptosConfig.getRequestUrl(AptosApiType.FULLNODE)).toBe(
        NetworkToNodeAPI[Network.LOCAL]
      );
      expect(aptosConfig.getRequestUrl(AptosApiType.FAUCET)).toBe(
        NetworkToFaucetAPI[Network.LOCAL]
      );
      expect(aptosConfig.getRequestUrl(AptosApiType.INDEXER)).toBe(
        NetworkToIndexerAPI[Network.LOCAL]
      );
    });
    it("it should set urls based on a devnet network", () => {
      const settings: AptosSettings = {
        network: Network.DEVNET,
      };
      const aptosConfig = new AptosConfig(settings);
      expect(aptosConfig.network).toEqual("devnet");
      expect(aptosConfig.getRequestUrl(AptosApiType.FULLNODE)).toBe(
        NetworkToNodeAPI[Network.DEVNET]
      );
      expect(aptosConfig.getRequestUrl(AptosApiType.FAUCET)).toBe(
        NetworkToFaucetAPI[Network.DEVNET]
      );
      expect(aptosConfig.getRequestUrl(AptosApiType.INDEXER)).toBe(
        NetworkToIndexerAPI[Network.DEVNET]
      );
    });
  });

  describe("KCash Package Compilation and Publishing and deploy", () => {
    it("should compile and publish KCash package locally", async () => {
      // Define mock implementations for compilePackage and publishPackageTransaction
      const { metadataBytes, byteCode } = getPackageBytesToPublish(
        "/move/facoin/facoin.json"
      );
      //   console.log(metadataBytes,byteCode);
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
      console.log(`Transaction hash28000: ${response.hash}`);
      expect(response.hash).toBeDefined();
    });
  });

  describe("minting-burning-coin", () => {
    it("Mint Coins", async () => {
      try {
        console.log("startminting....73");
        metadataAddress = await getMetadata(owner);
        console.log("metadata172", metadataAddress);

        let initialBalanceowner = await getFaBalance(owner, metadataAddress);
        console.log("initialBalanceAlice180", initialBalanceowner);
        let amountToMint = 10000000000000000; // Adjust as necessary
        console.log("owner18444", owner);
        //   let result = await mintCoin(owner, owner, 100000000000000000);
        let mintCoinTransactionHash = await mintCoin(
          owner,
          user1,
          100000000000000000
        );
        console.log("result", mintCoinTransactionHash);
        const finalBalanceAlice = await getFaBalance(owner, metadataAddress);
        expect(finalBalanceAlice).toBe(
          initialBalanceowner + 100000000000000000
        );
        console.log("initialBalanceAlice180", initialBalanceowner);
        console.log("finalBalanceAlice1888", finalBalanceAlice);
      } catch (error) {
        console.log("error", error);
      }
    });
    it("burn coin", async () => {
      try {
        // Assuming Alice wants to burn some coins from her account
        console.log("start burning coins...");
        // Get the initial balance of the owner
        const initialBalanceOwner = await getFaBalance(owner, metadataAddress);
        // Define the amount of coins to burn
        const amountToBurn = 100000000000000000; // Adjust as necessary
        // Burn coins from the owner's account
        const burnCoinTransactionHash = await burnCoin(
          owner,
          user1.accountAddress,
          amountToBurn
        );
        console.log("Burn coin transaction hash:", burnCoinTransactionHash);
        // Get the final balance of the owner after burning coins
        const finalBalanceOwner = await getFaBalance(owner, metadataAddress);
        // Assert that the final balance is decreased by the amount burned
        expect(finalBalanceOwner).toBe(initialBalanceOwner - amountToBurn);
        console.log("Initial balance of owner:", initialBalanceOwner);
        console.log("Final balance of owner:", finalBalanceOwner);
      } catch (error) {
        console.log("error", error);
      }
    });
  });

  describe("kcash-transfer-coin", () => {
    it("Transfer Coins", async () => {
      try {
        console.log("Starting testing transfer coin");

        // Retrieve metadata address
        const metadataAddress = await getMetadata(owner);
        console.log("Metadata address:", metadataAddress);

        // Retrieve initial balances
        const initialBalanceOwner = await getFaBalance(owner, metadataAddress);
        const initialBalanceuser1 = await getFaBalance(user1, metadataAddress);
        console.log("Initial balance of owner:", initialBalanceOwner);
        console.log("Initial balance of user1:", initialBalanceuser1);

        // Amount to transfer
        const amountToTransfer = 10000000000000000;

        // Perform the transfer
        const transactionHash = await transferCoin(
          owner,
          owner.accountAddress,
          user1.accountAddress,
          amountToTransfer
        );
        console.log("Transaction hash:", transactionHash);

        // Retrieve final balances
        const finalBalanceOwner = await getFaBalance(owner, metadataAddress);
        const finalBalanceBob = await getFaBalance(user1, metadataAddress);
        console.log("Final balance of owner:", finalBalanceOwner);
        console.log("Final balance of Bob:", finalBalanceBob);

        // Assertions
        expect(transactionHash).toBeDefined();
        expect(typeof transactionHash).toBe("string");

        // Check if the balances changed correctly after the transfer
        expect(finalBalanceOwner).toBe(initialBalanceOwner - amountToTransfer);
        expect(finalBalanceBob).toBe(initialBalanceuser1 + amountToTransfer);
      } catch (error) {
        console.error("Error while transferring coins:", error);
        fail(error); // Fail the test explicitly if an error occurs
      }
    });
  });

  describe("check blance of account and get metadata", () => {
    it("get metadata", async () => {
      try {
        // Test getting metadata
        console.log("Testing getMetadata...");
        const metadata = await getMetadata(owner);
        expect(metadata).toBeDefined();
        console.log("Metadata:", metadata);
      } catch (error) {
        console.log("error", error);
      }
    });
    it("get Fa_blance", async () => {
      try {
        // Test getting FA balance
        console.log("Testing getFaBalance...");
        const balance = await getFaBalance(owner, metadataAddress);
        expect(balance).toBeDefined();
        console.log("Balance:", balance);
      } catch (error) {
        console.log("error", error);
      }
    });
  });

  // describe("freeze and unfreeze functions", () => {
  //   it("should freeze the specified account and return the transaction hash", async () => {
  //     try {
  //       // Test freezing an account
  //       console.log("Testing freeze...");
  //       const freezeTransactionHash = await freeze(owner, user1.accountAddress);
  //       console.log("Freeze transaction hash:", freezeTransactionHash);
  //       // You can add more assertions here if needed
  //       // expect(freezeTransactionHash).toBe(true);
  //       expect(freezeTransactionHash).toBeDefined();
  //       // expect(freezeTransactionHash).toHaveBeenCalled()
  //       expect(typeof freezeTransactionHash).toBe("string");
  //     } catch (error) {
  //       console.log("Error while freezing account:", error);
  //     }
  //   });
  //   it("should unfreeze the specified account and return the transaction hash", async () => {
  //     try {
  //       // Test unfreezing an account
  //       console.log("Testing unfreeze...");
  //       const unfreezeTransactionHash = await unfreeze(
  //         owner,
  //         user1.accountAddress
  //       );
  //       console.log("Unfreeze transaction hash:", unfreezeTransactionHash);
  //       // You can add more assertions here if needed
  //     } catch (error) {
  //       console.log("Error while unfreezing account:", error);
  //     }
  //   });
  // });
});
