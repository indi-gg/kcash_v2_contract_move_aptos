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
  getIs_freez,
  compileAndDeploy,
  getBucketStore,
  bulkMintCoin,
  transferReward3ToReward1ByAdminOnly,
  transferReward3ToReward1ByAdminOnlyInBulk,
  transferReward3ToReward2ByAdminOnly,
  transferReward3ToReward2ByAdminOnlyInBulk,
  transferCoinBulk,
  adminTransfer,
  adminTransferBulk,
  transferFromReward3ToReward3,
  transferFromReward3ToReward3Bulk,
  transferFromBucketToReward3,
  transferFromBucketToReward3Bulk,
  adminTransferWithSignature,
  signMessage,
  transferReward3ToReward1WithSign,
  getNonce,
  transferReward3ToReward1BulkWithSign,
  transferReward3ToReward2WithSign,
  transferReward3ToReward2BulkWithSign,
} from "../kcash_fungible_asset";
import sha256 from "fast-sha256";
import { compilePackage, getPackageBytesToPublish } from "../utils";
import { get } from "https";
import fs from "fs";

const message = new Uint8Array(Buffer.from("KCash"));
const messageHash = sha256(message);

const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
// console.log("APTOS_NETWORK3000", APTOS_NETWORK);

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

// let privateKeyOwner = new Ed25519PrivateKey(
//   "0x7932f33ebcd9ac6424e6db08046e53ea57392d894310afa5da31abaafd31909b"
// );

// let privateKeyBob = new Ed25519PrivateKey(
//   "0xbc56550b09c8441834c49532c41e57f3471f6c7f4b7b7808b3c751c80c5865ad"
// );

// let privateKeyCharlie = new Ed25519PrivateKey(
//   "0x26ef94b01b340b897b4b162c2216c42320604fca62260674f85d07bc26191bdd"
// );

// let owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
// let user1 = Account.fromPrivateKey({ privateKey: privateKeyBob });
// let user2 = Account.fromPrivateKey({ privateKey: privateKeyCharlie });

let owner_kp = JSON.parse(fs.readFileSync("./keys/owner.json", "utf8"));
const privateKeyOwner = new Ed25519PrivateKey(owner_kp.privateKey);
const publicKeyOwner = new Ed25519PublicKey(owner_kp.publicKey);
const owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });

let user_kp = JSON.parse(fs.readFileSync("./keys/user.json", "utf8"));
const privateKeyuser1 = new Ed25519PrivateKey(user_kp.privateKey);
const user1 = Account.fromPrivateKey({ privateKey: privateKeyuser1 });

let user2_kp = JSON.parse(fs.readFileSync("./keys/user2.json", "utf8"));
const privateKeyuser2 = new Ed25519PrivateKey(user2_kp.privateKey);
const user2 = Account.fromPrivateKey({ privateKey: privateKeyuser2 });

let metadataAddress: string;

const decimal_kcash = 1;
const amount_to_mint = 1000 * decimal_kcash;
const amount_To_Burn = 500 * decimal_kcash;
const rewart1 = amount_to_mint * 0.1;
const rewart2 = amount_to_mint * 0.2;
const rewart3 = amount_to_mint * 0.7;

const amount_to_be_transfer = 500 * decimal_kcash;

let amt2 = amount_to_mint / 2;
let amount_ar = [amount_to_mint, amt2];
let receiver_ar = [user1.accountAddress, user2.accountAddress];
let r1_ar = [amount_to_mint * 0.5, amt2 * 0.5];
let r2_ar = [amount_to_mint * 0.3, amt2 * 0.3];
let r3_ar = [amount_to_mint * 0.2, amt2 * 0.2];

