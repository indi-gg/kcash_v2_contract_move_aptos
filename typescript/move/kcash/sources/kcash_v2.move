module kcashV2::kcash_v2{
    // use std::debug;
    use std::signer::address_of;

    struct Bucket has key, drop, copy{
        bot: u64,
        earning: u64,
        bonus: u64,
    }

    public fun initialize(user: &signer) {
        // Assert that the module is not already initialized
        assert!(!exists<Bucket>(address_of(user)), 100);
        let bucket = Bucket{
            bot: 0,
            earning: 0,
            bonus: 0,
        };
        move_to ( user, bucket);  // Incomplete...............................
    }


    /// Mint as the owner of metadata object and deposit to a specific account.
    public entry fun mint(admin: &signer, amount: u64){
        let bucket = Bucket{
            bot: amount,
            earning: 0,
            bonus: 0,
        };
        move_to(admin, move bucket);
    }// <:!:mint_to

    #[view]
    public fun user_bucket(user: address): Bucket acquires Bucket {
        let bucket = borrow_global_mut<Bucket>(user);
        *bucket
    }

    // public entry fun transfer(from: &signer, to: address, amount: u64) acquires Bucket {
        
    // }
}