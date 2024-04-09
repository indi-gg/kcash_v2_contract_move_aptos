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
  } from "@aptos-labs/ts-sdk";
  import {
    transferCoin,
    mintCoin,
    burnCoin,
    freeze,
    unfreeze,
    getFaBalance,
    getMetadata,
  } from "../../indigg/typescript/kcash_fungible_asset"; // Replace "your_file_name" with the actual name of your file containing the functions
  //   import {expect, jest, test} from '@jest/globals';
  
  
 
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


  
  describe("Testing Aptos Blockchain Functions", () => {

    beforeEach(async () => {
      // Get metadata address
       metadataAddress = await getMetadata(owner);
      console.log("metadataAddress", metadataAddress);
    }, 20000);
    
  
    
  
    test("Mint Coins", async () => {
      // Assuming Alice wants to mint some coins for herself
      console.log("startminting....73");
      metadataAddress = await getMetadata(owner);
      console.log("metadata172",metadataAddress);
      
      let initialBalanceowner = await getFaBalance(owner, metadataAddress);
      console.log("initialBalanceAlice",initialBalanceowner);
      // let amountToMint = 10000000000000000; // Adjust as necessary
      console.log("owner18444",owner);
    //   let result = await mintCoin(owner, owner, 100000000000000000);
      let mintCoinTransactionHash = await mintCoin(owner, owner, 100000000000000000);
      console.log("result", mintCoinTransactionHash);
      // const finalBalanceAlice = await getFaBalance(owner, metadataAddress);
      // expect(finalBalanceAlice).toBe(initialBalanceowner + amountToMint);
    });
   
  });
  
  
