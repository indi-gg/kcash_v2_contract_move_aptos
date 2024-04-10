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

    /// Only fungible asset metadata owner can make changes.
    const ENOT_OWNER: u64 = 1;
    const EUSER_DO_NOT_HAVE_BUCKET_STORE: u64 = 2;
    const EAMOUNT_SHOULD_BE_EQUAL_TO_ASSETS: u64 = 3;
    const EWITHDRAWABLE_AMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS: u64 = 4;

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

    // We need a contract signer as the creator of the bucket core and bucket store
    // Otherwise we need admin to sign whenever a new bucket store is created which is inconvenient
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct BucketCore has key {
        // This is the extend_ref of the bucket core object, not the extend_ref of bucket store object
        // bucket core object is the creator of bucket store object
        // but owner of each bucket store(i.e. user)
        // bucket_extended_ref
        bucket_ext_ref: ExtendRef,
    }
    
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

    /// Initialize metadata object and store the refs.
    // :!:>initialize
    fun init_module(admin: &signer) {
        // init the bucket core
        let bucket_constructor_ref = &object::create_named_object(admin, BUCKET_CORE_SEED);
        let bucket_ext_ref = object::generate_extend_ref(bucket_constructor_ref);
        let bucket_signer = object::generate_signer(bucket_constructor_ref);

        move_to(&bucket_signer, BucketCore{
            bucket_ext_ref,
        });

        create_bucket_store_collection(&bucket_signer);

        let constructor_ref = &object::create_named_object(admin, ASSET_SYMBOL);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            utf8(b"KCash"), /* name */
            utf8(ASSET_SYMBOL), /* symbol */
            8, /* decimals */
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
        let description = utf8(BUCKET_COLLECTION_DESCRIPTION);
        let name = utf8(BUCKET_COLLECTION_NAME);
        let uri = utf8(b"http://example.com");
        // assert!(!has_bucket_store(user), error::already_exists(EUSER_ALREADY_HAS_BUCKET_STORE));

        let constructor_ref = token::create_named_token(
            &get_bucket_signer(get_bucket_signer_address()),
            name,
            description,
            get_bucket_user_name(&user),
            option::none(),
            uri,
        );

        let token_signer = object::generate_signer(&constructor_ref);
        // let mutator_ref = token::generate_mutator_ref(&constructor_ref);
        // let burn_ref = token::generate_burn_ref(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);

        let new_bs = BucketStore{
            reward1: 0,
            reward2: 0,
            reward3: 0,
        };
        move_to(&token_signer, new_bs);
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
        let token_address = get_bucket_user_address(&owner_addr);
        let bs = borrow_global<BucketStore>(token_address);
        (bs.reward1, bs.reward2, bs.reward3)
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
        assert!(has_bucket_store(owner_addr), error::already_exists(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        let token_address = get_bucket_user_address(&owner_addr);
        let bs = borrow_global_mut<BucketStore>(token_address);
        assert!(bs.reward1+bs.reward2+bs.reward3 >= amount, error::invalid_argument(EWITHDRAWABLE_AMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS));
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
        let wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::set_frozen_flag(transfer_ref, wallet, true);

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

    /// Transfer as the owner of metadata object ignoring `frozen` field.
    public entry fun transfer(admin: &signer, from: address, to: address, amount: u64) acquires ManagedFungibleAsset, BucketStore, BucketCore  {
        let asset = get_metadata();

        // First transfer from the buckets
        transfer_rewards_from_sender_to_receiver(from, to, amount);

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
