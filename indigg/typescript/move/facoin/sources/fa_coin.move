/// A 2-in-1 module that combines managed_fungible_asset and coin_example into one module that when deployed, the
/// deployer will be creating a new managed fungible asset with the hardcoded supply config, name, symbol, and decimals.
/// The address of the asset can be obtained via get_metadata(). As a simple version, it only deals with primary stores.
module FACoin::fa_coin {
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata, FungibleAsset};
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::event;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_std::string_utils::{to_string};
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::string::utf8;
    use std::option;
    use std::vector;
    use aptos_std::ed25519;
    use aptos_std::hash;

    /// Only fungible asset metadata owner can make changes.
    const ENOT_OWNER: u64 = 1;
    const EUSER_DO_NOT_HAVE_BUCKET_STORE: u64 = 2;
    const EAMOUNT_SHOULD_BE_EQUAL_TO_ASSETS: u64 = 3;
    const EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS: u64 = 4;
    const EUSER_ALREADY_HAS_BUCKET_STORE: u64 = 5;
    const EINVALID_ARGUMENTS_LENGTH: u64 = 6;

    const ASSET_SYMBOL: vector<u8> = b"FA";
    const BUCKET_CORE_SEED: vector<u8> = b"BA";
    const BUCKET_COLLECTION_DESCRIPTION: vector<u8> = b"Bucket collections";
    const BUCKET_COLLECTION_NAME: vector<u8> = b"Bucket store";

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Hold refs to control the minting, transfer and burning of fungible assets.
    struct ManagedFungibleAsset has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
    }

    // We need a contract signer as the creator of the bucket core and bucket stores
    // Otherwise we need admin to sign whenever a new bucket store is created which is inconvenient
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct BucketCore has key {
        // This is the extend_ref of the bucket core object, not the extend_ref of bucket store object
        // bucket core object is the creator of bucket store object
        // but owner of each bucket store(i.e. user)
        // bucket_extended_ref
        bucket_ext_ref: ExtendRef,
    }
    
    // This is a bucketstore to hold the assets in different fields for every users
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct BucketStore has key{
        reward1: u64,
        reward2: u64,
        reward3: u64,
    }

    #[event]
    /// Emitted when bucket rewards are deposited into a store.
    struct DepositToBucket has drop, store {
        receiver: address,
        reward1: u64,
        reward2: u64,
        reward3: u64,
    }
    #[event]
    /// Emitted when bucket rewards are withdrawn from a store.
    struct WithdrawFromBucket has drop, store {
        owner: address,
        amount: u64,
    }
    #[event]
    /// Emitted when bucket rewards are transfered between a stores.
    struct TransferBetweenBuckets has drop, store {
        sender: address,
        receiver: address,
        transfered_amount: u64,
    }

    #[event]
    struct SignVerify has drop, store{
        message: vector<u8>,
        signatureEd: ed25519::Signature,
        result: bool,
        messageHash: vector<u8>

    }

    // verify signature
    public entry fun signatureVerification(message: vector<u8>, public_key: vector<u8>, signature: vector<u8>){
        
        let messageHash = hash::sha2_256(message);
        
        let unValidatedPublickkey = ed25519:: new_unvalidated_public_key_from_bytes(public_key);

        let signatureEd = ed25519::new_signature_from_bytes(signature);

        let result = ed25519::signature_verify_strict(&signatureEd, &unValidatedPublickkey, messageHash);

        event::emit<SignVerify>(SignVerify{message:messageHash, signatureEd, result, messageHash});

    }


    // to check if the address is of admin
    fun is_owner(owner: address) : bool{
        if (&owner == &@FACoin) true else false
    }

    /// Initialize metadata object and store the refs.
    // :!:>initialize
    fun init_module(admin: &signer) {
        // Init the bucket core
        // We are creating a separate object for the bucket core collection, which helps in stores and creating multiple bucket stores
        // What happens in Aptos is, we can only stores the structs or values in a object only once at the time of initialization
        // Later we can only update the storage like adding or subtracting the FAs,
        // But in our case we need an object where we can stores multiple multiple bucket stores, later also at the time of mint for every user
        // For this purpose we uses this extendref, and crated a separate object for it
        let bucket_constructor_ref = &object::create_named_object(admin, BUCKET_CORE_SEED);

        // use later this extendref to implement new bucketstores
        let bucket_ext_ref = object::generate_extend_ref(bucket_constructor_ref);
        let bucket_signer = object::generate_signer(bucket_constructor_ref);
        // we need a signer to stores the bucket store globally,
        move_to(&bucket_signer, BucketCore{
            bucket_ext_ref,
        });

        // Create the collection that will hold all the Bucket stores
        create_bucket_store_collection(&bucket_signer);

        /*
         Here we're initializing the metadata for kcash fungible asset,
        */
        let constructor_ref = &object::create_named_object(admin, ASSET_SYMBOL);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            utf8(b"KCash"), /* name */
            utf8(ASSET_SYMBOL), /* symbol */
            0, /* decimals */ 
            utf8(b"http://example.com/favicon.ico"), /* icon */
            utf8(b"http://example.com"), /* project */
        );

        // Create mint/burn/transfer refs to allow creator to manage the fungible asset.
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);
        let metadata_object_signer = object::generate_signer(constructor_ref);
        move_to(
            &metadata_object_signer,
            ManagedFungibleAsset { mint_ref, transfer_ref, burn_ref }
        )// <:!:initialize
    }

    // Create the collection that will hold all the BucketStores
    fun create_bucket_store_collection(creator: &signer) {
        // Metadata for the other object which holds bucket stores
        let description = utf8(BUCKET_COLLECTION_DESCRIPTION);
        let name = utf8(BUCKET_COLLECTION_NAME);
        let uri = utf8(b"http://example.com");

        collection::create_unlimited_collection(
            creator,
            description,
            name,
            option::none(),
            uri,
        );
    }

    // To create a bucket store for the user if it doesnot exist
    fun create_bucket_store(user: address) acquires BucketCore {
        // Collection and token metadata should be same
        let description = utf8(BUCKET_COLLECTION_DESCRIPTION);
        let name = utf8(BUCKET_COLLECTION_NAME);
        let uri = utf8(b"http://example.com");
        assert!(!has_bucket_store(user), error::already_exists(EUSER_ALREADY_HAS_BUCKET_STORE));

        // Here creating a token (just like PDAs in solana)
        // Here we generate a token using user's address and signed the bucketstores
        // then taransfer it to the user
        let constructor_ref = token::create_named_token(
            &get_bucket_signer(get_bucket_signer_address()),
            name,
            description,
            get_bucket_user_name(&user),
            option::none(),
            uri,
        );

        let token_signer = object::generate_signer(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);

        let new_bs = BucketStore{
            reward1: 0,
            reward2: 0,
            reward3: 0,
        };
        move_to(&token_signer, new_bs);
        // Transferring the ref to the user
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), user);
    }

    // To get signer address e.g. module is a signer now for the bucket core
    fun get_bucket_signer_address(): address {
        object::create_object_address(&@FACoin, BUCKET_CORE_SEED)
    }

    // To get signer sign e.g. module is a signer now for the bucket core
    fun get_bucket_signer(bucket_signer_address: address): signer acquires BucketCore {
        object::generate_signer_for_extending(&borrow_global<BucketCore>(bucket_signer_address).bucket_ext_ref)
    }

    // To create a unique user name for the bucket store address
    fun get_bucket_user_name(owner_addr: &address): String {
        let token_name = string::utf8(b"kcash");
        string::append(&mut token_name, to_string(owner_addr));

        token_name
    }

    /// It insures that user has a bucket store, create a new store if it doesn't eist
    fun ensure_bucket_store_exist(user: address) acquires BucketCore{
        if(!has_bucket_store(user)){
            create_bucket_store(user);
        }
    }

    // Get user adress assosiate with bucketstoer
    fun get_bucket_user_address(creator_addr: &address): (address) {
        let bucket_address = token::create_token_address(
            &get_bucket_signer_address(),
            &utf8(BUCKET_COLLECTION_NAME),
            &get_bucket_user_name(creator_addr),
        );
        bucket_address
    }

    #[view]
    public fun has_bucket_store(owner_addr: address): (bool) {
        let token_address = get_bucket_user_address(&owner_addr);
        exists<BucketStore>(token_address)
    }

    #[view]
    public fun get_bucket_store(owner_addr: address): (u64, u64, u64) acquires BucketStore {
        if(has_bucket_store(owner_addr)){
            let token_address = get_bucket_user_address(&owner_addr);
            let bs = borrow_global<BucketStore>(token_address);
            (bs.reward1, bs.reward2, bs.reward3)
        }
        else {
            (0, 0, 0)
        }
    }

    // To deposit the rewards value of the user's bucket store
    fun deposit_to_bucket(owner_addr: address, r1: u64, r2: u64, r3: u64) acquires BucketStore, BucketCore{
        ensure_bucket_store_exist(owner_addr);
        let token_address = get_bucket_user_address(&owner_addr);
        let bs = borrow_global_mut<BucketStore>(token_address);
        bs.reward1 = bs.reward1 + r1;
        bs.reward2 = bs.reward2 + r2;
        bs.reward3 = bs.reward3 + r3;

        event::emit(DepositToBucket { receiver: owner_addr, reward1: r1, reward2: r2, reward3: r3 });
    }

    // To withdraw the rewards value of the user's bucket store
    fun withdraw_from_bucket(owner_addr: address, amount: u64) acquires BucketStore{
        assert!(has_bucket_store(owner_addr), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        let token_address = get_bucket_user_address(&owner_addr);
        let bs = borrow_global_mut<BucketStore>(token_address);
        assert!(bs.reward1+bs.reward2+bs.reward3 >= amount, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS));
        if (bs.reward3 >= amount){
            bs.reward3 = bs.reward3 - amount;
        } else if (bs.reward3 + bs.reward2 >= amount){
            bs.reward2 = bs.reward2 - (amount - bs.reward3);
            bs.reward3 = 0;
        } else {
            bs.reward1 = bs.reward1 - (amount - bs.reward2 - bs.reward3);
            bs.reward2 = 0;
            bs.reward3 = 0;
        };
        event::emit(WithdrawFromBucket { owner: owner_addr, amount: amount });
    }

    /// To transfer the rewards from sender's bucket store to the receiver's bucket store
    fun transfer_rewards_from_sender_to_receiver(sender: address, receiver: address, amount: u64) acquires BucketStore, BucketCore{

        withdraw_from_bucket(sender, amount);
        let r1: u64 = 0;
        let r2: u64 = 0;
        deposit_to_bucket(receiver, r1, r2, amount);

        event::emit(TransferBetweenBuckets { sender, receiver,  transfered_amount: amount });
    }

    /// Only admin can transfer an amount from the reward3 bucket to the reward1 bucket.
    fun admin_transfer_reward3_to_user_bucket_internal(admin: &signer, user: address, amount: u64, index: u8) acquires ManagedFungibleAsset, BucketStore {
        let token_address = get_bucket_user_address(&signer::address_of(admin));
        let user_token_address = get_bucket_user_address(&user);
        {
            let bs = borrow_global_mut<BucketStore>(token_address);
            assert!(bs.reward3 >= amount, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS));
            bs.reward3 = bs.reward3 - amount;
        };
        let rs = borrow_global_mut<BucketStore>(user_token_address);
        if (index == 1) rs.reward1 = rs.reward1 + amount else rs.reward2 = rs.reward2 + amount;
        transfer_internal(admin, signer::address_of(admin), user, amount);
    }

    #[view]
    /// Return the address of the managed fungible asset that's created when this module is deployed.
    public fun get_metadata(): Object<Metadata> {
        let asset_address = object::create_object_address(&@FACoin, ASSET_SYMBOL);
        object::address_to_object<Metadata>(asset_address)
    }

    // :!:>mint
    /// Mint as the owner of metadata object and deposit to a specific account.
    public entry fun mint(admin: &signer, to: address, amount: u64, r1: u64, r2: u64, r3: u64) acquires ManagedFungibleAsset, BucketCore, BucketStore {
        assert!(r1+r2+r3 == amount, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_TO_ASSETS));
        let asset = get_metadata();
        let managed_fungible_asset = authorized_borrow_refs(admin, asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);

        let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, amount);
        // create a store if not exist and deposit the values in bucket
        deposit_to_bucket(to, r1, r2, r3);
        fungible_asset::deposit_with_ref(&managed_fungible_asset.transfer_ref, to_wallet, fa);

        // Freeeze the account so that native trnsfer would not work
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        // let wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::set_frozen_flag(transfer_ref, to_wallet, true);

    }// <:!:mint_to

    // :!:>Bulk mint
    /// Mint as the owner of metadata object and deposit to specific account in bulk
    public entry fun bulk_mint(admin: &signer, to_vec: vector<address>, amt_vec: vector<u64>, r1_vec: vector<u64>, r2_vec: vector<u64>, r3_vec: vector<u64>)
        acquires ManagedFungibleAsset, BucketCore, BucketStore{
        let len = vector::length(&to_vec);
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            let amount = vector::borrow(&amt_vec, i);
            let r1 = vector::borrow(&r1_vec, i);
            let r2 = vector::borrow(&r2_vec, i);
            let r3 = vector::borrow(&r3_vec, i);
            mint(admin, *to, *amount, *r1, *r2, *r3);
            i = i + 1;
            if (i >= len) break;
        }
    }

    public entry fun admin_transfer_reward3_to_user_bucket2(admin: &signer, to: address, amount: u64) acquires ManagedFungibleAsset, BucketStore{
        assert!(has_bucket_store(to), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
        admin_transfer_reward3_to_user_bucket_internal(admin, to, amount, 2);
    }

    public entry fun admin_transfer_reward3_to_user_bucket2_bulk(admin: &signer, to_vec: vector<address>, amount_vec: vector<u64>) acquires ManagedFungibleAsset, BucketStore{
        assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
        let len = vector::length(&to_vec);
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            assert!(has_bucket_store(*to), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
            let amount = vector::borrow(&amount_vec, i);
            admin_transfer_reward3_to_user_bucket_internal(admin, *to, *amount, 2);
            i = i + 1;
            if (i >= len) break;
        }
    }
    public entry fun admin_transfer_reward3_to_user_bucket1(admin: &signer, to: address, amount: u64) acquires ManagedFungibleAsset, BucketStore{
        assert!(has_bucket_store(to), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
        admin_transfer_reward3_to_user_bucket_internal(admin, to, amount, 1);
    }

    public entry fun admin_transfer_reward3_to_user_bucket1_bulk(admin: &signer, to_vec: vector<address>, amount_vec: vector<u64>) acquires ManagedFungibleAsset, BucketStore{
        assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
        let len = vector::length(&to_vec);
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            assert!(has_bucket_store(*to), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
            let amount = vector::borrow(&amount_vec, i);
            admin_transfer_reward3_to_user_bucket_internal(admin, *to, *amount, 1);
            i = i + 1;
            if (i >= len) break;
        }
    }

    /// Transfer as the owner of metadata object ignoring `frozen` field.
    public entry fun transfer(admin: &signer, from: address, to: address, amount: u64) 
        acquires ManagedFungibleAsset, BucketStore, BucketCore  {
        // First transfer from the buckets
        transfer_rewards_from_sender_to_receiver(from, to, amount);
        transfer_internal(admin, from, to, amount);
    }

    /// Trasnfer in bulk as the owner of metadata object ignoring `frozen` field.
    public entry fun bulk_transfer(admin: &signer, sender_vec: vector<address>, receiver_vec: vector<address>, amount_vec: vector<u64>)
        acquires ManagedFungibleAsset, BucketStore, BucketCore {
        assert!(vector::length(&sender_vec) == vector::length(&receiver_vec) && vector::length(&sender_vec) == vector::length(&amount_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        let len = vector::length(&receiver_vec);
        let i = 0;
        loop {
            let from = vector::borrow(&sender_vec, i);
            let to = vector::borrow(&receiver_vec, i);
            assert!(has_bucket_store(*from), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
            let amount = vector::borrow(&amount_vec, i);
            transfer(admin, *from, *to, *amount);
            i = i + 1;
            if (i >= len) break;
        }
    }

    // Transfer private function which works with FA not for Bucket store
    fun transfer_internal(admin: &signer, from: address, to: address, amount: u64) acquires ManagedFungibleAsset{
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let from_wallet = primary_fungible_store::primary_store(from, asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::transfer_with_ref(transfer_ref, from_wallet, to_wallet, amount);
    }

    /// Burn fungible assets as the owner of metadata object.
    public entry fun burn(admin: &signer, from: address, amount: u64) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let burn_ref = &authorized_borrow_refs(admin, asset).burn_ref;
        let from_wallet = primary_fungible_store::primary_store(from, asset);
        fungible_asset::burn_from(burn_ref, from_wallet, amount);
    }

    /// Freeze an account so it cannot transfer or receive fungible assets.
    public entry fun freeze_account(admin: &signer, account: address) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
        fungible_asset::set_frozen_flag(transfer_ref, wallet, true);
    }

    /// Unfreeze an account so it can transfer or receive fungible assets.
    public entry fun unfreeze_account(admin: &signer, account: address) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let wallet = primary_fungible_store::ensure_primary_store_exists(account, asset);
        fungible_asset::set_frozen_flag(transfer_ref, wallet, false);
    }

    /// Withdraw as the owner of metadata object ignoring `frozen` field.
    public fun withdraw(admin: &signer, amount: u64, from: address): FungibleAsset acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let from_wallet = primary_fungible_store::primary_store(from, asset);
        fungible_asset::withdraw_with_ref(transfer_ref, from_wallet, amount)
    }

    /// Deposit as the owner of metadata object ignoring `frozen` field.
    public fun deposit(admin: &signer, to: address, fa: FungibleAsset) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let transfer_ref = &authorized_borrow_refs(admin, asset).transfer_ref;
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::deposit_with_ref(transfer_ref, to_wallet, fa);
    }

    /// Borrow the immutable reference of the refs of `metadata`.
    /// This validates that the signer is the metadata object's owner.
    inline fun authorized_borrow_refs(
        owner: &signer,
        asset: Object<Metadata>,
    ): &ManagedFungibleAsset acquires ManagedFungibleAsset {
        assert!(object::is_owner(asset, signer::address_of(owner)), error::permission_denied(ENOT_OWNER));
        borrow_global<ManagedFungibleAsset>(object::object_address(&asset))
    }

    #[test(creator = @FACoin)]
    fun test_basic_flow(
        creator: &signer,
    ) acquires ManagedFungibleAsset {
        init_module(creator);
        let creator_address = signer::address_of(creator);
        let aaron_address = @0xface;

        mint(creator, creator_address, 100);
        let asset = get_metadata();
        assert!(primary_fungible_store::balance(creator_address, asset) == 100, 4);
        freeze_account(creator, creator_address);
        assert!(primary_fungible_store::is_frozen(creator_address, asset), 5);
        transfer(creator, creator_address, aaron_address, 10);
        assert!(primary_fungible_store::balance(aaron_address, asset) == 10, 6);

        unfreeze_account(creator, creator_address);
        assert!(!primary_fungible_store::is_frozen(creator_address, asset), 7);
        burn(creator, creator_address, 90);
    }

    #[test(creator = @FACoin, aaron = @0xface)]
    #[expected_failure(abort_code = 0x50001, location = Self)]
    fun test_permission_denied(
        creator: &signer,
        aaron: &signer
    ) acquires ManagedFungibleAsset {
        init_module(creator);
        let creator_address = signer::address_of(creator);
        mint(aaron, creator_address, 100);
    }
}
