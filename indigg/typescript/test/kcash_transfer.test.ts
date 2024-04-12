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
  bulkMintCoin
} from "../kcash_fungible_asset";
import { compilePackage, getPackageBytesToPublish } from "../utils";

const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
console.log("APTOS_NETWORK3000", APTOS_NETWORK);

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

let privateKeyOwner = new Ed25519PrivateKey(
  "0x0e01a078173da5586d4cb3fd928c2cf70c3b855522f7399f62d589016fdfbfeb"
);

let privateKeyBob = new Ed25519PrivateKey(
  "0xa375ba0e666de6d81bfb35051b98d67561673f7204b6d20ad33ed7d61e0ba659"
);

let privateKeyCharlie = new Ed25519PrivateKey(
  "0x746089cbc76c7ddcc3d1704ecd726cfaf5f9331eddf24edf20e5260d7e0f0180"
);

let owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
let user1 = Account.fromPrivateKey({ privateKey: privateKeyBob });
let user2 = Account.fromPrivateKey({ privateKey: privateKeyCharlie });

let metadataAddress: string;

const amount_to_mint = 100000000000;
const rewart1 = amount_to_mint * 0.5;
const rewart2 = amount_to_mint * 0.2;
const rewart3 = amount_to_mint * 0.3;

const amount_to_withdraw = 65000000000;

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

  // describe("fromPrivateKeyAndAddress", () => {
  //   it("derives the correct account from a  ed25519 private key", () => {
  //     let privateKeyOwner = new Ed25519PrivateKey(
  //       "0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a"
  //     );
  //     let owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
  //     expect(owner).toBeInstanceOf(Ed25519Account);
  //     expect(owner.publicKey).toBeInstanceOf(Ed25519PublicKey);
  //     expect(owner.privateKey).toBeInstanceOf(Ed25519PrivateKey);
  //     expect(owner.privateKey.toString()).toEqual(privateKeyOwner.toString());
  //   });
  // });

  // describe("aptos config", () => {
  //   it("it should set urls based on a local network", () => {
  //     const settings: AptosSettings = {
  //       network: Network.LOCAL,
  //     };
  //     const aptosConfig = new AptosConfig(settings);
  //     expect(aptosConfig.network).toEqual("local");
  //     expect(aptosConfig.getRequestUrl(AptosApiType.FULLNODE)).toBe(
  //       NetworkToNodeAPI[Network.LOCAL]
  //     );
  //     expect(aptosConfig.getRequestUrl(AptosApiType.FAUCET)).toBe(
  //       NetworkToFaucetAPI[Network.LOCAL]
  //     );
  //     expect(aptosConfig.getRequestUrl(AptosApiType.INDEXER)).toBe(
  //       NetworkToIndexerAPI[Network.LOCAL]
  //     );
  //   });

  //   it("it should set urls based on a devnet network", () => {
  //     const settings: AptosSettings = {
  //       network: Network.DEVNET,
  //     };
  //     const aptosConfig = new AptosConfig(settings);
  //     expect(aptosConfig.network).toEqual("devnet");
  //     expect(aptosConfig.getRequestUrl(AptosApiType.FULLNODE)).toBe(
  //       NetworkToNodeAPI[Network.DEVNET]
  //     );
  //     expect(aptosConfig.getRequestUrl(AptosApiType.FAUCET)).toBe(
  //       NetworkToFaucetAPI[Network.DEVNET]
  //     );
  //     expect(aptosConfig.getRequestUrl(AptosApiType.INDEXER)).toBe(
  //       NetworkToIndexerAPI[Network.DEVNET]
  //     );
  //   });
  // });

  // describe("KCash Package Compilation and Publishing and deploy", () => {
  //   it("should compile and publish KCash package", async () => {
  //     // Define mock implementations for compilePackage and publishPackageTransaction
  //     const { metadataBytes, byteCode } = getPackageBytesToPublish(
  //       "/move/facoin/facoin.json"
  //     );
  //     //   console.log(metadataBytes,byteCode);
  //     console.log("\n===Publishing KCash package===");
  //     const transaction = await aptos.publishPackageTransaction({
  //       account: owner.accountAddress,
  //       metadataBytes,
  //       moduleBytecode: byteCode,
  //     });
  //     const response = await aptos.signAndSubmitTransaction({
  //       signer: owner,
  //       transaction,
  //     });
  //     await aptos.waitForTransaction({
  //       transactionHash: response.hash,
  //     });
  //     console.log(`Transaction hash28000: ${response.hash}`);
  //     expect(response.hash).toBeDefined();
  //   });
  // });

  // describe("check blance of account and get metadata", () => {
  //   it("get metadata", async () => {
  //     try {
  //       // Test getting metadata
  //       console.log("Testing getMetadata...");
  //       const metadata = await getMetadata(owner);
  //       expect(metadata).toBeDefined();
  //       console.log("Metadata:", metadata);
  //     } catch (error) {
  //       console.log("error", error);
  //     }
  //   });

  //   it("get Fa_blance", async () => {
  //     try {
  //       // Test getting FA balance
  //       console.log("Testing getFaBalance...");
  //       const metadataAddress = await getMetadata(owner);
  //       console.log("metadataAddress276", metadataAddress);
  //       const balance = await getFaBalance(owner, metadataAddress.toString());
  //       expect(balance).toBeDefined();
  //       console.log("Balance:", balance);
  //     } catch (error) {
  //       console.log("error", error);
  //     }
  //   });
  // });

  describe("minting-burning-coin", () => {
    // it("Mint Coins", async () => {
    //   try {
    //     console.log("startminting....73");
    //     let metadataAddress = await getMetadata(owner);
    //     console.log("metadata172", metadataAddress);
    //     let initialBalanceowner = await getFaBalance(
    //       owner,
    //       metadataAddress.toString()
    //     );
    //     console.log("initialBalanceowner", initialBalanceowner);
    //     const bucketStore = await getBucketStore(owner);
    //     console.log("bucketStore",bucketStore);
        
    //     console.log("amount to be mint 100000000000");
    //     // let result = await mintCoin(owner, owner, 100000000000000000);
    //     let mintCoinTransactionHash = await mintCoin(
    //       owner,
    //       owner,
    //       amount_to_mint,
    //       rewart1,
    //       rewart2,
    //       rewart3
    //     );
    //     console.log("result", mintCoinTransactionHash);
    //     const finalBalanceoner = await getFaBalance(
    //       owner,
    //       metadataAddress.toString()
    //     );
    //     const bucketStore_after_minting = await getBucketStore(owner);
    //     console.log("bucketStore_after_minting",bucketStore_after_minting);
    //     expect(finalBalanceoner).toBe(initialBalanceowner + amount_to_mint);
    //     console.log("initialBalanceAlice180", initialBalanceowner);
    //     console.log("finalBalanceAlice1888", finalBalanceoner);
    //   } catch (error) {
    //     console.log("error", error);
    //   }
    // });

  
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
        console.log("start bulk minting....");
        const metadata= await getMetadata(owner)
        const get_owner_blance= await getFaBalance(owner,metadata.toString()) // befor builkmint owner balance 
        console.log("get_owner_blance",get_owner_blance);
        const get_user1_blance=await getFaBalance(user1,metadata.toString())  //befor user1 blance
        console.log("get_user1_blance",get_user1_blance);
        const get_user2_blance=await getFaBalance(user2,metadata.toString()) // befor user2 blance
        console.log("get_user2_blance",get_user2_blance);
        let bulkMintTx = await bulkMintCoin(
          owner,
          receiver_ar,
          amount_ar,
          r1_ar,
          r2_ar,
          r3_ar
        );
       console.log("bulkMintTx",bulkMintTx);
       await aptos.waitForTransaction({ transactionHash: bulkMintTx });
        console.log("🚀 ~ main ~ bulkMintTx:", bulkMintTx);
        const get_owner_blance_after= await getFaBalance(owner,metadata.toString())  // add 100000000000 owner1,5000000 oner2 account
        console.log("get_owner_blance",get_owner_blance);
        const get_user1_blance_after=await getFaBalance(user1,metadata.toString())    // add oner1 add 1000000
        console.log("get_user1_blance",get_user1_blance);
        const get_user2_blance_after=await getFaBalance(user2,metadata.toString())   // add owner3 add 50000000
        console.log("get_user2_blance",get_user2_blance);
        // expect(get_owner_blance_after).toBe()
      } catch (error) {
        console.log("error",error);
      }
    });



    // it("burn coin", async () => {
    //   try {
    //     // Assuming Alice wants to burn some coins from her account
    //     console.log("start burning coins...");
    //     // Get the initial balance of the owner
    //     const metadata = await getMetadata(owner);
    //     const initialBalanceOwner = await getFaBalance(
    //       user1,
    //       metadata.toString()
    //     );
    //     console.log("initialBalanceOwner206", initialBalanceOwner);
    //     // Define the amount of coins to burn
    //     const amountToBurn = 1000000; // Adjust as necessary
    //     // // Burn coins from the owner's account
    //     const burnCoinTransactionHash = await burnCoin(
    //       owner,
    //       user1.accountAddress,
    //       amountToBurn
    //     );
    //     console.log("Burn coin transaction hash:", burnCoinTransactionHash);
    //     // Get the final balance of the owner after burning coins
    //     const finalBalanceOwner = await getFaBalance(
    //       user1,
    //       metadata.toString()
    //     );
    //     console.log("finalBalanceOwner", finalBalanceOwner);
    //     // Assert that the final balance is decreased by the amount burned
    //     expect(finalBalanceOwner).toBe(initialBalanceOwner - amountToBurn);
    //     // console.log("Initial balance of owner:", initialBalanceOwner);
    //     // console.log("Final balance of owner:", finalBalanceOwner);
    //   } catch (error) {
    //     console.log("error", error);
    //   }
    // });



  });

  // describe("kcash-transfer-coin", () => {
  //   it("Transfer Coins", async () => {
  //     try {
  //       console.log("Starting testing transfer coin");

  //       // Retrieve metadata address
  //       const metadataAddress = await getMetadata(owner);
  //       console.log("Metadata address:", metadataAddress);

  //       // Retrieve initial balances
  //       const initialBalanceOwner = await getFaBalance(
  //         owner,
  //         metadataAddress.toString()
  //       );
  //       console.log("Initial balance of owner:", initialBalanceOwner);

  //       const initialBalanceuser1 = await getFaBalance(
  //         user1,
  //         metadataAddress.toString()
  //       );
  //       console.log("Initial balance of user1:", initialBalanceuser1);

  //       // Perform the transfer
  //       const transactionHash = await transferCoin(
  //         owner,
  //         owner.accountAddress,
  //         user1.accountAddress,
  //         amount_to_withdraw
  //       );
  //       console.log("Transaction hash:", transactionHash);

  //       // Retrieve final balances
  //       const finalBalanceOwner = await getFaBalance(
  //         owner,
  //         metadataAddress.toString()
  //       );
  //       console.log("finalBalanceOwner", finalBalanceOwner);

  //       const finalBalanceuser1 = await getFaBalance(
  //         user1,
  //         metadataAddress.toString()
  //       );
  //       console.log("Final balance of Bob:", finalBalanceuser1);

  //       // Assertions
  //       expect(transactionHash).toBeDefined();
  //       expect(typeof transactionHash).toBe("string");

  //       // // Check if the balances changed correctly after the transfer
  //       expect(finalBalanceOwner).toBe(
  //         initialBalanceOwner - amount_to_withdraw
  //       );
  //       expect(finalBalanceuser1).toBe(
  //         initialBalanceuser1 + amount_to_withdraw
  //       );
  //     } catch (error) {
  //       console.error("Error while transferring coins:", error);
  //       fail(error); // Fail the test explicitly if an error occurs
  //     }
  //   });
  // });

  // describe("freeze and unfreeze functions", () => {
  //   it("should freeze the specified account and return the transaction hash", async () => {
  //     try {
  //       // Test freezing an account
  //       console.log("Testing freeze...");
  //       const metadata = await getMetadata(owner);
  //       const is_freezbefor = await getIs_freez(user1, metadata.toString());
  //       console.log("is_freezbefor", is_freezbefor);

  //       const freezeTransactionHash = await freeze(owner, user1.accountAddress);
  //       const is_freezafter = await getIs_freez(user1, metadata.toString());
  //       console.log("is_freez", is_freezafter);

  //       expect(is_freezafter).toBe(true);
  //       expect(freezeTransactionHash).toBeDefined();
  //       expect(typeof freezeTransactionHash).toBe("string");
  //     } catch (error) {
  //       console.log("Error while freezing account:", error);
  //     }
  //   });

  //   it("should unfreeze the specified account and return the transaction hash", async () => {
  //     try {
  //       // Test unfreezing an account
  //       console.log("Testing unfreeze...");
  //       const metadata = await getMetadata(owner);
  //       const is_freezbefor = await getIs_freez(user1, metadata.toString());
  //       console.log("is_freezbefor", is_freezbefor);
  //       const unfreezeTransactionHash = await unfreeze(
  //         owner,
  //         user1.accountAddress
  //       );
  //       console.log("Unfreeze transaction hash:", unfreezeTransactionHash);
  //       const is_freezafter = await getIs_freez(user1, metadata.toString());
  //       console.log("is_freezbefor", is_freezafter);

  //       expect(is_freezafter).toBe(false);
  //       expect(unfreezeTransactionHash).toBeDefined();
  //       expect(typeof unfreezeTransactionHash).toBe("string");
  //       // You can add more assertions here if needed
  //     } catch (error) {
  //       console.log("Error while unfreezing account:", error);
  //     }
  //   });
  // });
});
