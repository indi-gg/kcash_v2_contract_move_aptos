import {
    Account,
    AccountAddress,
    Ed25519PrivateKey,
    Ed25519PublicKey,
    Secp256k1PrivateKey,
    Secp256k1PublicKey,
    SigningScheme as AuthenticationKeyScheme,
    SigningSchemeInput,
    AnyPublicKey,
    Ed25519Account,
    SingleKeyAccount,
  } from "../../src";
  
  import {
  //   ed25519,
  //   secp256k1TestObject,
  //   secp256k1WalletTestObject,
  //   singleSignerED25519,
    wallet,
  //   Ed25519WalletTestObject,
  } from "./helper";
  
  describe("Account", () => {
    describe("generate", () => {
      it("should create an instance of Account with a legacy ED25519 when nothing is specified", () => {
        // Account with Legacy Ed25519 scheme
        const edAccount = Account.generate();
        expect(edAccount).toBeInstanceOf(Ed25519Account);
        expect(edAccount.publicKey).toBeInstanceOf(Ed25519PublicKey);
        expect(edAccount.signingScheme).toEqual(AuthenticationKeyScheme.Ed25519);
      });
      it("should create an instance of Account with a Single Sender ED25519 when scheme and legacy specified", () => {
        // Account with SingleKey Ed25519 scheme
        const edAccount = Account.generate({ scheme: SigningSchemeInput.Ed25519, legacy: false });
        expect(edAccount).toBeInstanceOf(SingleKeyAccount);
        expect(edAccount.publicKey).toBeInstanceOf(AnyPublicKey);
        expect(edAccount.signingScheme).toEqual(AuthenticationKeyScheme.SingleKey);
      });
      it("should create an instance of Account when Secp256k1 scheme is specified", () => {
        // Account with SingleKey Secp256k1 scheme
        const secpAccount = Account.generate({ scheme: SigningSchemeInput.Secp256k1Ecdsa });
        expect(secpAccount).toBeInstanceOf(SingleKeyAccount);
        expect(secpAccount.publicKey).toBeInstanceOf(AnyPublicKey);
        expect(secpAccount.signingScheme).toEqual(AuthenticationKeyScheme.SingleKey);
      });
    });
  //   describe("fromPrivateKeyAndAddress", () => {
  //     it("derives the correct account from a legacy ed25519 private key", () => {
  //       const { privateKey: privateKeyBytes, publicKey, address } = ed25519;
  //       const privateKey = new Ed25519PrivateKey(privateKeyBytes);
  //       const accountAddress = AccountAddress.from(address);
  //       const newAccount = Account.fromPrivateKey({ privateKey, address: accountAddress, legacy: true });
  //       expect(newAccount).toBeInstanceOf(Ed25519Account);
  //       expect(newAccount.publicKey).toBeInstanceOf(Ed25519PublicKey);
  //       expect(newAccount.privateKey).toBeInstanceOf(Ed25519PrivateKey);
  //       expect(newAccount.privateKey.toString()).toEqual(privateKey.toString());
  //       expect(newAccount.publicKey.toString()).toEqual(new Ed25519PublicKey(publicKey).toString());
  //       expect(newAccount.accountAddress.toString()).toEqual(address);
  //     });
  
  //     it("derives the correct account from a single signer ed25519 private key", () => {
  //       const { privateKey: privateKeyBytes, publicKey, address } = singleSignerED25519;
  //       const privateKey = new Ed25519PrivateKey(privateKeyBytes);
  //       const accountAddress = AccountAddress.from(address);
  //       const newAccount = Account.fromPrivateKey({ privateKey, address: accountAddress, legacy: false });
  //       expect(newAccount).toBeInstanceOf(SingleKeyAccount);
  //       expect(newAccount.publicKey).toBeInstanceOf(AnyPublicKey);
  //       expect(newAccount.publicKey.publicKey).toBeInstanceOf(Ed25519PublicKey);
  //       expect(newAccount.privateKey).toBeInstanceOf(Ed25519PrivateKey);
  //       expect(newAccount.privateKey.toString()).toEqual(privateKey.toString());
  //       expect(newAccount.publicKey.publicKey.toString()).toEqual(publicKey);
  //       expect(newAccount.accountAddress.toString()).toEqual(address);
  //     });
  
  //     it("derives the correct account from a single signer secp256k1 private key", () => {
  //       const { privateKey: privateKeyBytes, publicKey, address } = secp256k1TestObject;
  //       const privateKey = new Secp256k1PrivateKey(privateKeyBytes);
  //       const accountAddress = AccountAddress.from(address);
  //       const newAccount = Account.fromPrivateKey({ privateKey, address: accountAddress });
  //       expect(newAccount).toBeInstanceOf(SingleKeyAccount);
  //       expect(newAccount.publicKey).toBeInstanceOf(AnyPublicKey);
  //       expect(newAccount.publicKey.publicKey).toBeInstanceOf(Secp256k1PublicKey);
  //       expect(newAccount.privateKey).toBeInstanceOf(Secp256k1PrivateKey);
  //       expect(newAccount.privateKey.toString()).toEqual(privateKey.toString());
  //       expect(newAccount.publicKey.publicKey.toString()).toEqual(publicKey);
  //       expect(newAccount.accountAddress.toString()).toEqual(address);
  //     });
  //   });
  
  //   describe("fromPrivateKey", () => {
  //     it("derives the correct account from a legacy ed25519 private key", () => {
  //       const { privateKey: privateKeyBytes, publicKey, address } = ed25519;
  //       const privateKey = new Ed25519PrivateKey(privateKeyBytes);
  //       const newAccount = Account.fromPrivateKey({ privateKey });
  //       expect(newAccount).toBeInstanceOf(Ed25519Account);
  //       expect(newAccount.publicKey).toBeInstanceOf(Ed25519PublicKey);
  //       expect(newAccount.privateKey).toBeInstanceOf(Ed25519PrivateKey);
  //       expect(newAccount.privateKey.toString()).toEqual(privateKey.toString());
  //       expect(newAccount.publicKey.toString()).toEqual(new Ed25519PublicKey(publicKey).toString());
  //       expect(newAccount.accountAddress.toString()).toEqual(address);
  //     });
  
      // it("derives the correct account from a single signer ed25519 private key", () => {
      //   const { privateKey: privateKeyBytes, publicKey, address } = singleSignerED25519;
      //   const privateKey = new Ed25519PrivateKey(privateKeyBytes);
      //   const newAccount = Account.fromPrivateKey({ privateKey, legacy: false });
      //   expect(newAccount).toBeInstanceOf(SingleKeyAccount);
      //   expect(newAccount.publicKey).toBeInstanceOf(AnyPublicKey);
      //   expect((newAccount.publicKey as AnyPublicKey).publicKey).toBeInstanceOf(Ed25519PublicKey);
      //   expect(newAccount.privateKey).toBeInstanceOf(Ed25519PrivateKey);
      //   expect(newAccount.privateKey.toString()).toEqual(privateKey.toString());
      //   expect(newAccount.publicKey.publicKey.toString()).toEqual(new Ed25519PublicKey(publicKey).toString());
      //   expect(newAccount.accountAddress.toString()).toEqual(address);
      // });
  
  //     it("derives the correct account from a single signer secp256k1 private key", () => {
  //       const { privateKey: privateKeyBytes, publicKey, address } = secp256k1TestObject;
  //       const privateKey = new Secp256k1PrivateKey(privateKeyBytes);
  //       const newAccount = Account.fromPrivateKey({ privateKey });
  //       expect(newAccount).toBeInstanceOf(SingleKeyAccount);
  //       expect(newAccount.publicKey).toBeInstanceOf(AnyPublicKey);
  //       expect((newAccount.publicKey as AnyPublicKey).publicKey).toBeInstanceOf(Secp256k1PublicKey);
  //       expect(newAccount.privateKey).toBeInstanceOf(Secp256k1PrivateKey);
  //       expect(newAccount.privateKey.toString()).toEqual(privateKey.toString());
  //       expect(newAccount.publicKey.publicKey.toString()).toEqual(new Secp256k1PublicKey(publicKey).toString());
  //       expect(newAccount.accountAddress.toString()).toEqual(address);
  //     });
    });
    describe("fromDerivationPath", () => {
      it("should create a new account from bip44 path and mnemonics with legacy Ed25519", async () => {
        const { mnemonic, address, path } = wallet;
        const newAccount = Account.fromDerivationPath({
          path,
          mnemonic,
          scheme: SigningSchemeInput.Ed25519,
        });
        expect(newAccount.accountAddress.toString()).toEqual(address);
      });
  
  
      // it("should create a new account from bip44 path and mnemonics with single signer Ed25519", async () => {
      //   const { mnemonic, address, path } = Ed25519WalletTestObject;
      //   const newAccount = Account.fromDerivationPath({
      //     path,
      //     mnemonic,
      //     scheme: SigningSchemeInput.Ed25519,
      //     legacy: false,
      //   });
      //   expect(newAccount.accountAddress.toString()).toEqual(address);
      // });
  
  
  
      // it("should create a new account from bip44 path and mnemonics with single signer secp256k1", () => {
      //   const { mnemonic, address, path } = secp256k1WalletTestObject;
      //   const newAccount = Account.fromDerivationPath({
      //     path,
      //     mnemonic,
      //     scheme: SigningSchemeInput.Secp256k1Ecdsa,
      //   });
      //   expect(newAccount.accountAddress.toString()).toEqual(address);
      // });
      
    });
  
  //   describe("sign and verify", () => {
  //     it("signs a message with single signer Secp256k1 scheme and verifies successfully", () => {
  //       const { privateKey: privateKeyBytes, address, signatureHex, messageEncoded } = secp256k1TestObject;
  //       const privateKey = new Secp256k1PrivateKey(privateKeyBytes);
  //       const accountAddress = AccountAddress.from(address);
  //       const secpAccount = Account.fromPrivateKey({ privateKey, address: accountAddress });
  //       const signature = secpAccount.sign(messageEncoded);
  //       expect(signature.signature.toString()).toEqual(signatureHex);
  //       expect(secpAccount.verifySignature({ message: messageEncoded, signature })).toBeTruthy();
  //     });
  
  //     it("signs a message with single signer ed25519 scheme and verifies successfully", () => {
  //       const { privateKey: privateKeyBytes, address, signatureHex, messageEncoded } = singleSignerED25519;
  //       const privateKey = new Ed25519PrivateKey(privateKeyBytes);
  //       const accountAddress = AccountAddress.from(address);
  //       const edAccount = Account.fromPrivateKey({ privateKey, address: accountAddress, legacy: false });
  //       const signature = edAccount.sign(messageEncoded);
  //       expect(signature.signature.toString()).toEqual(signatureHex);
  //       expect(edAccount.verifySignature({ message: messageEncoded, signature })).toBeTruthy();
  //     });
  
  //     it("derives the correct account from a legacy ed25519 private key", () => {
  //       const { privateKey: privateKeyBytes, address, signedMessage, message } = ed25519;
  //       const privateKey = new Ed25519PrivateKey(privateKeyBytes);
  //       const accountAddress = AccountAddress.from(address);
  //       const legacyEdAccount = Account.fromPrivateKey({ privateKey, address: accountAddress, legacy: true });
  //       const signature = legacyEdAccount.sign(message);
  //       expect(signature.toString()).toEqual(signedMessage);
  //       expect(legacyEdAccount.verifySignature({ message, signature })).toBeTruthy();
  //     });
  //   });
  
  //   it("should return the authentication key for a public key", () => {
  //     const { publicKey: publicKeyBytes, address } = ed25519;
  //     const publicKey = new Ed25519PublicKey(publicKeyBytes);
  //     const authKey = publicKey.authKey();
  //     expect(authKey.derivedAddress().toString()).toBe(address);
  //   });
  // });
  


  // import {
