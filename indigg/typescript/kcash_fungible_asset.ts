/* eslint-disable no-console */
/* eslint-disable max-len */

import {
  Serializable,
  Serializer,
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  InputViewFunctionData,
  Network,
  NetworkToNetworkName,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  Ed25519Signature,
  Ed25519Account,
  // Uint64,
} from "@aptos-labs/ts-sdk";

import { compilePackage, getPackageBytesToPublish } from "./utils";
import fs from "fs";
import sha256 from "fast-sha256";

// Setup the client
const APTOS_NETWORK: Network = NetworkToNetworkName[Network.DEVNET];
console.log("APTOS_NETWORK3000", APTOS_NETWORK);

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const module_path = "move/facoin"; // Path to the package which has the module
const output_file_path = "move/facoin/facoin.json"; // Path to JSON file
const address_name = "FACoin"; // Address name from move.toml
const decimal_kcash = 1;
console.log("🚀 ~ decimal_kcash:", decimal_kcash);

class Uint64 extends Serializable {
  constructor(public value: bigint) {
    super();
  }

  serialize(serializer: Serializer): void {
    serializer.serializeU64(this.value);
  }
}

// Define the MoveStruct class that implements the Serializable interface
class MessageMoveStruct extends Serializable {
  constructor(
    public from: AccountAddress, // where AccountAddress extends Serializable
    public to: AccountAddress, // where AccountAddress extends Serializable
    public deductionFromSender: Uint64[],
    public additionToRecipient: Uint64[],
    public method: string,
    public nonce: Uint64
  ) {
    super();
  }

  serialize(serializer: Serializer): void {
    serializer.serialize(this.from); // Composable serialization of another Serializable object
    serializer.serialize(this.to);

    serializer.serializeU32AsUleb128(deductionFromSender.length);
    for (const uint64 of this.deductionFromSender) {
      serializer.serialize(uint64);
    }

    serializer.serializeU32AsUleb128(additionToRecipient.length);
    for (const uint64 of this.additionToRecipient) {
      serializer.serialize(uint64);
    }

    serializer.serializeStr(this.method);
    serializer.serialize(this.nonce);
  }
}

const deductionFromSender = [
  new Uint64(BigInt(10)),
  new Uint64(BigInt(20)),
  new Uint64(BigInt(30)),
];

const additionToRecipient = [
  new Uint64(BigInt(10)),
  new Uint64(BigInt(20)),
  new Uint64(BigInt(30)),
];

export async function createStructForAdminTransferSig(
  admin: AccountAddress,
  to: AccountAddress,
  deductionFromSender: Uint64[],
  additionToRecipient: Uint64[],
  method: String,
  nonce: Uint64
) {
  const adminStructForSign = new MessageMoveStruct(
    admin,
    to,
    deductionFromSender,
    additionToRecipient,
    method.toString(),
    nonce
  );
  return adminStructForSign;
}


class MessageMoveStructBulk extends Serializable {
  constructor(
    public from: AccountAddress, // where AccountAddress extends Serializable
    public to: AccountAddress[],
    public deductnFromSender1: Uint64[],
    public deductnFromSender2: Uint64[],
    public deductnFromSender3: Uint64[],
    public additnToRecipient1: Uint64[],
    public additnToRecipient2: Uint64[],
    public additnToRecipient3: Uint64[],
    public method: string,
    public nonce: Uint64
  ) {
    super();
  }

