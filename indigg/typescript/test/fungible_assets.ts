// import {
//   Account,
//   AccountAddress,
//   AnyNumber,
//   Aptos,
//   AptosConfig,
//   Network,
//   NetworkToNetworkName,
//   Ed25519PrivateKey,
//   Ed25519Account,
// } from "@aptos-labs/ts-sdk";
// import {
//   transferCoin,
//   mintCoin,
//   burnCoin,
//   freeze,
//   unfreeze,
//   getFaBalance,
//   getMetadata,
// } from "../../indigg/typescript/kcash_fungible_asset"; // Replace "your_file_name" with the actual name of your file containing the functions
// //   import {expect, jest, test} from '@jest/globals';

// // let privateKeyOwner = new Ed25519PrivateKey(
// //     "0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a"
// //   );

// //   let privateKeyBob = new Ed25519PrivateKey(
// //     "0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e"
    
// //   );

// //    let owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
// //   let bob = Account.fromPrivateKey({ privateKey: privateKeyBob });
// // let result =  mintCoin(owner, bob, 1000000000000);
// // console.log("result3555",result);



// describe("Testing Aptos Blockchain Functions", () => {
// // let owner: Account;
//    let owner: Ed25519Account;
//   let bob: Ed25519Account;
//   let charlie: Account;
//   let metadataAddress: string;

// //   let privateKeyOwner = new Ed25519PrivateKey("0xb8c6e21fe1c09b0891703c75abe828a7867286f312743011b53d883fa621379c");
// //   let owner1 = Account.fromPrivateKey({ privateKey:privateKeyOwner });
// //   console.log("owener1",owner1);
  

// //    owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });


//   beforeEach(async () => {
//     // Set up accounts
//     // let privateKeyAlice = new Ed25519PrivateKey(
//     //   "0xb8c6e21fe1c09b0891703c75abe828a7867286f312743011b53d883fa621379c"
//     // );
//     // console.log("privateKeyAlice", privateKeyAlice);

//     let privateKeyOwner = new Ed25519PrivateKey(
//       "0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a"
//     );

//     let privateKeyBob = new Ed25519PrivateKey(
//       "0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e"
//     );
//     console.log("privateKeyBob", privateKeyBob);

//     let privateKeyCharlie = new Ed25519PrivateKey(
//       "0x1983c113a674948c187d3132ce0a8718b4e63eb1e2ca49bb132a291dc88bdf4c"
//     );
//     console.log("privateKeyCharlie", privateKeyCharlie);

//     // alice = Account.fromPrivateKey({ privateKey: privateKeyAlice });
//     owner = Account.fromPrivateKey({ privateKey: privateKeyOwner });
//     bob = Account.fromPrivateKey({ privateKey: privateKeyBob });
//     charlie = Account.fromPrivateKey({ privateKey: privateKeyCharlie });
//     console.log("alice44", owner, bob, charlie);

//     // Get metadata address
//     metadataAddress = await getMetadata(owner);
//     console.log("metadataAddress", metadataAddress);
//     // const initialBalanceowner = await getFaBalance(owner, metadataAddress);
//     // let result = await mintCoin(owner, owner, 100000000000000000);
//     // console.log("result72",result);

//   }, 20000);
//   console.log("beforruncasess");

  

//   test("Mint Coins", async () => {
//     // Assuming Alice wants to mint some coins for herself
//     console.log("startminting....73");
    
//     let initialBalanceowner = await getFaBalance(owner, metadataAddress);
//     console.log("initialBalanceAlice",initialBalanceowner);
//     // let amountToMint = 10000000000000000; // Adjust as necessary
//     console.log("oner8222",owner);
    
//     console.log("owner18444",owner);
    
//     let result = await mintCoin(owner, owner, 100000000000000000);
//     console.log("result", result);
//     // const finalBalanceAlice = await getFaBalance(owner, metadataAddress);
//     // expect(finalBalanceAlice).toBe(initialBalanceowner + amountToMint);
//   });
 
// });



import {
    Account,
    AccountAddress,
    AnyNumber,
    Aptos,
    AptosConfig,
    Network,
    NetworkToNetworkName,
    Ed25519PrivateKey,
    Ed25519Account,
    InputViewFunctionData
  } from "@aptos-labs/ts-sdk";
  import {
    transferCoin,
    mintCoin,
    burnCoin,
    freeze,
    unfreeze,
    getFaBalance,
    getMetadata,

  } from "../kcash_fungible_asset"; // Replace "your_file_name" with the actual name of your file containing the functions