//     Account,
//     Ed25519PrivateKey,
//     AccountAddress,
//     AnyNumber,
//   } from "@aptos-labs/ts-sdk";
//   import {
//     transferCoin,
//     mintCoin,
//     burnCoin,
//     freeze,
//     unfreeze,
//     getFaBalance,
//   } from "../../indigg/typescript/kcash_fungible_asset"; // Update the path accordingly

//   describe("transferCoin function", () => {
//     it("should transfer coins successfully", async () => {
//       // Mock admin, sender, and receiver accounts
//       const privateKeyAdmin = new Ed25519PrivateKey("0xc0b7560f4648498369994339f457929754eb1b0da42a99d35eb75f6a6124df33");
//       const admin = Account.fromPrivateKey({ privateKey: privateKeyAdmin });

//       const privateKeySender = new Ed25519PrivateKey("0xab64477b0871e1fdaf15dc836aa26573e0632f9c2f1b3322241dcf69af20dd4c");
//       const sender = Account.fromPrivateKey({ privateKey: privateKeySender });
//       const senderAccountAddress = sender.accountAddress // Extracting the account address

//       const privateKeyReceiver = new Ed25519PrivateKey("0xfe4296f3d6a6d008fb3e9a1f4735f42bd6459454eff77dfe7706c5db96aa2aa8");
//       const receiver = Account.fromPrivateKey({ privateKey: privateKeyReceiver });
//       const receiverAccountAddress = receiver.accountAddress; // Extracting the account address
//       console.log('yaha tak');