  serialize(serializer: Serializer): void {
    serializer.serialize(this.from); // Composable serialization of another Serializable object
    serializer.serializeU32AsUleb128(this.to.length);
    for (const address of this.to) {
      serializer.serialize(address);
    }
    serializer.serializeU32AsUleb128(deductnFromSender1.length);
    for (const uint64 of this.deductnFromSender1) {
      serializer.serialize(uint64);
    }
    serializer.serializeU32AsUleb128(deductnFromSender2.length);
    for (const uint64 of this.deductnFromSender2) {
      serializer.serialize(uint64);
    }
    serializer.serializeU32AsUleb128(deductnFromSender3.length);
    for (const uint64 of this.deductnFromSender3) {
      serializer.serialize(uint64);
    }
    serializer.serializeU32AsUleb128(additnToRecipient1.length);
    for (const uint64 of this.additnToRecipient1) {
      serializer.serialize(uint64);
    }
    serializer.serializeU32AsUleb128(additnToRecipient2.length);
    for (const uint64 of this.additnToRecipient2) {
      serializer.serialize(uint64);
    }
    serializer.serializeU32AsUleb128(additnToRecipient3.length);
    for (const uint64 of this.additnToRecipient3) {
      serializer.serialize(uint64);
    }
    serializer.serializeStr(this.method);
    serializer.serialize(this.nonce);
  }
}

const deductnFromSender1 = [
  new Uint64(BigInt(10)),
  new Uint64(BigInt(20)),
  new Uint64(BigInt(30)),
];
const deductnFromSender2 = [
  new Uint64(BigInt(5)),
  new Uint64(BigInt(15)),
  new Uint64(BigInt(25)),
];
const deductnFromSender3 = [
  new Uint64(BigInt(100)),
  new Uint64(BigInt(200)),
  new Uint64(BigInt(300)),
];
const additnToRecipient1 = [
  new Uint64(BigInt(10)),
  new Uint64(BigInt(20)),
  new Uint64(BigInt(30)),
];
const additnToRecipient2 = [
  new Uint64(BigInt(5)),
  new Uint64(BigInt(15)),
  new Uint64(BigInt(25)),
];
const additnToRecipient3 = [
  new Uint64(BigInt(100)),
  new Uint64(BigInt(200)),
  new Uint64(BigInt(300)),
];

export async function createStructForAdminTransferSigBulk(
  admin: AccountAddress,
  to: AccountAddress[],
  deductnFromSender1: Uint64[],
  deductnFromSender2: Uint64[],
  deductnFromSender3: Uint64[],
  additnToRecipient1: Uint64[],
  additnToRecipient2: Uint64[],
  additnToRecipient3: Uint64[],
  method: String,
  nonce: Uint64
) {
  const adminStructForSignBulk = new MessageMoveStructBulk(
    admin,
    to,
    deductnFromSender1,
    deductnFromSender2,
    deductnFromSender3,
    additnToRecipient1,
    additnToRecipient2,
    additnToRecipient3,
    method.toString(),
    nonce
  );
  return adminStructForSignBulk;
}

// const owner_amount_to_mint = 1000*decimal_kcash;
// const amount_to_mint = 10000000000;
// const amount_to_withdraw = 65000000000;

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

// Message & Hash
const message = new Uint8Array(Buffer.from("KCash"));
const messageHash = sha256(message);
//const messageHash1 = sha256(msgBytes);

// Signature Method : Sign a message through PrivateKey
async function signMessage(
  privateKey: Ed25519PrivateKey,
  messageHash: Uint8Array
): Promise<Ed25519Signature> {
  const signature = await privateKey.sign(messageHash);
  return signature;
}

// Admin Transfer with Signature
export async function adminTransferWithSignature(
  admin: Account,
  toAddress: AccountAddress,
  deductionFromSender: AnyNumber[],
  additionToRecipient: AnyNumber[],
  signature: Ed25519Signature,
  method: string,
  nonce: AnyNumber

): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::admin_transfer_with_signature`,
      functionArguments: [
        toAddress,
        deductionFromSender,
        additionToRecipient,
        signature.toUint8Array(),
        method,
        nonce
      ],
    },
  });
  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

// Admin can transfer to any account's multiple user's reward field
export async function adminTransferWithSignatureBulk(
  admin: Account,
  to: AccountAddress[],
  deductnFromSender1: AnyNumber[],
  deductnFromSender2: AnyNumber[],
  deductnFromSender3: AnyNumber[],
  additnToRecipient1: AnyNumber[],
  additnToRecipient2: AnyNumber[],
  additnToRecipient3: AnyNumber[],
  signature: Ed25519Signature,
  method: string,
  nonce: AnyNumber
) {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::admin_transfer_with_signature_bulk`,
      functionArguments: [
        to,
        deductnFromSender1,
        deductnFromSender2,
        deductnFromSender3,
        additnToRecipient1,
        additnToRecipient2,
        additnToRecipient3,
        signature.toUint8Array(),
        method,
        nonce
      ],
    },
  });
  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });

  return pendingTxn.hash;
}