describe("Kcash Test", () => {
  beforeEach(async () => {
    // Get metadata address
    let metadataAddress = await getMetadata(owner);
    console.log("metadataAddress611", metadataAddress);
    // const hash= await compileAndDeploy()
  }, 20000);

  describe("fromPrivateKeyAndAddress", () => {
    it("derives the correct account from a  ed25519 private key", () => {
      let privateKeyOwner = new Ed25519PrivateKey(
        owner_kp.privateKey
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
    it("should compile and publish KCash package", async () => {
      // Define mock implementations for compilePackage and publishPackageTransaction
      const { metadataBytes, byteCode } = getPackageBytesToPublish(
        "/move/facoin/facoin.json"
      );
      // Logging to indicate the start of the publishing process
      console.log("\n===Publishing KCash package===");
      const transaction = await aptos.publishPackageTransaction({
        account: owner.accountAddress,
        metadataBytes,
        moduleBytecode: byteCode,
      });

        // Signing and submitting the transaction
      const response = await aptos.signAndSubmitTransaction({
        signer: owner,
        transaction,
      });
       // Waiting for the transaction to be confirmed
      await aptos.waitForTransaction({
        transactionHash: response.hash,
      });
      // Logging the transaction hash for reference
      console.log(`Transaction hash28000: ${response.hash}`);
        // Expecting the transaction hash to be defined
      expect(response.hash).toBeDefined();
    });
  });

  describe("check blance of account and get metadata", () => {
    it("get metadata", async () => {
      try {
        // Test getting metadata
        console.log("Testing getMetadata...");
         // Retrieve metadata
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
        const metadataAddress = await getMetadata(owner);
        console.log("metadataAddress276", metadataAddress);
        const balance = await getFaBalance(owner, metadataAddress.toString());
        expect(balance).toBeDefined();
        console.log("Balance:", balance);
      } catch (error) {
        console.log("error", error);
      }
    });
  });

  describe("minting-burning-coin", () => {
    it("Mint Coins", async () => {
      try {
        let metadataAddress = await getMetadata(owner);
        let initialBalanceowner = await getFaBalance(
          owner,
          metadataAddress.toString()
        );
        const bucketStore = await getBucketStore(owner);

        let mintCoinTransactionHash = await mintCoin(
          owner,
          owner,
          amount_to_mint,
          rewart1,
          rewart2,
          rewart3
        );
        console.log("result", mintCoinTransactionHash);
        const finalBalanceoner = await getFaBalance(
          owner,
          metadataAddress.toString()
        );
        const bucketStore_after_minting = await getBucketStore(owner);
        expect(finalBalanceoner).toBe(initialBalanceowner + amount_to_mint);
      } catch (error) {
        console.log("error", error);
      }
    });

    // it("Get Bucket Store", async () => {
    //   try {
    //     console.log("start fetching bucket store....");
    //     const bucketStore = await getBucketStore(owner);
    //     console.log("Bucket store:", bucketStore);
    //   } catch (error) {
    //     console.log("error", error);
    //   }
    // });

    // it("Should revert if called by owner but bucket sum is not correct", async () => {
    //   // Simulate calling mintCoin with incorrect bucket sums
    //   await expect(mintCoin(
    //     owner, // Assuming owner_address is the owner
    //     owner, // Assuming owner_address is the owner
    //     amount_to_mint,
    //     rewart1,
    //     rewart2, // Example amount for bucket 1
    //     rewart3, // Example amount for bucket 2
    //   )).rejects.toThrowError(/revert/);
    // });

    it("Bulk Mint Coins", async () => {
      try {
        console.log("Start bulk minting....");

        // Retrieve initial balances
        const metadata = await getMetadata(owner);
        const initialUser1Balance = await getFaBalance(user1, metadata.toString());
        const initialUser2Balance = await getFaBalance(user2, metadata.toString());

        // Perform bulk minting
        const bulkMintTx = await bulkMintCoin(
          owner,
          receiver_ar,
          amount_ar,
          r1_ar,
          r2_ar,
          r3_ar
        );
        console.log("Bulk Mint Transaction:", bulkMintTx);

        // Retrieve balances after minting
        const user1BalanceAfter = await getFaBalance(user1, metadata.toString());
        const user2BalanceAfter = await getFaBalance(user2, metadata.toString());

        // Assertions
        expect(user1BalanceAfter).toEqual(initialUser1Balance + amount_to_mint); // User1's balance should increase by amount_to_mint
        expect(user2BalanceAfter).toEqual(initialUser2Balance + amount_to_mint / 2); // User2's balance should increase by half of amount_to_mint

      } catch (error) {
        console.log("Error occurred during bulk minting:", error);
      }
    }, 10000);

    it("Burn Coin", async () => {
      try {
        // Starting the process of burning coins
        console.log("Start burning coins...");

        // Get the initial balance of the user
        const metadata = await getMetadata(owner);
        const initialBalanceUser = await getFaBalance(user1, metadata.toString());

        // Burn coins from the user's account
        const burnCoinTransactionHash = await burnCoin(
          owner,
          user1.accountAddress,
          amount_To_Burn
        );

        // Get the final balance of the user after burning coins
        const finalBalanceUser = await getFaBalance(user1, metadata.toString());

        // Assert that the final balance is decreased by the amount burned
        expect(finalBalanceUser).toBe(initialBalanceUser - amount_To_Burn);
      } catch (error) {
        // Catch any errors that occur during the process
        console.log("Error occurred during burning coins:", error);
      }
    });
  });

  describe("kcash-transfer-coin", () => {
    it("Transfer Coins", async () => {
      try {
        console.log("Starting testing transfer coin");

        // Retrieve metadata address
        const metadataAddress = await getMetadata(owner);

        // Retrieve initial balances of users
        const initialBalanceuser1 = await getFaBalance(
          user1,
          metadataAddress.toString()
        );
        const initialBalanceuser2 = await getFaBalance(
          user2,
          metadataAddress.toString()
        );

        // Perform the transfer
        const transactionHash = await transferCoin(
          owner,
          user1,
          user2.accountAddress,
          amount_to_be_transfer
        );
        console.log("Transaction hash:", transactionHash);

        // Retrieve final balances after the transfer
        const finalBalanceuser1 = await getFaBalance(
          user1,
          metadataAddress.toString()
        );
        const finalBalanceuser2 = await getFaBalance(
          user2,
          metadataAddress.toString()
        );

        // Assertions
        expect(transactionHash).toBeDefined();
        expect(typeof transactionHash).toBe("string");

        // Check if the balances changed correctly after the transfer
        expect(finalBalanceuser1).toBe(
          initialBalanceuser1 - amount_to_be_transfer
        );
        expect(finalBalanceuser2).toBe(
          initialBalanceuser2 + amount_to_be_transfer
        );
      } catch (error) {
        // Catch any errors that occur during the process
        console.log("Error while transferring coins:", error);
      }
    }, 10000);

    it("bulk transfer coin", async () => {
      try {
        console.log("Starting testing bulk transfer coin");

        // Retrieve metadata address
        const metadataAddress = await getMetadata(owner);

        // Retrieve initial balances for owner, user1, and user2
        const initialBalanceOwner = await getFaBalance(
          owner,
          metadataAddress.toString()
        );

        const initialBalanceUser1 = await getFaBalance(
          user1,
          metadataAddress.toString()
        );

        const initialBalanceUser2 = await getFaBalance(
          user2,
          metadataAddress.toString()
        );

        // Define the amount to be transferred in bulk
        const user_arr = [owner.accountAddress, user2.accountAddress];
        let amount_to_transfer_user1 = 100 * decimal_kcash;
        let amount_to_transfer_user2 = amount_to_transfer_user1 / 2;
        let amount_ar1 = [amount_to_transfer_user1, amount_to_transfer_user2];

        // Perform the bulk transfer from user1 to user2 and user3
        const transactionHash = await transferCoinBulk(
          owner,
          user1,
          user_arr, // Array of receiver addresses
          amount_ar1 // Amount to transfer to each receiver
        );

        // Retrieve final balances for owner, user1, and user2
        const finalBalanceOwner = await getFaBalance(
          owner,
          metadataAddress.toString()
        );
        const finalBalanceUser1 = await getFaBalance(
          user1,
          metadataAddress.toString()
        );
        const finalBalanceUser2 = await getFaBalance(
          user2,
          metadataAddress.toString()
        );

        const amount = amount_to_transfer_user1 + amount_to_transfer_user2;

        // Assertions
        expect(transactionHash).toBeDefined();
        expect(typeof transactionHash).toBe("string");

        // Check if the balances changed correctly after the bulk transfer
        expect(finalBalanceUser1).toBe(initialBalanceUser1 - amount); // 2 receivers, so deduct 2 * amountBulk from user1
        expect(finalBalanceOwner).toBe(
          initialBalanceOwner + amount_to_transfer_user1
        ); // Owner's balance should decrease by amountBulk
        expect(finalBalanceUser2).toBe(
          initialBalanceUser2 + amount_to_transfer_user2
        ); // User2's balance should increase by amountBulk
      } catch (error) {
        // Catch any errors that occur during the process
        console.log("Error while performing bulk transfer coin:", error);
      }
    }, 10000);
  });

  describe("admin- transfer", () => {
    
    it("adminTransfer", async () => {
      // Logging initial bucket store values for owner and user1
      console.log("owner bucket store :", await getBucketStore(owner));
      console.log("User1 bucket store :", await getBucketStore(user1));
    
      // Getting initial bucket store values for owner and user1
      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      let [user1A, user1B, user1C] = await getBucketStore(user1);
    
      // Performing admin transfer
      const txt = await adminTransfer(
        owner,
        user1.accountAddress,
        [1, 2, 3],
        [3, 1, 2]
      );
      console.log("txt", txt);
    
      // Logging bucket store values after admin transfer for user1 and owner
      console.log("User1 bucket store :", await getBucketStore(user1));
      console.log("owner bucket store :", await getBucketStore(owner));
    
      // Getting bucket store values after admin transfer for user1 and owner
      let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
    
      // Assertions
      expect(ownerA1).toBe(ownerA - 1); // Check if 1 is deducted from ownerA
      expect(ownerB1).toBe(ownerB - 2); // Check if 2 is deducted from ownerB
      expect(ownerC1).toBe(ownerC - 3); // Check if 3 is deducted from ownerC
    
      expect(user1A1).toBe(user1A + 3); // Check if 3 is added to user1A
      expect(user1B1).toBe(user1B + 1); // Check if 1 is added to user1B
      expect(user1C1).toBe(user1C + 2); // Check if 2 is added to user1C
    }, 10000); // Timeout set to 10 seconds for this test case
    




    it("adminTransferBulk", async () => {
      console.log("owner bucket store :", await getBucketStore(owner));
      console.log("User1 bucket store :", await getBucketStore(user1));
      console.log("User2 bucket store :", await getBucketStore(user2));

      // Retrieve initial bucket store balances
      const [initialOwnerA, initialOwnerB, initialOwnerC] =
        await getBucketStore(owner);
      const [initialUser1A, initialUser1B, initialUser1C] =
        await getBucketStore(user1);
      const [initialUser2A, initialUser2B, initialUser2C] =
        await getBucketStore(user2);

      const address = [user1.accountAddress, user2.accountAddress];
      const txt = await adminTransferBulk(
        owner,
        address,
        [
          [1, 2, 3],
          [4, 5, 3],
        ],
        [
          [3, 1, 2],
          [6, 0, 6],
        ]
      );
      console.log("txt", txt);

      // Retrieve final bucket store balances
      const [finalOwnerA, finalOwnerB, finalOwnerC] =
        await getBucketStore(owner);
      const [finalUser1A, finalUser1B, finalUser1C] =
        await getBucketStore(user1);
      const [finalUser2A, finalUser2B, finalUser2C] =
        await getBucketStore(user2);

      // Assertions
      expect(finalOwnerA).toBe(initialOwnerA - (1 + 4)); // Check if 1 is deducted from ownerA for user1 and 4 for user2
      expect(finalOwnerB).toBe(initialOwnerB - (2 + 5)); // Check if 2 is deducted from ownerB for user1 and 5 for user2
      expect(finalOwnerC).toBe(initialOwnerC - (3 + 3)); // Check if 3 is deducted from ownerC for both users

      expect(finalUser1A).toBe(initialUser1A + 3); // Check if 3 is added to user1A
      expect(finalUser1B).toBe(initialUser1B + 1); // Check if 1 is added to user1B
      expect(finalUser1C).toBe(initialUser1C + 2); // Check if 2 is added to user1C

      expect(finalUser2A).toBe(initialUser2A + 6); // Check if 6 is added to user2A
      expect(finalUser2B).toBe(initialUser2B + 0); // Check if 0 is added to user2B
      expect(finalUser2C).toBe(initialUser2C + 6); // Check if 6 is added to user2C
    }, 10000);
  });

  describe("freeze and unfreeze functions", () => {
    it("should freeze the specified account and return the transaction hash", async () => {
      try {
        // Test freezing an account
        console.log("Testing freeze...");

        // Retrieve metadata address
        const metadata = await getMetadata(owner);

        // Retrieve the freeze status of the account before freezing
        const is_freeze_before = await getIs_freez(user1, metadata.toString());

        // Freeze the specified account
        const freezeTransactionHash = await freeze(owner, user1.accountAddress);

        // Retrieve the freeze status of the account after freezing
        const is_freeze_after = await getIs_freez(user1, metadata.toString());

        // Assertions
        expect(is_freeze_after).toBe(true); // Check if the account is frozen after the transaction
        expect(freezeTransactionHash).toBeDefined(); // Check if the transaction hash is defined
        expect(typeof freezeTransactionHash).toBe("string"); // Check if the transaction hash is a string
      } catch (error) {
        console.log("Error while freezing account:", error);
      }
    });

    it("should unfreeze the specified account and return the transaction hash", async () => {
      try {
        // Test unfreezing an account
        console.log("Testing unfreeze...");

        // Retrieve metadata address
        const metadata = await getMetadata(owner);

        // Retrieve the freeze status of the account before unfreezing
        const is_freeze_before = await getIs_freez(user1, metadata.toString());

        // Unfreeze the specified account
        const unfreezeTransactionHash = await unfreeze(
          owner,
          user1.accountAddress
        );
        console.log("Unfreeze transaction hash:", unfreezeTransactionHash);

        // Retrieve the freeze status of the account after unfreezing
        const is_freeze_after = await getIs_freez(user1, metadata.toString());

        // Assertions
        expect(is_freeze_after).toBe(false); // Check if the account is unfrozen after the transaction
        expect(unfreezeTransactionHash).toBeDefined(); // Check if the transaction hash is defined
        expect(typeof unfreezeTransactionHash).toBe("string"); // Check if the transaction hash is a string
      } catch (error) {
        console.log("Error while unfreezing account:", error);
      }
    });
  });

  describe("bucket-transfer three to one", () => {
    it("admin Transfer  kcash From his Reward3 to user Reward1 bulk ", async () => {
      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      console.log("buketowner", await getBucketStore(owner));
      
      let [user1A, user1B, user1C] = await getBucketStore(user1);
      console.log("buketuser1", await getBucketStore(user1));

      let [user2A, user2B, user2C] = await getBucketStore(user2);
      console.log("buketuser2", await getBucketStore(user2));


      const transferKcash1 = 10*decimal_kcash;
      const transferKcash2 = 20*decimal_kcash;
      const amountbulk_arr = [transferKcash1, transferKcash2];

      // Transfer rewards from bucket 3 to bucket 1
      let rew2Tx = await transferReward3ToReward1ByAdminOnlyInBulk(
        owner,
        receiver_ar,
        amountbulk_arr
      );
      console.log("🚀 ~ rewTx:", rew2Tx);

      // Validate bucket stores after transfer
      console.log("buketowner", await getBucketStore(owner));
      console.log("user1", await getBucketStore(user1));
      console.log("user2", await getBucketStore(user2));

      let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
      let [user1A2, user1B2, user1C3] = await getBucketStore(user1);
      let [user2A3, user2B3, user2C3] = await getBucketStore(user2);

      // Assertion

      const ownerExpected = ownerC - 30 * decimal_kcash;

      // Assert the changes in bucket stores
      expect(ownerC1).toEqual(ownerC-30* decimal_kcash); // Owner's bucket 3 should decrease by transferKcash
      expect(user1A2).toEqual(user1A+10); // User1's bucket 1 should increase by transferKcash
      expect(user2A3).toEqual(user2A+20* decimal_kcash); // User2's bucket 1 should increase by transferKcash

      expect(rew2Tx).toBeDefined();
    }, 20000);

    it("admin Transfer  kcash From his Reward3 to user Reward1 ", async () => {
      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      let [user1A, user1B, user1C] = await getBucketStore(user1);

      const transferKcash = 10 * decimal_kcash;

      // Transfer rewards from bucket 3 to bucket 1
      let rew2Tx = await transferReward3ToReward1ByAdminOnly(
        owner,
        user1.accountAddress,
        transferKcash
      );
      console.log("🚀 ~ rewTx:", rew2Tx);

      // Validate bucket stores after transfer
      let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
      let [user1A1, user1B2, user1C3] = await getBucketStore(user1);

      // Assert the changes in bucket stores
      expect(ownerC1).toEqual(ownerC-10 * decimal_kcash); // Owner's bucket 3 should decrease by transferKcash
      expect(user1A1 ).toEqual(user1A+10 * decimal_kcash); // User1's bucket 1 should increase by transferKcash
      expect(rew2Tx).toBeDefined();
    }, 20000);

    // it("admin Transfer kcash From his Reward3 to user Reward1 bulk", async () => {
    //   let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
    //   let [user1A, user1B, user1C] = await getBucketStore(user1);
    //   let [user2A, user2B, user2C] = await getBucketStore(user2);

    //   const transferKcash1 = 10 * decimal_kcash;
    //   const transferKcash2 = 20 * decimal_kcash;
    //   const amountbulk_arr = [transferKcash1, transferKcash2];

    //   // Transfer rewards from bucket 3 to bucket 1
    //   let rew2Tx = await transferReward3ToReward1ByAdminOnlyInBulk(
    //     owner,
    //     receiver_ar,
    //     amountbulk_arr
    //   );
    //   console.log("🚀 ~ rewTx:", rew2Tx);

    //   // Validate bucket stores after transfer
    //   let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
    //   let [user1A2, user1B2, user1C3] = await getBucketStore(user1);
    //   let [user2A3, user2B3, user2C3] = await getBucketStore(user2);

    //   // Assertions
    //   const ownerExpected = ownerC - (transferKcash1 + transferKcash2);

    //   // Assert the changes in bucket stores
    //   expect(ownerC1).toEqual(ownerExpected); // Owner's bucket 3 should decrease by transferKcash1 + transferKcash2
    //   expect(user1A2).toEqual(user1A + transferKcash1); // User1's bucket 1 should increase by transferKcash1
    //   expect(user2A3).toEqual(user2A + transferKcash2); // User2's bucket 1 should increase by transferKcash2

    //   expect(rew2Tx).toBeDefined();
    // }, 10000);
  });

  describe("bucket-transfer three to two", () => {
    it("admin Transfer  kcash From his Reward3 to user Reward2 ", async () => {
      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      let [user1A, user1B, user1C] = await getBucketStore(user1);

      const transferKcash = 10 * decimal_kcash;

      // Transfer rewards from bucket 3 to bucket 1
      let rew2Tx = await transferReward3ToReward2ByAdminOnly(
        owner,
        user1.accountAddress,
        transferKcash
      );
      console.log("🚀 ~ rewTx:", rew2Tx);

      // Validate bucket stores after transfer
      let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
      let [user1A1, user1B2, user1C3] = await getBucketStore(user1);

      // Assert the changes in bucket stores
      expect(ownerC - 10 * decimal_kcash).toEqual(ownerC1); // Owner's bucket 3 should decrease by transferKcash
      expect(user1B + 10 * decimal_kcash).toEqual(user1B2); // User1's bucket 1 should increase by transferKcash
      expect(rew2Tx).toBeDefined();
    }, 10000);

    it("admin Transfer kcash From his Reward3 to user Reward2 in bulk", async () => {
      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      let [user1A, user1B, user1C] = await getBucketStore(user1);
      let [user2A, user2B, user2C] = await getBucketStore(user2);

      // Amount to transfer to each user
      const transferKcash1 = 10 * decimal_kcash;
      const transferKcash2 = 20 * decimal_kcash;
      const amountbulk_arr = [transferKcash1, transferKcash2];

      // Transfer rewards from bucket 3 to bucket 2 for both user1 and user2
      let rew2Tx = await transferReward3ToReward2ByAdminOnlyInBulk(
        owner,
        [user1.accountAddress, user2.accountAddress], // Array of receiver addresses
        amountbulk_arr // Amount to transfer to each receiver
      );
      console.log("🚀 ~ rewTx:", rew2Tx);

      // Validate bucket stores after transfer
      let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
      let [user2A1, user2B1, user2C1] = await getBucketStore(user2);

      // Assertions
      const ownerExpected =  (transferKcash1 + transferKcash2);
      const expectedUser1B = user1B + transferKcash1;
      const expectedUser2B = user2B + transferKcash2;

      // Assert the changes in bucket stores
      expect(ownerC1).toEqual(ownerC-ownerExpected); // Owner's bucket 3 should decrease by 2 * amountBulk
      expect(user1B1).toEqual(expectedUser1B); // User1's bucket 2 should increase by amountBulk
      expect(user2B1).toEqual(expectedUser2B); // User2's bucket 2 should increase by amountBulk
      expect(rew2Tx).toBeDefined();
    }, 10000);
  });

  describe("bucket-transfer three to three", () => {
    it("admin Transfer  kcash From user Reward3 to user Reward3 ", async () => {
      let [user1A, user1B, user1C] = await getBucketStore(user1);
      let [user2A, user2B, user2C] = await getBucketStore(user2);

      const transferKcash = 10 * decimal_kcash;

      // Transfer rewards from bucket 3 to bucket 1
      let rew2Tx = await transferFromReward3ToReward3(
        owner,
        user1,
        user2.accountAddress,
        transferKcash
      );
      console.log("🚀 ~ rewTx:", rew2Tx);

      // Validate bucket stores after transfer
      let [user1A1, user1B2, user1C3] = await getBucketStore(user1);
      let [user2A1, user2B2, user2C3] = await getBucketStore(user2);

      // Assert the changes in bucket stores
      expect(user1C - 10 * decimal_kcash).toEqual(user1C3); // Owner's bucket 3 should decrease by transferKcash
      expect(user2C + 10 * decimal_kcash).toEqual(user2C3); // User1's bucket 1 should increase by transferKcash
      expect(rew2Tx).toBeDefined();
    }, 10000);

    it("transfer from user1's reward3 to multiple users' reward3, bulk", async () => {
      let [user1A, user1B, user1C] = await getBucketStore(user1);
      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      let [user2A, user2B, user2C] = await getBucketStore(user2);

      // Transfer rewards from bucket 3 to bucket 3 for both user1 and user2
      let rew3Tx = await transferFromReward3ToReward3Bulk(
        owner,
        user1,
        [owner.accountAddress, user2.accountAddress], // Array of receiver addresses
        [10, 2] // Amount to transfer to each receiver
      );
      console.log("🚀 ~ rewTx:", rew3Tx);

      // Validate bucket stores after transfer
      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
      let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
      let [user2A1, user2B1, user2C1] = await getBucketStore(user2);

      // Assert the changes in bucket stores
      expect(user1C - (10 + 2)).toEqual(user1C1); // User1's bucket 3 should decrease by 10 + 2
      expect(ownerC + 10).toEqual(ownerC1);
      expect(user2C + 2).toEqual(user2C1); // User2's bucket 3 should increase by 2
      expect(rew3Tx).toBeDefined();
    }, 10000);
  });

  describe("transferFromBucketToReward", () => {
    it("transferFromBucketToReward3", async () => {
      // Retrieve initial bucket store balances
      let [user1A, user1B, user1C] = await getBucketStore(user1);
      let [user2A, user2B, user2C] = await getBucketStore(user2);

      // Perform the transfer from bucket to Reward3 for user1 to user2
      let tb3Tx = await transferFromBucketToReward3(
        owner,
        user1,
        user2.accountAddress,
        [10, 10, 5] // Amounts to transfer from each bucket
      );

      // Retrieve final bucket store balances
      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
      let [user2A1, user2B1, user2C1] = await getBucketStore(user2);

      // Assertions
      expect(user1A1).toBe(user1A - 10); // Check if 10 is deducted from user1A
      expect(user1B1).toBe(user1B - 10); // Check if 10 is deducted from user1B
      expect(user1C1).toBe(user1C - 5); // Check if 5 is deducted from user1C
      expect(user2C1).toBe(user2C + 25); // Check if the total amount (10+10+5) is added to user2C
    });

    it("transferFromBucketToReward3Bulk", async () => {
      // Retrieve initial bucket store balances
      let [user1A, user1B, user1C] = await getBucketStore(user1);
      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      let [user2A, user2B, user2C] = await getBucketStore(user2);

      // Perform the transfer from bucket to Reward3 for user1 to user2
      let tb3Tx = await transferFromBucketToReward3Bulk(
        owner,
        user1,
        [owner.accountAddress, user2.accountAddress],
        [
          [1, 10, 5],
          [10, 1, 5],
        ]
      );

      // Retrieve final bucket store balances
      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
      let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
      let [user2A1, user2B1, user2C1] = await getBucketStore(user2);

      // Assertions
      expect(user1A1).toBe(user1A - (10 + 1)); // Check if 10 is deducted from user1A
      expect(user1B1).toBe(user1B - (1 + 10)); // Check if 10 is deducted from user1B
      expect(user1C1).toBe(user1C - (5 + 5)); // Check if 5 is deducted from user1C
      expect(ownerC1).toBe(ownerC + 16); // Check if the total amount (1+10+5) is added to user2C
      expect(user2C1).toBe(user2C + 16); // Check if the total amount (10+1+5) is added to user2C
    },10000);
  });

  describe("admin Transer With Signature", () => {
    // it("adminTransferWithSignature", async () => {
    //   // Create a message and calculate its hash
    //   const message = new Uint8Array(Buffer.from("KCash"));
    //   const messageHash = sha256(message);

    //   // Sign the message hash using the owner's private key
    //   const signature = await signMessage(privateKeyOwner, messageHash);
    //   console.log("signature", signature);

    //   // Retrieve initial bucket store balances
    //   console.log("owner", await getBucketStore(owner));
    //   console.log("user2", await getBucketStore(user2));
    //   let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
    //   let [user2A, user2B, user2C] = await getBucketStore(user2);

    //   // Call adminTransferWithSignature function
    //   let adminSignatureTx = await adminTransferWithSignature(
    //     owner,
    //     user2.accountAddress,
    //     [1, 2, 3], // Deduct 1 from ownerA, 2 from ownerB, and 3 from ownerC
    //     [3, 1, 2], // Add 3 to user2A, 1 to user2B, and 2 to user2C
    //     signature,
    //     message
    //   );
    //   console.log("🚀 ~ adminSignatureTx:", adminSignatureTx);

    //   // Retrieve final bucket store balances
    //   let [ownerA1, ownerB1, ownerC1] = await getBucketStore(owner);
    //   let [user2A2, user2B2, user2C2] = await getBucketStore(user2);
    //   console.log("owner", await getBucketStore(owner));
    //   console.log("user2", await getBucketStore(user2));

    //   // Assertions
    //   expect(ownerA1).toEqual(ownerA - 1); // Check if 1 is deducted from ownerA
    //   expect(ownerB1).toEqual(ownerB - 2); // Check if 2 is deducted from ownerB
    //   expect(ownerC1).toEqual(ownerC - 3); // Check if 3 is deducted from ownerC

    //   expect(user2A2).toEqual(user2A + 3); // Check if 3 is added to user2A
    //   expect(user2B2).toEqual(user2B + 1); // Check if 1 is added to user2B
    //   expect(user2C2).toEqual(user2C + 2); // Check if 2 is added to user2C
    // }, 10000);

    // it("transfer Reward3 To Reward1 With Sign", async () => {
    //   const signature = await signMessage(privateKeyOwner, messageHash);
    //   let nonce = await getNonce(owner);
    //   // console.log("🚀 ~ nonce:", nonce);
    //   let tx = await transferReward3ToReward1WithSign(
    //     owner,
    //     user1,
    //     user2.accountAddress,
    //     10,
    //     signature,
    //     message,
    //     nonce
    //   );
    //   // console.log("🚀 ~ tx:", tx);
    // });

    it("transfer Reward3 To Reward1 With Sign", async () => {
      const signature = await signMessage(privateKeyOwner, messageHash);
      let nonce = await getNonce(owner);

      let [user1A, user1B, user1C] = await getBucketStore(user1);
      let [user2A, user2B, user2C] = await getBucketStore(user2);

      let tx = await transferReward3ToReward1WithSign(
        owner,
        user1,
        user2.accountAddress,
        10,
        signature,
        message,
        nonce
      );
      console.log("🚀 ~ tx:", tx);

      let [user1A2, user1B2, user1C2] = await getBucketStore(user1);
      let [user2A3, user2B3, user2C3] = await getBucketStore(user2);

      expect(user1C).toEqual(user1C2 - 10);
      expect(user2A).toEqual(user2A3 + 10);
    });

    it("transfer Reward3 To Reward1 Bulk With Sign", async () => {
      const signature = await signMessage(privateKeyOwner, messageHash);
      let nonce = await getNonce(owner);
      // console.log("🚀 ~ nonce:", nonce);

      let [user1A, user1B, user1C] = await getBucketStore(user1);
      console.log("User1 initial bucket store :", await getBucketStore(user1));

      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      console.log("Owner initial bucket store :", await getBucketStore(owner));

      let [user2A, user2B, user2C] = await getBucketStore(user2);
      console.log("User2 initial bucket store :", await getBucketStore(user2));

      let tx1_bulk = await transferReward3ToReward1BulkWithSign(
        owner,
        user1,
        [owner.accountAddress, user2.accountAddress],
        [1, 2],
        signature,
        message,
        nonce
      );
      console.log("🚀 ~ tx1_bulk:", tx1_bulk);

      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
      console.log(
        "User1 after transfer bucket store :",
        await getBucketStore(user1)
      );

      let [ownerA2, ownerB2, ownerC2] = await getBucketStore(owner);
      console.log(
        "Owner after transfer bucket store :",
        await getBucketStore(owner)
      );

      let [user2A3, user23B, user2C3] = await getBucketStore(user2);
      console.log(
        "User2 after transfer bucket store :",
        await getBucketStore(user2)
      );

      expect(user1C).toEqual(user1C1 - (1 + 2));
      expect(ownerA).toEqual(ownerA2 + 1);
      expect(user2A).toEqual(user2A3 + 2);
    });


    it("transfer Reward3 To Reward2 With Sign", async () => {
      const signature = await signMessage(privateKeyOwner, messageHash);
      let nonce = await getNonce(owner);

      let [user1A, user1B, user1C] = await getBucketStore(user1);
      console.log("User1 initial bucket store :", await getBucketStore(user1));


      let [user2A, user2B, user2C] = await getBucketStore(user2);
      console.log("User2 initial bucket store :", await getBucketStore(user2));

      let tx2 = await transferReward3ToReward2WithSign(
        owner,
        user1,
        user2.accountAddress,
        10,
        signature,
        message,
        nonce
      );
      console.log("🚀 ~ tx:", tx2);
     
      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
      console.log(
        "User1 after transfer bucket store :",
        await getBucketStore(user1)
      );

      let [user2A3, user23B, user2C3] = await getBucketStore(user2);
      console.log(
        "User2 after transfer bucket store :",
        await getBucketStore(user2)
      );

      expect(user1C).toEqual(user1C1 - 10);
      expect(user2B).toEqual(user23B + 10);
    });

    it("transfer Reward3 To Reward2 BulkWith Sign", async () => {
      const signature = await signMessage(privateKeyOwner, messageHash);
      let nonce = await getNonce(owner);

      let [user1A, user1B, user1C] = await getBucketStore(user1);
      console.log("User1 initial bucket store :", await getBucketStore(user1));

      let [ownerA, ownerB, ownerC] = await getBucketStore(owner);
      console.log("Owner initial bucket store :", await getBucketStore(owner));

      let [user2A, user2B, user2C] = await getBucketStore(user2);
      console.log("User2 initial bucket store :", await getBucketStore(user2));
      
      let tx2_bulk = await transferReward3ToReward2BulkWithSign(
        owner,
        user1,
        [owner.accountAddress,user2.accountAddress],
        [1, 2],
        signature,
        message,
        nonce
      );
      console.log("🚀 ~ tx1_bulk:", tx2_bulk);

      let [user1A1, user1B1, user1C1] = await getBucketStore(user1);
      console.log(
        "User1 after transfer bucket store :",
        await getBucketStore(user1)
      );

      let [ownerA2, ownerB2, ownerC2] = await getBucketStore(owner);
      console.log(
        "Owner after transfer bucket store :",
        await getBucketStore(owner)
      );

      let [user2A3, user23B, user2C3] = await getBucketStore(user2);
      console.log(
        "User2 after transfer bucket store :",
        await getBucketStore(user2)
      );

      expect(user1C).toEqual(user1C1 - (1 + 2));
      expect(ownerB).toEqual(ownerB2 + 1);
      expect(user2B).toEqual(user23B + 2);
    });
  });
});