//       // Transfer coins
//       const transactionHash = await transferCoin(admin,senderAccountAddress,receiverAccountAddress,100);
//   console.log('transactionHash',transactionHash);

//       // Assertions
//       expect(typeof transactionHash).toBe("string"); // Assuming transferCoin returns a transaction hash
//     });
//   });



// test("Transfer Coins", async () => {
  //   // Assuming Alice has some coins to transfer to Bob
  //   const initialBalanceAlice = await getFaBalance(alice, metadataAddress);
  //   const initialBalanceBob = await getFaBalance(bob, metadataAddress);

  //   const amountToTransfer = 100; // Adjust as necessary

  //   await transferCoin(alice, alice.accountAddress, bob.accountAddress, amountToTransfer);

  //   const finalBalanceAlice = await getFaBalance(alice, metadataAddress);
  //   const finalBalanceBob = await getFaBalance(bob, metadataAddress);

  //   expect(finalBalanceAlice).toBe(initialBalanceAlice - amountToTransfer);
  //   expect(finalBalanceBob).toBe(initialBalanceBob + amountToTransfer);
  // } ,5000);



 // test("Burn Coins", async () => {
  //   // Assuming Alice wants to burn some of her own coins
  //   const initialBalanceAlice = await getFaBalance(alice, metadataAddress);

  //   const amountToBurn = 50; // Adjust as necessary

  //   await burnCoin(alice, alice.accountAddress, amountToBurn);

  //   const finalBalanceAlice = await getFaBalance(alice, metadataAddress);

  //   expect(finalBalanceAlice).toBe(initialBalanceAlice - amountToBurn);
  // });

  // test("Freeze Account", async () => {
  //   // Assuming Alice wants to freeze Bob's account
  //   const initialBalanceBob = await getFaBalance(bob, metadataAddress);

  //   await freeze(alice, bob.accountAddress);

  //   // Attempt a transaction from Bob's account
  //   // Assert that the transaction fails or behaves as expected
  // });

  // test("Unfreeze Account", async () => {
  //   // Assuming Alice wants to unfreeze Bob's account
  //   const initialBalanceBob = await getFaBalance(bob, metadataAddress);

  //   await unfreeze(alice, bob.accountAddress);

  //   // Attempt a transaction from Bob's account
  //   // Assert that the transaction succeeds
  // });