/** Admin forcefully transfers the newly created coin to the specified receiver address */
export async function transferCoin(
  admin: Account,
  fromAddress: AccountAddress,
  toAddress: AccountAddress,
  amount: AnyNumber
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::transfer`,
      functionArguments: [fromAddress, toAddress, amount],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

// Transfer Methods : Admin transfer from his bucket to any user
export async function transferReward3ToReward1ByAdminOnlyInBulk(
  admin: Account,
  user: AccountAddress[],
  amount: AnyNumber[]
) {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::admin_transfer_reward3_to_user_bucket1_bulk`,
      functionArguments: [user, amount],
    },
  });
  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  return pendingTxn.hash;
}
export async function transferReward3ToReward1ByAdminOnly(
  admin: Account,
  user: AccountAddress,
  amount: AnyNumber
) {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::admin_transfer_reward3_to_user_bucket1`,
      functionArguments: [user, amount],
    },
  });
  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });
  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  return pendingTxn.hash;
}

// User transfer the funds
export async function nativeTransfer(
  sender: Account,
  metadata: AccountAddress,
  receiver: AccountAddress,
  amount: AnyNumber
) {
  try {
    let tx = await aptos.transferFungibleAsset({
      sender: sender,
      fungibleAssetMetadataAddress: metadata,
      recipient: receiver,
      amount: amount,
    });

    const senderAuthenticator = await aptos.transaction.sign({
      signer: sender,
      transaction: tx,
    });

    const transferTx = await aptos.transaction.submit.simple({
      transaction: tx,
      senderAuthenticator,
    });
    await aptos.waitForTransaction({
      transactionHash: transferTx.hash,
    });
    console.log("🚀 ~ transferTx:", transferTx.hash);

    return transferTx.hash;
  } catch (error) {
    // console.log("🚀 ~ error:", error);
    return false;
  }
}

/** Admin mint the newly created coin to the specified receiver address */
export async function mintCoin(
  admin: Account,
  receiver: Account,
  amount: AnyNumber,
  reward1: AnyNumber,
  reward2: AnyNumber,
  reward3: AnyNumber
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::mint`,
      functionArguments: [
        receiver.accountAddress,
        amount,
        reward1,
        reward2,
        reward3,
      ],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

/** Admin mint the newly created coin to the bulk of the specified receiver address */
export async function bulkMintCoin(
  admin: Account,
  receiver: AccountAddress[],
  amount: AnyNumber[],
  reward1: AnyNumber[],
  reward2: AnyNumber[],
  reward3: AnyNumber[]
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::bulk_mint`,
      functionArguments: [receiver, amount, reward1, reward2, reward3],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

export async function burnCoin(
  admin: Account,
  fromAddress: AccountAddress,
  amount: AnyNumber
): Promise<string> {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${admin.accountAddress}::fa_coin::burn`,
        functionArguments: [fromAddress, amount],
      },
    });

    const senderAuthenticator = await aptos.transaction.sign({
      signer: admin,
      transaction,
    });
    const pendingTxn = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });
    return pendingTxn.hash;
  } catch (error) {
    console.log("Error while burning coins:", error);
    throw error; // Rethrow the error to handle it at the caller's level if needed
  }
}

/** Admin freezes the primary fungible store of the specified account */

