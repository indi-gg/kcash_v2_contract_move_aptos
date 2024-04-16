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
    use std::string::{Self, String, utf8};
    use std::option;
    use std::vector;
    use aptos_std::ed25519;
    use aptos_std::hash;
    use std::bcs;


    /// Only fungible asset metadata owner can make changes.
    const ENOT_OWNER: u64 = 1;
    const EUSER_DO_NOT_HAVE_BUCKET_STORE: u64 = 2;
    const EAMOUNT_SHOULD_BE_EQUAL_TO_ASSETS: u64 = 3;
    const EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS: u64 = 4;
    const EUSER_ALREADY_HAS_BUCKET_STORE: u64 = 5;
    const EINVALID_ARGUMENTS_LENGTH: u64 = 6;
    const EINVALID_SIGNATURE: u64 = 7;
    const ESIGNATURE_ALREADY_USED: u64 = 8;
    const EINVALID_ROLE: u64 = 9;

    const PUBLIC_KEY: vector<u8> = x"8b52afdbe87b51902bf9a32621a1d93b53fa822d6d57aca576b9ff6f6b72c205";
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

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Hold account which control the transfer of fungible assets. 
    /// Stores the address of the address with ADMIN_TRANSFER_ROLE
    struct AdminTransferRole has key {
        transfer_role_vec: vector<address>, 
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Hold account which control the minting of fungible assets. 
    /// Stores the address of the address with ADMIN_TRANSFER_ROLE
    struct AdminMinterRole has key {
        mint_role_vec: vector<address>, 
    }

    /// Hold the nonce of the signer, to avoid duplication
    struct ManagedNonce has key{
        nonce: u64
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

    #[event]
    struct MessageHash has drop, store{
        message: AdminTransferSignature,
        messag_bytes: vector<u8>,
        message_hash: vector<u8>,
        is_signature_valid: bool
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
            Stores the global storage for the addresses of minter  role
        */
        let m_vec = vector::empty<address>();
        vector::push_back<address>(&mut m_vec, signer::address_of(admin));
        move_to(admin, AdminMinterRole{mint_role_vec: m_vec});

        /*
            Stores the global storage for the addresses of  admin transfer role
        */
        let t_vec = vector::empty<address>();
        vector::push_back<address>(&mut t_vec, signer::address_of(admin));
        move_to(admin, AdminTransferRole{transfer_role_vec: t_vec});

        /*
         Here we're initializing the metadata for kcash fungible asset,
        */
        move_to(admin, ManagedNonce{nonce: 0});
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

    /* Verifies that minter is eligible for mint or not*/
    fun verifyMinter(minter: address): bool acquires AdminMinterRole{
        let m_vec = borrow_global<AdminMinterRole>(@FACoin).mint_role_vec;
        let len = vector::length(&m_vec);
        let res = false;
        let i = 0;
        loop {
            let role = vector::borrow(&m_vec, i);
            if(role == &minter){
                res = true;
                break
            };
            i = i + 1;
            if (i >= len) break;
        };
        res
    }

    /* Verifies that admin_transfer is eligible for transfer or not*/
    fun verifyAdminTransfer(admin_transfer: address): bool acquires AdminTransferRole{
        let t_vec = borrow_global<AdminTransferRole>(@FACoin).transfer_role_vec;
        let len = vector::length(&t_vec);
        let res = false;
        let i = 0;
        loop {
            let role = vector::borrow(&t_vec, i);
            if(role == &admin_transfer){
                res = true;
                break
            };
            i = i + 1;
            if (i >= len) break;
        };
        res
    }

    /* *** Viewable functions *** */
    #[view]
    public fun get_nonce(admin: address) : u64 acquires ManagedNonce{
        borrow_global_mut<ManagedNonce>(admin).nonce
    }

    #[view]
    public fun get_minter(): vector<address> acquires AdminMinterRole{
        borrow_global_mut<AdminMinterRole>(@FACoin).mint_role_vec
    }

    #[view]
    public fun get_admin_transfer(): vector<address> acquires AdminTransferRole{
        borrow_global_mut<AdminTransferRole>(@FACoin).transfer_role_vec
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

    #[view]
    /// Return the address of the managed fungible asset that's created when this module is deployed.
    public fun get_metadata(): Object<Metadata> {
        let asset_address = object::create_object_address(&@FACoin, ASSET_SYMBOL);
        object::address_to_object<Metadata>(asset_address)
    }

    fun update_nonce(admin: address) acquires ManagedNonce{
        let c = borrow_global_mut<ManagedNonce>(admin);
        c.nonce = c.nonce + 1;
    }


    // Verify signature  TODO: nonce per user
    fun signature_verification( admin: &signer, messageHash: vector<u8>, signature: vector<u8>, nonce: u64): bool acquires ManagedNonce{
        let e_nonce = get_nonce(signer::address_of(admin));
        assert!(nonce == e_nonce, error::permission_denied(ESIGNATURE_ALREADY_USED));

        // Generating Message Hash using sha2_256
        //let messageHash = hash::sha2_256(message);

        // Converting Public Key Bytes into UnValidated Public Key
        let unValidatedPublickkey = ed25519:: new_unvalidated_public_key_from_bytes(PUBLIC_KEY);

        // Converting Signature Bytes into Ed25519 Signature
        let signatureEd = ed25519::new_signature_from_bytes(signature);

        // Verifying Signature using Message Hash and public key
        let result = ed25519::signature_verify_strict(&signatureEd, &unValidatedPublickkey, messageHash);

        event::emit<SignVerify>(SignVerify{message:messageHash, signatureEd, result, messageHash});

        return result
    }


    struct AdminTransferSignature has drop, store {
        from: address,
        to: address,
        deductionFromSender: vector<u64>,
        additionToRecipient: vector<u64>
    }

    struct UserTransferWithSign has drop, store{
        from: address,
        to: address,
        amount: u64,
        method: String,
        nonce: u64
    }

    struct UserTransferWithSignBulk has drop, store {
        from: address,
        to_vec: vector<address>,
        amount_vec: vector<u64>,
        method: String,
        nonce: u64
    }

   

    // Admin Transfers with Signature
    public entry fun admin_transfer_with_signature(admin: &signer, to: address, deductnFromSender: vector<u64>, additnToRecipient: vector<u64>, signature: vector<u8>, nonce: u64 ) 
    acquires ManagedFungibleAsset, BucketStore, BucketCore, ManagedNonce {

        let message = AdminTransferSignature{
            from: signer::address_of(admin),
            to: to,
            deductionFromSender: deductnFromSender,
            additionToRecipient: additnToRecipient
        };
        
        let messag_bytes = bcs::to_bytes<AdminTransferSignature>(&message);
        let message_hash = hash::sha2_256(messag_bytes);

        // Verify designated signer with signature
        let is_signature_valid = signature_verification(admin, message_hash, signature, nonce);
        assert!(is_signature_valid, error::permission_denied(EINVALID_SIGNATURE));

        event::emit<MessageHash>(MessageHash{message, messag_bytes, message_hash, is_signature_valid});

        if(is_signature_valid == true) {
            assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
            assert!(vector::length(&deductnFromSender) == vector::length(&additnToRecipient), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
            let (r1, r2, r3) = (*vector::borrow(&deductnFromSender, 0), *vector::borrow(&deductnFromSender, 1), *vector::borrow(&deductnFromSender, 2));
            withdraw_rewards_from_bucket(signer::address_of(admin), r1, r2, r3);
            deposit_to_bucket(to, *vector::borrow(&additnToRecipient, 0), *vector::borrow(&additnToRecipient, 1), *vector::borrow(&additnToRecipient, 2));
            transfer_internal(admin, to, r1+r2+r3);
        }
    }

    struct AdminTransferSignatureBulk has drop, store {
        from: address,
        to: vector<address>,
        deductionFromSender: vector<vector<u64>>,
        additionToRecipient: vector<vector<u64>>
    }

    // Admin Transfers with Signature Bulk
      public entry fun admin_transfer_with_signature_bulk(admin: &signer, to_vec: vector<address>, deductionFromSender_vec: vector<vector<u64>>, additionToRecipient_vec: vector<vector<u64>>, signature: vector<u8>, nonce: u64 )
        acquires ManagedFungibleAsset, BucketStore, BucketCore, ManagedNonce, AdminTransferRole{

        let message = AdminTransferSignatureBulk{
            from: signer::address_of(admin),
            to: to_vec,
            deductionFromSender: deductionFromSender_vec,
            additionToRecipient: additionToRecipient_vec
        };
        
        let messag_bytes = bcs::to_bytes<AdminTransferSignatureBulk>(&message);
        let message_hash = hash::sha2_256(messag_bytes);

        // Verify designated signer with signature
        let is_signature_valid = signature_verification(admin, message_hash, signature, nonce);
        assert!(is_signature_valid, error::permission_denied(EINVALID_SIGNATURE));


        assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
        let len = vector::length(&deductionFromSender_vec);
        assert!(len == vector::length(&additionToRecipient_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            let deductionFromSender = vector::borrow(&deductionFromSender_vec, i);
            let additionToRecipient = vector::borrow(&additionToRecipient_vec, i);
            admin_transfer(admin, *to, *deductionFromSender, *additionToRecipient);
            i = i + 1;
            if (i >= len) break;
        }
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

    // Get user adress assosiate with bucketstoer
    fun get_bucket_user_address(creator_addr: &address): (address) {
        let bucket_address = token::create_token_address(
            &get_bucket_signer_address(),
            &utf8(BUCKET_COLLECTION_NAME),
            &get_bucket_user_name(creator_addr),
        );
        bucket_address
    }

    /// It insures that user has a bucket store, create a new store if it doesn't eist
    fun ensure_bucket_store_exist(user: address) acquires BucketCore{
        if(!has_bucket_store(user)){
            create_bucket_store(user);
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

    /*  To withdraw the rewards value of the user's bucket store
        @param amount which is withdraw from the bucketstore in order 
        reward3, reward2, reward1
    */ 
    fun withdraw_amount_from_bucket(owner_addr: address, amount: u64) acquires BucketStore{
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

    /*  To withdraw the rewards value of the user's bucket store
        @param reward1 which is withdraw from the bucketstore's reward1
        @param reward2 which is withdraw from the bucketstore's reward2
        @param reward3 which is withdraw from the bucketstore's reward3
    */ 
    fun withdraw_rewards_from_bucket(owner_addr: address, r1: u64, r2: u64, r3: u64) acquires BucketStore{
        assert!(has_bucket_store(owner_addr), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        let token_address = get_bucket_user_address(&owner_addr);
        let bs = borrow_global_mut<BucketStore>(token_address);
        bs.reward1 = bs.reward1 - r1;
        bs.reward2 = bs.reward2 - r2;
        bs.reward3 = bs.reward3 - r3;
    }

    /// Only admin can transfer an amount from the reward3 bucket to the reward1 bucket.
    fun admin_transfer_reward3_to_user_bucket_internal(admin: &signer, user: address, amount: u64, index: u8) acquires ManagedFungibleAsset, BucketCore, BucketStore {
        let token_address = get_bucket_user_address(&signer::address_of(admin));
        {
            let bs = borrow_global_mut<BucketStore>(token_address);
            assert!(bs.reward3 >= amount, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS));
            bs.reward3 = bs.reward3 - amount;
        };
        if (index == 1) deposit_to_bucket(user, amount, 0, 0) else deposit_to_bucket(user, 0, amount, 0);
        transfer_internal(admin, user, amount);
    }

    /// Transfer private function which works with FA not for Bucket store
    fun transfer_internal(from: &signer, to: address, amount: u64) acquires ManagedFungibleAsset{
        let asset = get_metadata();
        let transfer_ref = authorized_borrow_transfer_refs(asset);
        let from_wallet = primary_fungible_store::primary_store(signer::address_of(from), asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::transfer_with_ref(transfer_ref, from_wallet, to_wallet, amount);
    }

    /// Internal function user transfer from bucket3 to any bucket based on the index
    fun user_transfer_internal(from: &signer, to: address, amount: u64, index: u8) acquires ManagedFungibleAsset, BucketCore, BucketStore{
        let token_address = get_bucket_user_address(&signer::address_of(from));
        let bucketSender = borrow_global_mut<BucketStore>(token_address);
        assert!(bucketSender.reward3 >= amount, error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        bucketSender.reward3 = bucketSender.reward3 - amount;

        if (index == 2) deposit_to_bucket(to, 0, 0, amount) else if(index == 1) deposit_to_bucket(to, 0, amount, 0) else deposit_to_bucket(to, amount, 0, 0);
        transfer_internal(from, to, amount);
        event::emit(TransferBetweenBuckets { sender: signer::address_of(from), receiver: to,  transfered_amount: amount });
    }

    /* -----  Entry functions that can be called from outsie ----- */

    /* -----  Only admin can invoke these fun ----- */

    /* To assign minter role to an address 
        Only admin can invoke this*/
    public entry fun add_minter(admin: &signer, new_minter: address) acquires AdminMinterRole{
        assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
        let mint_struct = borrow_global_mut<AdminMinterRole>(@FACoin);
        vector::push_back<address>(&mut mint_struct.mint_role_vec, new_minter);
    }

    /* To assign transfer role to an address 
        Only admin can invoke this*/
    public entry fun add_admin_transfer(admin: &signer, new_admin_transfer: address) acquires AdminTransferRole{
        assert!(is_owner(signer::address_of(admin)), error::permission_denied(ENOT_OWNER));
        let transfer_struct = borrow_global_mut<AdminTransferRole>(@FACoin);
        vector::push_back<address>(&mut transfer_struct.transfer_role_vec, new_admin_transfer);
    }

    // :!:>mint
    /// Mint as the owner of metadata object or the account with minter role and deposit to a specific account.
    public entry fun mint(
        admin: &signer, 
        to: address, 
        amount: u64, 
        r1: u64, 
        r2: u64, 
        r3: u64
    ) acquires ManagedFungibleAsset, BucketCore, BucketStore, AdminMinterRole {
        assert!(verifyMinter(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
        assert!(r1+r2+r3 == amount, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_TO_ASSETS));
        let asset = get_metadata();
        let mint_ref_borrow = authorized_borrow_mint_refs(admin, asset);
        let transfer_ref_borrow = authorized_borrow_transfer_refs(asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);

        let fa = fungible_asset::mint(mint_ref_borrow, amount);
        // create a store if not exist and deposit the values in bucket
        deposit_to_bucket(to, r1, r2, r3);
        fungible_asset::deposit_with_ref(transfer_ref_borrow, to_wallet, fa);

        // Freeeze the account so that native trnsfer would not work
        // let wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::set_frozen_flag(transfer_ref_borrow, to_wallet, true);

    }// <:!:mint_to

    /// Mint as the owner of metadata object and deposit to specific account in bulk
    public entry fun bulk_mint(admin: &signer, to_vec: vector<address>, amt_vec: vector<u64>, r1_vec: vector<u64>, r2_vec: vector<u64>, r3_vec: vector<u64>)
        acquires ManagedFungibleAsset, BucketCore, BucketStore, AdminMinterRole{
        assert!(verifyMinter(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
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

    /**
     * @dev Transfers rewards from the sender's bucket to the recipient's bucket.
     * Only the address with the ADMIN_TRANSFER_ROLE can call this function.
     * The amount of rewards transferred must match the sum of rewards deducted from the sender's bucket
     * and added to the recipient's bucket.
     *
     * @param to The address of the recipient.
     -----Since we can not use custom datatype as parameter, so instead of the bucket store, we're uses the vec of u64
            which contains reward1, reward2, reward3 for both deductionFromSender and additionToRecipient 
     * @param deductionFromSender The vec containing the rewards to be deducted from the sender.
     * @param additionToRecipient The vec containing the rewards to be added to the recipient.
    */
    public entry fun admin_transfer(admin: &signer, to: address, deductionFromSender: vector<u64>, additionToRecipient: vector<u64>)
        acquires ManagedFungibleAsset, BucketStore, BucketCore, AdminTransferRole
    {
        assert!(verifyAdminTransfer(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
        assert!(vector::length(&deductionFromSender) == vector::length(&additionToRecipient), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        let (r1, r2, r3) = (*vector::borrow(&deductionFromSender, 0), *vector::borrow(&deductionFromSender, 1), *vector::borrow(&deductionFromSender, 2));
        withdraw_rewards_from_bucket(signer::address_of(admin), r1, r2, r3);
        deposit_to_bucket(to, *vector::borrow(&additionToRecipient, 0), *vector::borrow(&additionToRecipient, 1), *vector::borrow(&additionToRecipient, 2));
        transfer_internal(admin, to, r1+r2+r3);
    }

    /**
     * @dev Performs bulk admin transfers.
     * @param to The array of recipient addresses.
     -----Since we can not use custom datatype as parameter, so instead of the bucket store, we're uses the vec of vec of u64
            which contains reward1, reward2, reward3 for both deductionFromSender and additionToRecipient 
     * @param deductionFromSender_vec The vec of vec containing the rewards to be deducted from the sender.
     * @param additionToRecipient_vec The vec of vec containing the rewards to be added to the recipient.
     * Requirements:
     * - The length of `to`, `deductionFromSender`, and `additionToRecipient` arrays must be the same.
     * - Only the role with ADMIN_TRANSFER_ROLE can call this function.
    */
    public entry fun admin_transfer_bulk(admin: &signer, to_vec: vector<address>, deductionFromSender_vec: vector<vector<u64>>, additionToRecipient_vec: vector<vector<u64>>)
        acquires ManagedFungibleAsset, BucketStore, BucketCore, AdminTransferRole{
        assert!(verifyAdminTransfer(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
        let len = vector::length(&deductionFromSender_vec);
        assert!(len == vector::length(&additionToRecipient_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            let deductionFromSender = vector::borrow(&deductionFromSender_vec, i);
            let additionToRecipient = vector::borrow(&additionToRecipient_vec, i);
            admin_transfer(admin, *to, *deductionFromSender, *additionToRecipient);
            i = i + 1;
            if (i >= len) break;
        }
    }

    /**
     * @dev Transfers a specified amount from the reward3 balance to the reward1 balance.
     * Only the address with the ADMIN_TRANSFER_ROLE can call this function.
     * 
     * @param to The signer who transfer the funds from.
     * @param to The address to transfer the funds to.
     * @param amount The amount of funds to transfer.
     */
    public entry fun admin_transfer_reward3_to_user_bucket1(admin: &signer, to: address, amount: u64) acquires ManagedFungibleAsset, BucketStore, BucketCore, AdminTransferRole{
        assert!(verifyAdminTransfer(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
        admin_transfer_reward3_to_user_bucket_internal(admin, to, amount, 1);
    }

    /**
     * @dev Transfers tokens from Reward3 to Reward1 in bulk for multiple addresses.
     * Only the admin with the ADMIN_TRANSFER_ROLE can call this function.
     * 
     * @param to The array of addresses to transfer tokens to.
     * @param amounts The array of token amounts to transfer.
     * 
     * Requirements:
     * - The length of `to` array must be equal to the length of `amounts` array.
     */
    public entry fun admin_transfer_reward3_to_user_bucket1_bulk(admin: &signer, to_vec: vector<address>, amount_vec: vector<u64>) acquires ManagedFungibleAsset, BucketStore, BucketCore, AdminTransferRole{
        assert!(vector::length(&to_vec) == vector::length(&amount_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        assert!(verifyAdminTransfer(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
        let len = vector::length(&to_vec);
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            // assert!(has_bucket_store(*to), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
            let amount = vector::borrow(&amount_vec, i);
            admin_transfer_reward3_to_user_bucket_internal(admin, *to, *amount, 1);
            i = i + 1;
            if (i >= len) break;
        }
    }

    /**
     * @dev Transfers a specified amount from the reward3 balance to the reward2 balance.
     * Only the address with the ADMIN_TRANSFER_ROLE can call this function.
     * 
     * @param to The signer who transfer the funds from.
     * @param to The address to transfer the funds to.
     * @param amount The amount of funds to transfer.
     */
    public entry fun admin_transfer_reward3_to_user_bucket2(admin: &signer, to: address, amount: u64) acquires ManagedFungibleAsset, BucketStore, BucketCore, AdminTransferRole{
        assert!(verifyAdminTransfer(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
        admin_transfer_reward3_to_user_bucket_internal(admin, to, amount, 2);
    }

    /**
     * @dev Transfers tokens from Reward3 to Reward2 in bulk for multiple addresses.
     * Only the admin with the ADMIN_TRANSFER_ROLE can call this function.
     * 
     * @param to The array of addresses to transfer tokens to.
     * @param amounts The array of token amounts to transfer.
     * 
     * Requirements:
     * - The length of `to` array must be equal to the length of `amounts` array.
     */
    public entry fun admin_transfer_reward3_to_user_bucket2_bulk(admin: &signer, to_vec: vector<address>, amount_vec: vector<u64>) acquires ManagedFungibleAsset, BucketStore, BucketCore, AdminTransferRole{
        assert!(vector::length(&to_vec) == vector::length(&amount_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        assert!(verifyAdminTransfer(signer::address_of(admin)), error::invalid_argument(EINVALID_ROLE));
        let len = vector::length(&to_vec);
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            // assert!(has_bucket_store(*to), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
            let amount = vector::borrow(&amount_vec, i);
            admin_transfer_reward3_to_user_bucket_internal(admin, *to, *amount, 2);
            i = i + 1;
            if (i >= len) break;
        }
    }

    /* -----  Any one can invoke these fun ----- */

    /// Transfer as the owner of metadata object ignoring `frozen` field.
    public entry fun transfer(from: &signer, to: address, amount: u64) 
        acquires ManagedFungibleAsset, BucketStore, BucketCore  {
        assert!(has_bucket_store(signer::address_of(from)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        // First transfer from the buckets
        withdraw_amount_from_bucket(signer::address_of(from), amount);
        deposit_to_bucket(to, 0, 0, amount);
        event::emit(TransferBetweenBuckets { sender: signer::address_of(from), receiver: to,  transfered_amount: amount });
        transfer_internal(from, to, amount);
    }

    /// Trasnfer in bulk as the owner of metadata object ignoring `frozen` field.
    /**
     * @dev Performs bulk transfer of KCash tokens to multiple accounts.
     * @param accounts The array of recipient addresses.
     * @param amounts The array of corresponding transfer amounts.
     * @return A boolean indicating the success of the bulk transfer operation.
    */
    public entry fun bulk_transfer(from: &signer, receiver_vec: vector<address>, amount_vec: vector<u64>)
        acquires ManagedFungibleAsset, BucketStore, BucketCore {
        assert!(has_bucket_store(signer::address_of(from)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        assert!(vector::length(&receiver_vec) == vector::length(&amount_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        let len = vector::length(&receiver_vec);
        let i = 0;
        loop {
            let to = vector::borrow(&receiver_vec, i);
            let amount = vector::borrow(&amount_vec, i);
            transfer(from, *to, *amount);
            i = i + 1;
            if (i >= len) break;
        }
    }

    /**
     * @dev Transfers tokens to the reward3 bucket of the recipient address.
     * @param to The address to transfer the tokens to.
     * @param _bucket The vec containing the token amounts to transfer.
    */
    public entry fun transfer_to_reward3(sender: &signer, to: address, bucket: vector<u64>) acquires ManagedFungibleAsset, BucketCore, BucketStore{
        assert!(has_bucket_store(signer::address_of(sender)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        let (r1, r2, r3) = (vector::borrow(&bucket, 0), vector::borrow(&bucket, 1), vector::borrow(&bucket, 2));
        let amount = *r1 + *r2 + *r3;
        let token_address = get_bucket_user_address(&signer::address_of(sender));
        let bucketSender = borrow_global_mut<BucketStore>(token_address);
        assert!(bucketSender.reward1 >= *r1, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS));
        assert!(bucketSender.reward2 >= *r2, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS));
        assert!(bucketSender.reward3 >= *r3, error::invalid_argument(EAMOUNT_SHOULD_BE_EQUAL_OR_LESS_THAN_BUCKET_ASSETS));
        if (amount == *r1) {
            bucketSender.reward1 = bucketSender.reward1 - *r1;
        } else {
            if (*r1 != 0) {
                bucketSender.reward1 = bucketSender.reward1 - *r1;
            };
            if (*r2 != 0) {
                bucketSender.reward2 = bucketSender.reward2 - *r2;
            };
            if (*r3 != 0) {
                bucketSender.reward3 = bucketSender.reward3 - *r3;
            }
        };

        deposit_to_bucket(to, 0, 0, amount);
        transfer_internal(sender, to, amount);
        event::emit(TransferBetweenBuckets { sender: signer::address_of(sender), receiver: to,  transfered_amount: amount });
    }

    /**
     * @dev Transfers tokens to multiple addresses and assigns them to corresponding reward3 buckets.
     * @param to_vec The vec of addresses to transfer tokens to.
     * @param bucket_vec The vec of vec of reward3 buckets to assign to each address.
     * Requirements:
     * - The length of `to_vec` vec must be equal to the length of `bucket_vec` vec.
    */
    public entry fun transfer_to_reward3_bulk(sender: &signer, to_vec: vector<address>, bucket_vec: vector<vector<u64>>) acquires ManagedFungibleAsset, BucketCore, BucketStore{
        let len = vector::length(&to_vec);
        assert!(len == vector::length(&bucket_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            let bucket = vector::borrow(&bucket_vec, i);
            transfer_to_reward3(sender, *to, *bucket);
            i = i + 1;
            if (i >= len) break;
        }

    }

    /**
     * @dev Transfers a specified amount of reward3 tokens from the sender's bucket to the recipient's bucket.
     * Emits a Transfer event.
     *
     * Requirements:
     * - The sender must have a sufficient balance of reward3 tokens in their bucket.
     *
     * @param to The address of the recipient.
     * @param amount The amount of reward3 tokens to transfer.
    */
    public entry fun transfer_reward3_to_reward3 (from: &signer, to: address, amount: u64) acquires ManagedFungibleAsset, BucketCore, BucketStore{
        assert!(has_bucket_store(signer::address_of(from)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        user_transfer_internal(from, to, amount, 2);
    }

    /**
     * @dev Transfers multiple amounts of Reward3 tokens to multiple addresses.
     * @param to_vec A vector of addresses to transfer the tokens to.
     * @param amount_vec A vector of amounts to be transferred to each address.
     * Requirements:
     * - The `to_vec` and `to_vec` vectors must have the same length.
     * - The caller must have sufficient balance of Reward3 tokens.
    */
    public entry fun transfer_reward3_to_reward3_bulk (from: &signer, to_vec: vector<address>, amount_vec: vector<u64>) 
        acquires ManagedFungibleAsset, BucketCore, BucketStore{
        let len = vector::length(&to_vec);
        assert!(len == vector::length(&amount_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            let amount = vector::borrow(&amount_vec, i);
            transfer_reward3_to_reward3(from, *to, *amount);
            i = i + 1;
            if (i >= len) break;
        }
    }

    /* *** Methods that requires signature *** */
    /**
     * @dev Transfers an amount from the reward3 bucket to the reward1 bucket.
     * @param signature The signature containing the transfer details.
    */
    public entry fun transfer_reward3_to_reward1(admin: &signer, from: &signer, to: address, amount: u64, signature: vector<u8>) 
    acquires ManagedFungibleAsset, BucketCore, BucketStore, ManagedNonce{
        let nonce = get_nonce(signer::address_of(admin));
        let message = UserTransferWithSign{
            from: signer::address_of(from),
            to,
            amount,
            method: string::utf8(b"transfer_reward3_to_reward1"),
            nonce
        };
        
        let messag_bytes = bcs::to_bytes<UserTransferWithSign>(&message);
        let message_hash = hash::sha2_256(messag_bytes);
        let is_signature_valid = signature_verification( admin, message_hash, signature, nonce);
        assert!(is_signature_valid, error::permission_denied(EINVALID_SIGNATURE));

        assert!(has_bucket_store(signer::address_of(from)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        user_transfer_internal(from, to, amount, 0);
        update_nonce(signer::address_of(admin));
    }

    /**
     * @dev Transfers multiple amounts of Reward3 tokens to multiple addresses.
     * @param to_vec A vector of addresses to transfer the tokens to.
     * @param amount_vec A vector of amounts to be transferred to each address.
     * Requirements:
     * - The `to_vec` and `to_vec` vectors must have the same length.
     * - The caller must have sufficient balance of Reward3 tokens.
    */
    public entry fun transfer_reward3_to_reward1_bulk(admin: &signer, from: &signer, to_vec: vector<address>, amount_vec: vector<u64>, signature: vector<u8>) 
    acquires ManagedFungibleAsset, BucketCore, BucketStore, ManagedNonce{
        let len = vector::length(&to_vec);
        assert!(len == vector::length(&amount_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));

        let nonce = get_nonce(signer::address_of(admin));
        // creating a struct for bulk transfer
        let message = UserTransferWithSignBulk{
            from: signer::address_of(from),
            to_vec,
            amount_vec,
            method: string::utf8(b"transfer_reward3_to_reward1_bulk"),
            nonce
        };
        
        let messag_bytes = bcs::to_bytes<UserTransferWithSignBulk>(&message);
        let message_hash = hash::sha2_256(messag_bytes);
        let is_signature_valid = signature_verification( admin, message_hash, signature, nonce);
        assert!(is_signature_valid, error::permission_denied(EINVALID_SIGNATURE));

        assert!(has_bucket_store(signer::address_of(from)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            let amount = vector::borrow(&amount_vec, i);
            user_transfer_internal(from, *to, *amount, 0);
            i = i + 1;
            if (i >= len) break;
        };
        update_nonce(signer::address_of(admin));
    }

    /* *** Methods that requires signature *** */
    /**
     * @dev Transfers an amount from the reward3 bucket to the reward2 bucket.
     * @param signature The signature containing the transfer details.
    */
    public entry fun transfer_reward3_to_reward2(admin: &signer, from: &signer, to: address, amount: u64, signature: vector<u8>) 
    acquires ManagedFungibleAsset, BucketCore, BucketStore, ManagedNonce{
        let nonce = get_nonce(signer::address_of(admin));
        let message = UserTransferWithSign{
            from: signer::address_of(from),
            to,
            amount,
            method: string::utf8(b"transfer_reward3_to_reward2"),
            nonce
        };
        let messag_bytes = bcs::to_bytes<UserTransferWithSign>(&message);
        let message_hash = hash::sha2_256(messag_bytes);
        let is_signature_valid = signature_verification( admin, message_hash, signature, nonce);
        assert!(is_signature_valid, error::permission_denied(EINVALID_SIGNATURE));

        assert!(has_bucket_store(signer::address_of(from)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        user_transfer_internal(from, to, amount, 1);
        update_nonce(signer::address_of(admin));
    }

    /**
     * @dev Transfers multiple amounts of Reward3 tokens to multiple addresses.
     * @param to_vec A vector of addresses to transfer the tokens to.
     * @param amount_vec A vector of amounts to be transferred to each address.
     * Requirements:
     * - The `to_vec` and `to_vec` vectors must have the same length.
     * - The caller must have sufficient balance of Reward3 tokens.
    */
    public entry fun transfer_reward3_to_reward2_bulk(admin: &signer, from: &signer, to_vec: vector<address>, amount_vec: vector<u64>, signature: vector<u8>) 
    acquires ManagedFungibleAsset, BucketCore, BucketStore, ManagedNonce{
        let len = vector::length(&to_vec);
        assert!(len == vector::length(&amount_vec), error::invalid_argument(EINVALID_ARGUMENTS_LENGTH));

        let nonce = get_nonce(signer::address_of(admin));
        // creating a struct for bulk transfer
        let message = UserTransferWithSignBulk{
            from: signer::address_of(from),
            to_vec,
            amount_vec,
            method: string::utf8(b"transfer_reward3_to_reward2_bulk"),
            nonce
        };
        
        let messag_bytes = bcs::to_bytes<UserTransferWithSignBulk>(&message);
        let message_hash = hash::sha2_256(messag_bytes);
        let is_signature_valid = signature_verification( admin, message_hash, signature, nonce);
        assert!(is_signature_valid, error::permission_denied(EINVALID_SIGNATURE));

        assert!(has_bucket_store(signer::address_of(from)), error::invalid_argument(EUSER_DO_NOT_HAVE_BUCKET_STORE));
        let i = 0;
        loop {
            let to = vector::borrow(&to_vec, i);
            let amount = vector::borrow(&amount_vec, i);
            user_transfer_internal(from, *to, *amount, 1);
            i = i + 1;
            if (i >= len) break;
        };
        update_nonce(signer::address_of(admin));
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


    inline fun authorized_borrow_mint_refs(owner: &signer, asset: Object<Metadata>, ): &MintRef acquires ManagedFungibleAsset, AdminMinterRole{
        assert!(verifyMinter(signer::address_of(owner)), error::invalid_argument(EINVALID_ROLE));
        let ref = borrow_global<ManagedFungibleAsset>(object::object_address(&asset));
        &ref.mint_ref
    }

    inline fun authorized_borrow_transfer_refs(asset: Object<Metadata>, ): &TransferRef acquires ManagedFungibleAsset{
        let ref = borrow_global<ManagedFungibleAsset>(object::object_address(&asset));
        &ref.transfer_ref
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

        mint(creator, creator_address, 100, 110, 120, 130);
        let asset = get_metadata();
        assert!(primary_fungible_store::balance(creator_address, asset) == 100, 4);
        freeze_account(creator, creator_address);
        assert!(primary_fungible_store::is_frozen(creator_address, asset), 5);
        // transfer(creator, creator_address, aaron_address, 10);
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
        mint(aaron, creator_address, 100, 110, 120, 130);
    }
}
