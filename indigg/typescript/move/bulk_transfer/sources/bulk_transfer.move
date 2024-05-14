module BulkTransfer::bulk_transfer {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::aptos_account;
    use std::vector;

    public entry fun call_bulk_transfer(from: &signer, to_addresses: vector<address>, amounts: vector<u64>) {
        let from_address = signer::address_of(from);

        let i = 0;
        let len = vector::length(&to_addresses);
        while (i < len) {
            let to_address = *vector::borrow(&to_addresses, i);
            let amount = *vector::borrow(&amounts, i);

            assert!(coin::balance<AptosCoin>(from_address) >= amount, 1);

            aptos_account::transfer(from, to_address, amount);

            i = i + 1;
        };
    }
}