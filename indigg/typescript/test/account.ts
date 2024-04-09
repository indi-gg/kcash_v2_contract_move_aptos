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

  describe("fetch data", () => {
    const FUND_AMOUNT = 100_000_000;
test("it fetches account data", async () => {
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
    const data = await aptos.getAccountInfo({
      accountAddress: "0xaa706bdb1dc3dbc324aab7556a7f18b7e141f5d9b42a006f2a32b7192300c281",
    });
    expect(data).toHaveProperty("sequence_number");
    expect(data.sequence_number).toBe("0");
    expect(data).toHaveProperty("authentication_key");
    expect(data.authentication_key).toBe("0x0000000000000000000000000000000000000000000000000000000000000001");
  });


  test("it fetches account modules", async () => {
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
    const data = await aptos.getAccountModules({
      accountAddress: "0x1",
    });
    expect(data.length).toBeGreaterThan(0);
  });


  test("it fetches an account module", async () => {
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
    const data = await aptos.getAccountModule({
      accountAddress: "0x1",
      moduleName: "coin",
    });
    expect(data).toHaveProperty("bytecode");
  });


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
      accountAddress: "0x1",
      resourceType: "0x1::account::Account",
    });
    expect(resource).toHaveProperty("sequence_number");
    expect(resource.sequence_number).toBe("0");
    expect(resource).toHaveProperty("authentication_key");
    expect(resource.authentication_key).toBe("0x0000000000000000000000000000000000000000000000000000000000000001");
  });


  test("it fetches account transactions", async () => {
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
    const senderAccount = Account.generate();
    await aptos.fundAccount({
      accountAddress: senderAccount.accountAddress,
      amount: FUND_AMOUNT,
    });
    const bob = Account.generate();
    const rawTxn = await aptos.transaction.build.simple({
      sender: senderAccount.accountAddress,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [bob.accountAddress],
      },
    });
    const authenticator = aptos.transaction.sign({
      signer: senderAccount,
      transaction: rawTxn,
    });
    const response = await aptos.transaction.submit.simple({
      transaction: rawTxn,
      senderAuthenticator: authenticator,
    });
    const txn = await aptos.waitForTransaction({ transactionHash: response.hash });
    const accountTransactions = await aptos.getAccountTransactions({
      accountAddress: senderAccount.accountAddress,
    });
    expect(accountTransactions[0]).toStrictEqual(txn);
  });
   

  test("it fetches account coins data", async () => {
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
    const senderAccount = Account.generate();
    const fundTxn = await aptos.fundAccount({
      accountAddress: senderAccount.accountAddress,
      amount: FUND_AMOUNT,
    });

    await aptos.waitForTransaction({ transactionHash: fundTxn.hash });
    const accountCoinData = await aptos.getAccountCoinsData({
      accountAddress: senderAccount.accountAddress,
    });
    expect(accountCoinData[0].amount).toBe(FUND_AMOUNT);
    expect(accountCoinData[0].asset_type).toBe("0x1::aptos_coin::AptosCoin");
  });

});


