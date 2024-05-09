module KCashTreasury::kcash_treasury {
    use std::signer;
    use std::vector;
    use std::error;
    use FACoin::fa_coin;



    const ENOT_OWNER: u64 = 0;
    const EARRAY_LENGTH_MISMATCH: u64 = 1;


    struct Treasury has key {
        type: u64
    }

    public entry fun  initialize(_owner: &signer, _type: u64) {
        assert!(is_owner(_owner), error::permission_denied(ENOT_OWNER));
        let treasury = Treasury {
            type: _type
        };
        move_to(_owner, treasury);
    }

    public entry fun  addReward3(_owner: &signer, _amount: u64) {
        // assert!(is_owner(_owner), error::permission_denied(ENOT_OWNER));
        fa_coin::transfer_to_reward3(_owner, @KCashTreasury, vector[0,0,_amount]);
    }

    public entry fun  bulkDisburse(_owner: &signer, _to: vector<address>, _amount: vector<u64>) acquires Treasury {
        assert!(is_owner(_owner), error::permission_denied(ENOT_OWNER));
        assert!(vector::length(&_to) == vector::length(&_amount), error::invalid_argument(EARRAY_LENGTH_MISMATCH));
        let treasury = borrow_global<Treasury>(signer::address_of(_owner));
        let treasury_type = treasury.type;
        if (treasury_type == 1) {
            fa_coin::admin_transfer_reward3_to_user_bucket1_bulk(_owner, _to, _amount);
        } else if(treasury_type == 2) {
            fa_coin::admin_transfer_reward3_to_user_bucket2_bulk(_owner, _to, _amount);
        } else {
            fa_coin::transfer_reward3_to_reward3_bulk(_owner, _to, _amount);
        };
    }
    #[view]
    public fun get_type(): u64 acquires Treasury {
        let treasury = borrow_global<Treasury>(@KCashTreasury);
        treasury.type
    }

    public entry fun set_type(_owner: &signer, new_type: u64) acquires Treasury {
        assert!(is_owner(_owner), error::permission_denied(ENOT_OWNER));
        let treasury = borrow_global_mut<Treasury>(signer::address_of(_owner));
        treasury.type = new_type;
    }
    
    public fun is_owner(account: &signer): bool {
        signer::address_of(account) == @KCashTreasury
    }
    
}