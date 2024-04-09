// import { freeze } from '../kcash_fungible_asset'; // Import the freeze function
// import {
//     Account,
//     AccountAddress,
//     AnyNumber,
//     Aptos,
//     AptosConfig,
//     Network,
//     NetworkToNetworkName,
//     Ed25519PrivateKey,
//     Ed25519Account,
//   } from "@aptos-labs/ts-sdk";

// // Mock the Aptos SDK functions
// const aptos = {
  
//   transaction: {
//     build: {
//       simple: jest.fn().mockResolvedValue({}), // Mock the build.simple method
//     },
//     sign: jest.fn().mockResolvedValue({}), // Mock the sign method
//     submit: {
//       simple: jest.fn().mockResolvedValue({ hash: "mockTransactionHash" }), // Mock the submit.simple method
//     },
//   },
// };

// // describe('freeze function', () => {
// //   it('should freeze the specified account and return the transaction hash', async () => {

// //   let privateKeyOwner = new Ed25519PrivateKey(
// //     "0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a"
// //   );

// //   let privateKeyBob = new Ed25519PrivateKey(
// //     "0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e"
// //   );

// //   let admin = Account.fromPrivateKey({ privateKey: privateKeyOwner });
// //  let targetAddress = Account.fromPrivateKey({ privateKey: privateKeyBob });
// //     // Mock admin and targetAddress
// //     // const admin = {}; // Mock admin object
// //     // const targetAddress = {}; // Mock target address
    
// //     // Call the freeze function
// //     const transactionHash = await freeze(admin, targetAddress.accountAddress);
    
// //     // Check if the functions were called with the correct arguments
// //     expect(aptos.transaction.build.simple).toHaveBeenCalledWith({
// //       sender: admin.accountAddress,
// //       data: {
// //         function: `${admin.accountAddress}::fa_coin::freeze_account`,
// //         functionArguments: [targetAddress],
// //       },
// //     });
// //     expect(aptos.transaction.sign).toHaveBeenCalled();
// //     expect(aptos.transaction.submit.simple).toHaveBeenCalled();
    
// //     // Check if the function returns the transaction hash
// //     expect(transactionHash).toBe("mockTransactionHash");
// //   });
// // });


// // describe('freeze function', () => {
// //   it('should freeze the specified account and return the transaction hash', async () => {
// //     // Define admin and targetAddress
// //     let privateKeyOwner = new Ed25519PrivateKey(
// //       "0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a"
// //     );

// //     let privateKeyBob = new Ed25519PrivateKey(
// //       "0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e"
// //     );

// //     let admin = Account.fromPrivateKey({ privateKey: privateKeyOwner });
// //     let targetAddress = Account.fromPrivateKey({ privateKey: privateKeyBob });

// //     // Call the freeze function
// //     const transactionHash = await freeze(admin, targetAddress.accountAddress);

// //     console.log("transactionHash81",transactionHash);
    
    
// //     // Check if the functions were called with the correct arguments
// //     expect(aptos.transaction.build.simple).toHaveBeenCalledWith({
// //       sender: admin.accountAddress,
// //       data: {
// //         function: `${admin.accountAddress}::fa_coin::freeze_account`,
// //         functionArguments: [targetAddress.accountAddress], // Use targetAddress.accountAddress instead of targetAddress
// //       },
// //     });
// //     expect(aptos.transaction.sign).toHaveBeenCalled();
// //     expect(aptos.transaction.submit.simple).toHaveBeenCalled();
    
// //     // Check if the function returns the transaction hash
// //     expect(transactionHash).toBe("mockTransactionHash");
// //   });
// // });

// describe('freeze function', () => {
//   it('should freeze the specified account and return the transaction hash', async () => {
//     // Mock admin and targetAddress
//     const privateKeyOwner = new Ed25519PrivateKey("0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a");
//     const privateKeyBob = new Ed25519PrivateKey("0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e");
//     const admin = Account.fromPrivateKey({ privateKey: privateKeyOwner });
//     const targetAddress = Account.fromPrivateKey({ privateKey: privateKeyBob });

//     // Call the freeze function
//     const transactionHash = await freeze(admin, targetAddress.accountAddress);

//     // Check if the functions were called with the correct arguments
//     expect(aptos.transaction.build.simple).toHaveBeenCalledWith({
//       sender: admin.accountAddress,
//       data: {
//         function: `${admin.accountAddress}::fa_coin::freeze_account`,
//         functionArguments: [{ accountAddress: targetAddress.accountAddress }],
//       },
//     });
    
    
//     expect(aptos.transaction.sign).toHaveBeenCalled();
//     expect(aptos.transaction.submit.simple).toHaveBeenCalled();

//     // Check if the function returns the transaction hash
//     expect(transactionHash).toBe("mockTransactionHash");
//   });
// });


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

// // Import the freeze function from your file containing the function
// import { freeze } from '../kcash_fungible_asset'; 

// // Mock Aptos SDK functions
// const aptos: Aptos = {
//   transaction: {
//     build: {
//       simple: jest.fn().mockResolvedValue({}), // Mock the transaction build function
//     },
//     sign: jest.fn().mockResolvedValue({}), // Mock the transaction sign function
//     submit: {
//       simple: jest.fn().mockResolvedValue({ hash: "mockTransactionHash" }), // Mock the transaction submit function
//     },
//   },
// };

// describe('freeze function', () => {
//   it('should freeze the specified account and return the transaction hash', async () => {
//     // Mock admin and targetAddress
//     const privateKeyOwner = new Ed25519PrivateKey("0xfa5a4197c79ba2ff77e12a70047469effd01cd2a6affdfb9cff6cb2147801f4a");
//     const privateKeyBob = new Ed25519PrivateKey("0xd83ca564b977295831915b57bf67a19b03811d40dabbd03010440f8e383a419e");
//     const admin = Account.fromPrivateKey({ privateKey: privateKeyOwner });
//     const targetAddress = Account.fromPrivateKey({ privateKey: privateKeyBob });

//     // Call the freeze function
//     const transactionHash = await freeze(admin, targetAddress.accountAddress, aptos);

//     // Check if the functions were called with the correct arguments
//     expect(aptos.transaction.build.simple).toHaveBeenCalledWith({
//       sender: admin.accountAddress,
//       data: {
//         function: `${admin.accountAddress}::fa_coin::freeze_account`,
//         functionArguments: [{ accountAddress: targetAddress.accountAddress }],
//       },
//     });
//     expect(aptos.transaction.sign).toHaveBeenCalled();
//     expect(aptos.transaction.submit.simple).toHaveBeenCalled();

//     // Check if the function returns the transaction hash
//     expect(transactionHash).toBe("mockTransactionHash");
//   });
// });
