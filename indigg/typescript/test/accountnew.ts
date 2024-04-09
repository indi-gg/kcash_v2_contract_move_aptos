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
  NetworkToIndexerAPI
} from "@aptos-labs/ts-sdk";
describe("Account", () => {
  describe("fromPrivateKeyAndAddress", () => {
    it("derives the correct account from a legacy ed25519 private key", () => {
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
  describe("aptos config",()=>{
    it("it should set urls based on a local network",()=>{
        const settings: AptosSettings = {
            network: Network.LOCAL,
          };
          const aptosConfig = new AptosConfig(settings);
    expect(aptosConfig.network).toEqual("local");
    expect(aptosConfig.getRequestUrl(AptosApiType.FULLNODE)).toBe(NetworkToNodeAPI[Network.LOCAL]);
    expect(aptosConfig.getRequestUrl(AptosApiType.FAUCET)).toBe(NetworkToFaucetAPI[Network.LOCAL]);
    expect(aptosConfig.getRequestUrl(AptosApiType.INDEXER)).toBe(NetworkToIndexerAPI[Network.LOCAL]);
    });
    it("it should set urls based on a devnet network",()=>{
        const settings: AptosSettings = {
            network: Network.DEVNET,
          };
          const aptosConfig = new AptosConfig(settings);
    expect(aptosConfig.network).toEqual("devnet");
    expect(aptosConfig.getRequestUrl(AptosApiType.FULLNODE)).toBe(NetworkToNodeAPI[Network.DEVNET]);
    expect(aptosConfig.getRequestUrl(AptosApiType.FAUCET)).toBe(NetworkToFaucetAPI[Network.DEVNET]);
    expect(aptosConfig.getRequestUrl(AptosApiType.INDEXER)).toBe(NetworkToIndexerAPI[Network.DEVNET]);
    })

  })
});