export async function freeze(
  admin: Account,
  targetAddress: AccountAddress
): Promise<string> {
  try {
    // console.log("Request received to freeze account:", targetAddress);
    const transaction = await aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${admin.accountAddress}::fa_coin::freeze_account`,
        functionArguments: [targetAddress],
      },
    });

    // console.log("Transaction built for freezing account:", transaction);

    const senderAuthenticator = await aptos.transaction.sign({
      signer: admin,
      transaction,
    });
    // console.log("Transaction signed successfully.");

    const pendingTxn = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });
    // console.log("Transaction submitted successfully.");
    return pendingTxn.hash;
  } catch (error) {
    console.error("Error occurred while freezing account:", error);
    throw error; // Re-throw the error for handling in the caller function
  }
}

/** Admin unfreezes the primary fungible store of the specified account */

export async function unfreeze(
  admin: Account,
  targetAddress: AccountAddress
): Promise<string> {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${admin.accountAddress}::fa_coin::unfreeze_account`,
      functionArguments: [targetAddress],
    },
  });

  const senderAuthenticator = await aptos.transaction.sign({
    signer: admin,
    transaction,
  });
  const pendingTxn = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  return pendingTxn.hash;
}

export const getFaBalance = async (
  owner: Account,
  assetType: string
): Promise<number> => {
  // console.log(`Request for balance of asset type ${owner} for owner ${assetType} received.`);

  try {
    const data = await aptos.getCurrentFungibleAssetBalances({
      options: {
        where: {
          owner_address: { _eq: owner.accountAddress.toStringLong() },
          asset_type: { _eq: assetType },
        },
      },
    });

    console.log(`Successfully retrieved balance data:`, data);
    return data[0]?.amount ?? 0;
  } catch (error) {
    // console.log(`Error while retrieving balance data:`, error);
    return 0;
  }
};

/** Return the address of the managed fungible asset that's created when this module is deployed */
export const getIs_freez = async (
  owner: Account,
  assetType: string
): Promise<boolean> => {
  // console.log(`Request for balance of asset type ${owner} for owner ${assetType} received.`);

  try {
    const data = await aptos.getCurrentFungibleAssetBalances({
      options: {
        where: {
          owner_address: { _eq: owner.accountAddress.toStringLong() },
          asset_type: { _eq: assetType },
        },
      },
    });

    console.log("data ---", data);

    // console.log(`Successfully retrieved balance data:`, data);

    return data[0]?.is_frozen ?? false;
  } catch (error) {
    // console.log(`Error while retrieving balance data:`, error);
    return false;
  }
};

export async function getMetadata(admin: Account) {
  // console.log(`Request for metadata for admin account ${admin} received.`);

  const payload: InputViewFunctionData = {
    function: `${admin.accountAddress}::fa_coin::get_metadata`,
    functionArguments: [],
  };
  const res = (await aptos.view<[{ inner: Account }]>({ payload }))[0];
  console.log("🚀 ~ getMetadata ~ res:", res);
  return res.inner;
}

async function hasBucket(admin: AccountAddress) {
  const payload: InputViewFunctionData = {
    function: `${owner.accountAddress}::fa_coin::has_bucket_store`, //
    functionArguments: [admin],
  };
  const res = (await aptos.view({ payload }))[0];
  console.log("🚀 ~ hasBucket ~ res:", res);
  return res;
}

export async function getBucketStore(admin: Account) {
  const payload: InputViewFunctionData = {
    function: `${owner.accountAddress}::fa_coin::get_bucket_store`,
    functionArguments: [admin.accountAddress],
  };
  const res = await aptos.view({ payload });

  return res.map((num) => parseInt(num.toString()) / decimal_kcash);
}

export async function compileAndDeploy() {
  console.log("*** Compiling KCash package ***");
  compilePackage(module_path, output_file_path, [
    { name: address_name, address: owner.accountAddress },
  ]);

  const { metadataBytes, byteCode } =
    getPackageBytesToPublish(output_file_path);

  console.log("\n *** Publishing KCash package ***");
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
  console.log(`Transaction hash: ${response.hash}`);
  return response.hash;
}