import { from } from "form-data";
  //   import {expect, jest, test} from '@jest/globals';
//  import { Account} from "../../../src/api/account"
  const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
console.log("APTOS_NETWORK3000",APTOS_NETWORK);

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
 let bob = Account.fromPrivateKey({ privateKey: privateKeyBob });
 let charlie = Account.fromPrivateKey({ privateKey: privateKeyCharlie });

 let metadataAddress: string
  


 

//  let result =  mintCoin(owner, bob, 100000000000000000);
//  console.log("result", result);


// Mocking aptos object for testing purposes




  
  describe("Testing Aptos Blockchain Functions", () => {

    beforeEach(async () => {
      // Get metadata address
       metadataAddress = await getMetadata(owner);
      console.log("metadataAddress", metadataAddress);
    }, 20000);
    

    // test("it fetches account data", async () => {
    //   const config = new AptosConfig({ network: Network.DEVNET });
    //   const aptos = new Aptos(config);
    //   const data = await aptos.getAccountModules({
    //     accountAddress: owner.accountAddress,
    //   });
    //   console.log("data 2222",data);
      
    //   expect(data).toHaveProperty("sequence_number");
    //   // expect(data.sequence_number).toBe("0");
    //   // expect(data).toHaveProperty("authentication_key");
    //   // expect(data.authentication_key).toBe("0x0000000000000000000000000000000000000000000000000000000000000001");
    // });


    test("it fetches an account resource typed", async () => {
      const config = new AptosConfig({ network: Network.DEVNET });
      const aptos = new Aptos(config);
      type AccountRes = {
        authentication_key: string;
        coin_register_events: {
          counter: string;
          guid: {
            id: {
              addr: string;
              creation_num: string;
            };
          };
        };
        guid_creation_num: string;
        key_rotation_events: {
          counter: string;
          guid: {
            id: {
              addr: string;
              creation_num: string;
            };
          };
        };
        sequence_number: string;
      };

      const resource = await aptos.getAccountResource<AccountRes>({
        accountAddress: "0xaa706bdb1dc3dbc324aab7556a7f18b7e141f5d9b42a006f2a32b7192300c281",
        resourceType: "0xaa706bdb1dc3dbc324aab7556a7f18b7e141f5d9b42a006f2a32b7192300c281::account::Account",
      });
      expect(resource).toHaveProperty("sequence_number");
      expect(resource.sequence_number).toBe("0");
      expect(resource).toHaveProperty("authentication_key");
      expect(resource.authentication_key).toBe("0x0000000000000000000000000000000000000000000000000000000000000001");
    });

    test("it fetches account coins data", async () => {
      // const config = new AptosConfig({ network: Network.LOCAL });
      // const aptos = new Aptos(config);
      // const senderAccount = Account.generate();
      // const fundTxn = await aptos.fundAccount({
      //   accountAddress: senderAccount.accountAddress,
      //   amount: 100000000000000,
      // });

      // await aptos.waitForTransaction({ transactionHash: fundTxn.hash });
      const accountCoinData = await aptos.getAccountCoinsData({
        accountAddress: owner.accountAddress,
      });
      console.log(  "line259",accountCoinData);
      
      
    });

    describe("Testing Aptos Blockchain Functions", () => {
      test("Transfer Coins", async () => {
          try {
             
              // Call transferCoin function
              const transactionHash = await transferCoin(owner, bob.accountAddress, charlie.accountAddress, 100000000000000000);
  
              // Assert that the transaction hash is not null or undefined
              expect(transactionHash).toBeDefined();
              // Assert that the transaction hash is a string
              expect(typeof transactionHash).toBe("string");
              // Assert that the transferCoin function was called with the correct arguments
              // expect(aptos.transaction.build.simple).toHaveBeenCalledWith({
              //     sender: admin.accountAddress,
              //     data: {
              //         function: `${admin.accountAddress}::fa_coin::transfer`,
              //         functionArguments: [fromAddress, toAddress, amount],
              //     },
              // });
              // Assert that the transaction signing was performed
              // expect(aptos.transaction.sign).toHaveBeenCalled();
              // Assert that the transaction submission was performed
              // expect(aptos.transaction.submit.simple).toHaveBeenCalled();
          } catch (error) {
              console.error("Error while transferring coins:", error);
              fail(error); // Fail the test if an error occurs
          }
      });
  });













    test("Get Metadata", async () => {
        try {
            // Test getting metadata
        console.log("Testing getMetadata...");
        const metadata = await getMetadata(owner);
        expect(metadata).toBeDefined();
        console.log("Metadata:", metadata); 
        } catch (error) {
          console.log("error",error);
            
        }
       
    });

  //   test("Get Metadata", async () => {
  //     try {
  //         // Test getting metadata
  //     console.log("Testing getMetadata...");
  //     const metadata = await getMetadata(owner);
  //     const payload: InputViewFunctionData = {
  //       function: `${owner.accountAddress}::fa_coin::get_metadata`,
  //       functionArguments: [],
  //     };
  //     const res = (await aptos.view<[{ inner: string }]>({ payload }))[0];
  //     console.log(`Metadata retrieved successfully:`, res);
  //     console.log( res.inner);
  //     expect(metadata).toBeDefined();
      
  //     } catch (error) {
  //       console.log("error",error);
          
  //     }
     
  // });



    test("Get FA Balance", async () => {
        try {
           // Test getting FA balance
        console.log("Testing getFaBalance...");
        const balance = await getFaBalance(owner, metadataAddress);
        expect(balance).toBeDefined();
        console.log("Balance:", balance);  
        } catch (error) {
         console.log("error",error);
            
        }
       
    });
    
  
    test("Mint Coins", async () => {
      // Assuming Alice wants to mint some coins for herself
      try {
        console.log("startminting....73");
      metadataAddress = await getMetadata(owner);
      console.log("metadata172",metadataAddress);
      
      let initialBalanceowner = await getFaBalance(owner, metadataAddress);
      console.log("initialBalanceAlice180",initialBalanceowner);
      let amountToMint = 10000000000000000; // Adjust as necessary
      console.log("owner18444",owner);
    //   let result = await mintCoin(owner, owner, 100000000000000000);
      let mintCoinTransactionHash = await mintCoin(owner, owner, 100000000000000000);
      console.log("result", mintCoinTransactionHash);
      const finalBalanceAlice = await getFaBalance(owner, metadataAddress);
      expect(finalBalanceAlice).toBe(initialBalanceowner + 100000000000000000);
      console.log("initialBalanceAlice180",initialBalanceowner);
      console.log("finalBalanceAlice1888",finalBalanceAlice);
      } catch (error) {
        console.log("error",error);
      }
    },10000);


    test("Burn Coins", async () => {
        try {
            // Assuming Alice wants to burn some coins from her account
        console.log("start burning coins...");
        // Get the initial balance of the owner
        const initialBalanceOwner = await getFaBalance(owner, metadataAddress);
        // Define the amount of coins to burn
        const amountToBurn = 100000000000000000; // Adjust as necessary
        // Burn coins from the owner's account
        const burnCoinTransactionHash = await burnCoin(owner, owner.accountAddress, amountToBurn);
        console.log("Burn coin transaction hash:", burnCoinTransactionHash);
        // Get the final balance of the owner after burning coins
        const finalBalanceOwner = await getFaBalance(owner, metadataAddress);
        // Assert that the final balance is decreased by the amount burned
        expect(finalBalanceOwner).toBe(initialBalanceOwner - amountToBurn);
        console.log("Initial balance of owner:", initialBalanceOwner);
        console.log("Final balance of owner:", finalBalanceOwner);
        } catch (error) {
           console.log("error",error);
        }
      },10000);
      

      test("Freeze Account", async () => {
        try {
            // Test freezing an account
            console.log("Testing freeze...");
            const freezeTransactionHash = await freeze(owner, bob.accountAddress);
            console.log("Freeze transaction hash:", freezeTransactionHash);
            // You can add more assertions here if needed
            // expect(freezeTransactionHash).toBe(true); 
            expect(freezeTransactionHash).toBeDefined();
            // expect(freezeTransactionHash).toHaveBeenCalled()
            expect(typeof freezeTransactionHash).toBe("string");
        } catch (error) {
            console.log("Error while freezing account:", error);
        }
    });
    
    test("Unfreeze Account", async () => {
        try {
            // Test unfreezing an account
            console.log("Testing unfreeze...");
            const unfreezeTransactionHash = await unfreeze(owner, bob.accountAddress);
            console.log("Unfreeze transaction hash:", unfreezeTransactionHash);
            // You can add more assertions here if needed
        } catch (error) {
            console.log("Error while unfreezing account:", error);
        }
    });
    
    // test("Unfreeze Account", async () => {
    //     try {
    //         // Test unfreezing an account
    //         console.log("Testing unfreeze...");
            
    //         // Get the initial frozen status of the account
    //         const isFrozenBefore = await freeze(owner, bob.accountAddress);
    //         console.log("Is account frozen before unfreezing 298:", isFrozenBefore);
            
    //         // Unfreeze the account
    //         const unfreezeTxnHash = await unfreeze(owner, bob.accountAddress);
    //         console.log("Unfreeze transaction hash:", unfreezeTxnHash);
            
    //         // Get the frozen status of the account after unfreezing
    //         const isFrozenAfter = await freeze(owner, bob.accountAddress);
    //         console.log("Is account frozen after unfreezing:", isFrozenAfter);
            
    //         // Add assertions to verify the unfreezing process
    //         expect(isFrozenBefore).toBe(true); // Account should be frozen before unfreezing
    //         expect(isFrozenAfter).toBe(false); // Account should not be frozen after unfreezing
    //     } catch (error) {
    //         console.log("Error while unfreezing account:", error);
    //     }
    // });
    


    
  //   test("Unfreeze Account", async () => {
  //     try {
  //         // Test unfreezing an account
  //         console.log("Testing unfreeze...");
          
  //         // Freeze the account first to ensure it's frozen before unfreezing
  //         await freeze(owner, bob.accountAddress);




  //         const data = await aptos.getCurrentFungibleAssetBalances({
  //           options: {
  //             where: {
  //               owner_address: { _eq: owner.accountAddress.toStringLong() },
  //             },
  //           },
  //         });
         
  //      console.log("data3333",data);

          
  //         // Get the initial frozen status of the account
  //         // const isFrozenBefore = await isAccountFrozen(owner, bob.accountAddress);

  //          const isFrozenBefore = data;
  //         console.log("Is account frozen before unfreezing:", isFrozenBefore);
          
  //         // // Unfreeze the account
  //         // const unfreezeTxnHash = await unfreeze(owner, bob.accountAddress);
  //         // console.log("Unfreeze transaction hash:", unfreezeTxnHash);
          
  //         // // Get the frozen status of the account after unfreezing
  //         // const isFrozenAfter = await isAccountFrozen(owner, bob.accountAddress);
  //         // console.log("Is account frozen after unfreezing:", isFrozenAfter);
          
  //         // // Add assertions to verify the unfreezing process
  //         // expect(isFrozenBefore).toBe(true); // Account should be frozen before unfreezing
  //         // expect(isFrozenAfter).toBe(false); // Account should not be frozen after unfreezing
  //     } catch (error) {
  //         console.log("Error while unfreezing account:", error);
  //     }
  // });
  





    // test("Freeze Account", async () => {
    //     // Call the freeze function
    //     const transactionHash = await freeze(owner, bob.accountAddress);

    //     // Expect the transaction hash to be returned
    //     // expect(transactionHash).toEqual("mockTransactionHash");
    //     expect(transactionHash).toBeDefined();

    //     // Expect aptos methods to be called with correct arguments
    //     expect(Aptos.prototype.transaction.build.simple).toHaveBeenCalledWith({
    //       sender: owner.accountAddress,
    //       data: {
    //         function: `${owner.accountAddress}::fa_coin::freeze_account`,
    //         functionArguments: [bob.accountAddress],
    //       },
    //     });
    //     expect(Aptos.prototype.transaction.sign).toHaveBeenCalled();
    //     expect(Aptos.prototype.transaction.submit.simple).toHaveBeenCalled();
    // });

    // test("Unfreeze Account", async () => {
    //     // Call the unfreeze function
    //     const transactionHash = await unfreeze(owner, bob.accountAddress);

    //     // Expect the transaction hash to be returned
    //     expect(transactionHash).toEqual("mockTransactionHash");

    //     // Expect aptos methods to be called with correct arguments
    //     expect(aptos.transaction.build.simple).toHaveBeenCalledWith({
    //         sender: owner.accountAddress,
    //         data: {
    //             function: `${owner.accountAddress}::fa_coin::unfreeze_account`,
    //             functionArguments: [bob.accountAddress],
    //         },
    //     });
    //     expect(aptos.transaction.sign).toHaveBeenCalled();
    //     expect(aptos.transaction.submit.simple).toHaveBeenCalled();
    // });
   
  });
  
  