async function main() {
  // await aptos.fundAccount({
  //   accountAddress: owner.accountAddress,
  //   amount: 100000000,
  // });
  console.log("🚀 ~ messageHash1:", messageHash.toString());

  console.log("\n=== Addresses ===");
  console.log(`Owner: ${owner.accountAddress.toString()}`);
  console.log(`User1: ${user1.accountAddress.toString()}`);
  console.log(`User2: ${user2.accountAddress.toString()}`);

  let deployedTx = await compileAndDeploy();
  console.log("🚀 ~ main ~ deployedTx:", deployedTx);

  const metadata = await getMetadata(owner);
  let metadataAddress = metadata.toString();
  console.log("metadata address:", metadataAddress);

  console.log(
    "\n All the balances in this exmaple refer to balance in primary fungible stores of each account."
  );
  console.log(
    `Owner's initial KCash balance: ${await getFaBalance(
      owner,
      metadataAddress
    )}.`
  );
  console.log(
    `User1's initial balance: ${await getFaBalance(user1, metadataAddress)}.`
  );
  console.log(
    `User2's initial balance: ${await getFaBalance(user2, metadataAddress)}.`
  );

  console.log("\nOwner mints 1000 kcash in self account");

  let owner_mint = 1000 * decimal_kcash;
  let mTx = await mintCoin(
    owner,
    owner,
    owner_mint,
    owner_mint * 0.1,
    owner_mint * 0.2,
    owner_mint * 0.7
  );

  await aptos.waitForTransaction({ transactionHash: mTx });
  console.log("🚀 ~ mTx:", mTx);

  console.log(
    `Owner's KCash balance after mint: ${await getFaBalance(
      owner,
      metadataAddress
    )}.`
  );
  console.log("Owner bucket store :", await getBucketStore(owner));

  console.log("\n Mint in Bulk for user1 and user2****");

  let amount_to_mint_user1 = 100 * decimal_kcash;
  let amount_to_mint_user2 = amount_to_mint_user1 / 2;

  let amount_ar = [amount_to_mint_user1, amount_to_mint_user2];
  let receiver_ar = [user1.accountAddress, user2.accountAddress];
  let r1_ar = [amount_to_mint_user1 * 0.5, amount_to_mint_user2 * 0.5];
  let r2_ar = [amount_to_mint_user1 * 0.3, amount_to_mint_user2 * 0.3];
  let r3_ar = [amount_to_mint_user1 * 0.2, amount_to_mint_user2 * 0.2];

  let bulkMintTx = await bulkMintCoin(
    owner,
    receiver_ar,
    amount_ar,
    r1_ar,
    r2_ar,
    r3_ar
  );
  await aptos.waitForTransaction({ transactionHash: bulkMintTx });
  console.log("🚀 ~ main ~ bulkMintTx:", bulkMintTx);

  console.log(
    `\nUser1's kcash balance after mint: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );
  console.log("User1 bucket store :", await getBucketStore(user1));

  console.log(
    `\nUser2's kcash balance after mint: ${await getFaBalance(
      user2,
      metadataAddress
    )}.`
  );
  console.log("User2 bucket store :", await getBucketStore(user2));

  console.log(
    "\n Owner transfers from 10 kcash from his bucket3 to user2's bucket1"
  );
  let rewTx = await transferReward3ToReward1ByAdminOnly(
    owner,
    user2.accountAddress,
    10 * decimal_kcash
  );
  console.log("🚀 ~ rewTx:", rewTx);

  console.log(
    `\Owner's final kcash balance after transfer: ${await getFaBalance(
      owner,
      metadataAddress
    )}.`
  );
  console.log(
    "Owner bucket store after transfer :",
    await getBucketStore(owner)
  );

  console.log(
    `\nUser2's final kcash balance after transfer: ${await getFaBalance(
      user2,
      metadataAddress
    )}.`
  );
  console.log(
    "User2 bucket store after transfer :",
    await getBucketStore(user2)
  );

  console.log(
    "\nNow Owner will transfer in bulk from his bucket3 to bucket1 of users"
  );
  console.log("10 kcash will be ransferred in user1 account");
  console.log("20 kcash will be ransferred in user2 account");
  amount_ar = [10 * decimal_kcash, 20 * decimal_kcash];

  let bTtx = await transferReward3ToReward1ByAdminOnlyInBulk(
    owner,
    receiver_ar,
    amount_ar
  );
  console.log("🚀 ~ bTtx:", bTtx);

  console.log(
    `\Owner's final kcash balance after transfer in bulk: ${await getFaBalance(
      owner,
      metadataAddress
    )}.`
  );
  console.log(
    "Owner bucket store after transfer in bulk :",
    await getBucketStore(owner)
  );

  console.log(
    `\nUser1's final kcash balance after transfer in bulk: ${await getFaBalance(
      user1,
      metadataAddress
    )}.`
  );
  console.log(
    "User1 bucket store after transfer in bulk :",
    await getBucketStore(user1)
  );

  console.log(
    `\nUser2's final kcash balance after transfer in bulk: ${await getFaBalance(
      user2,
      metadataAddress
    )}.`
  );
  console.log(
    "User2 bucket store after transfer in bulk :",
    await getBucketStore(user2)
  );

  // console.log("Owner mints Owner 1000000000 coins.");
  // const mintCoinTransactionHash = await mintCoin(
  //   owner,
  //   user1,
  //   amount_to_mint_user1,
  //   amount_to_mint_user1 * 0.5,
  //   amount_to_mint_user1 * 0.2,
  //   amount_to_mint_user1 * 0.3
  // );

  // await aptos.waitForTransaction({ transactionHash: mintCoinTransactionHash });
  // console.log("🚀 ~ main ~ mint trx hash:", mintCoinTransactionHash);

  // console.log(
  //   `User1's updated KCash primary fungible store balance: ${await getFaBalance(
  //     user1,
  //     metadataAddress
  //   )}.`
  // );

  let bs = await getBucketStore(user1);
  console.log("🚀 ~ main ~ bs:", bs);

  // // TO Transfer coin
  // let transferTx = await transferCoin(
  //   owner,
  //   user1.accountAddress,
  //   user2.accountAddress,
  //   650000000
  // );
  // await aptos.waitForTransaction({ transactionHash: transferTx });
  // console.log("🚀 ~ main ~ transferTx:", transferTx);

  console.log("Now user2 bucket balance is");
  console.log("🚀 ~ main ~ user1 bucket :", await getBucketStore(user1));
  console.log("🚀 ~ main ~ user2 bucket :", await getBucketStore(user2));
  console.log(
    `User2's final balance: ${await getFaBalance(user2, metadataAddress)}.`
  );

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // console.log(
  //   "--------Now try to transfer the funds using native transfer method-------------"
  // );
  // console.log("Transfer amount: ", 100000000000000);

  // let ntx = await nativeTransfer(
  //   user1,
  //   metadata,
  //   user2.accountAddress,
  //   100000000000000
  // );

  // console.log("Native tx hash: ", ntx);

  // console.log(
  //   `User1's updated KCash balance After native transfer: ${await getFaBalance(
  //     user1,
  //     metadataAddress
  //   )}.`
  // );

  // console.log("Owner freezes User1's account.");
  // const freezeTransactionHash = await freeze(owner, user1.accountAddress);
  // await aptos.waitForTransaction({ transactionHash: freezeTransactionHash });
  // console.log("🚀 ~ main ~ freezed Transaction Hash:", freezeTransactionHash);

  // console.log("Check if we can transfer funds after freezing the account");

  // let ntx2 = await nativeTransfer(
  //   user1,
  //   metadata,
  //   user2.accountAddress,
  //   100000000000000
  // );
  // console.log("🚀 ~ main ~ ntx2:", ntx2);
  // if (!ntx2) {
  //   console.log("Can not transfer the funds");

  //   console.log(
  //     "Now try to transfer 100000000000000 via our module transfer method"
  //   );
  //   let ctx = await transfer(
  //     owner,
  //     user1.accountAddress,
  //     user2.accountAddress,
  //     100000000000000
  //   );
  //   console.log("🚀 ~ main ~ ctx:", ctx);
  //   console.log(
  //     `User1's updated KCash balance After custom transfer: ${await getFaBalance(
  //       user1,
  //       metadataAddress
  //     )}.`
  //   );

  // Verifying Signature
  // const sigVerifyTransaction = signatureVerification(message, publicKeyOwner.toUint8Array(), signature, owner);
  // console.log("Signature transaction", sigVerifyTransaction);

  console.log("PublicKey Off-Chain: ", publicKeyOwner.toUint8Array());

  const moveStruct = new MessageMoveStruct(
    owner.accountAddress,
    user2.accountAddress,
    deductionFromSender,
    additionToRecipient,
    "admin_transfer_with_signature",
    new Uint64(BigInt(10))
  );

  // Object of Move Struct Bulk
  const moveStructBulk = new MessageMoveStructBulk(
    owner.accountAddress,
    [user2.accountAddress, owner.accountAddress, user1.accountAddress],
    deductnFromSender1,
    deductnFromSender2,
    deductnFromSender3,
    additnToRecipient1,
    additnToRecipient2,
    additnToRecipient3,
    "admin_transfer_with_signature_bulk",
    new Uint64(BigInt(20))
  );

  // Construct a MoveStruct
  const moveStructBytes = moveStruct.bcsToBytes();

  const moveStructBytesBulk = moveStructBulk.bcsToBytes();

  // const msgMoveByteBuffer = Buffer.from(moveStructBytes.toString());
  // const msgMoveStructBytehexString = "0x" + msgMoveByteBuffer.toString("hex");

  // console.log("🚀 ~ moveStructBytes:", msgMoveStructBytehexString);

  // Generating message hash
  // const messageMoveStructHash = "0xeaa9b8a41ee0fe9748bc20f9e3b1e09a245ac024a30d08b0d2cffddfe13035d4";
  // const buffer = Buffer.from(messageMoveStructHash.slice(2), 'hex');

  const messageMoveStructHash = sha256(moveStructBytes);

  const messageMoveStructBulkHash = sha256(moveStructBytesBulk);

  // console.log("🚀 ~ messageMoveStructHash:", messageMoveStructHash.toString());

  // Convert the hash array to a Buffer
  const msgMoveBuffer = Buffer.from(messageMoveStructHash.toString());

  // Convert the Buffer to a hexadecimal string
  const msgMoveStructhexString = "0x" + msgMoveBuffer.toString("hex");
  console.log("🚀 ~ hexString:", msgMoveStructhexString);

  // Signing a Message
  const signature = await signMessage(privateKeyOwner, messageMoveStructHash);

  const signatureBulk = await signMessage(
    privateKeyOwner,
    messageMoveStructBulkHash
  );

  console.log("=============================================");
  console.log("Signature: ", signature.toString());
  console.log("SignatureBulk: ", signatureBulk.toString());
  console.log("=============================================");

  // Admin Transfer with Signature
  let adminSignatureTx = await adminTransferWithSignature(
    owner,
    user2.accountAddress,
    [10, 20, 30],
    [10, 20, 30],
    signature,
    "admin_transfer_with_signature",
    10
  );
  console.log("🚀 ~ adminSignatureTx:", adminSignatureTx);

/*
  // =======
  let adminSignatureTxBulk = await adminTransferWithSignatureBulk(
    owner,
    [user2.accountAddress, owner.accountAddress, user1.accountAddress],
    [10, 20, 30],
    [5, 15, 25],
    [100, 200, 300],
    [10, 20, 30],
    [5, 15, 25],
    [100, 200, 300],
    signatureBulk,
    "admin_transfer_with_signature_bulk",
    20
  );
  console.log("adminSignatureTxBulk", adminSignatureTxBulk);
*/
  console.log("done.");
}

main();
