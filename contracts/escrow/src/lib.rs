#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    token, Address, Env,
};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum EscrowStatus {
    Funded,
    Delivered,
    Disputed,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowData {
    pub buyer: Address,
    pub farmer: Address,
    pub oracle: Address,
    pub batch_id: u64,
    pub amount_usdc: i128,
    pub status: EscrowStatus,
    pub expiry_ledger: u32,
}

const USDC_KEY: soroban_sdk::Symbol = symbol_short!("USDC_ADDR");
const CONTRACT_CT: soroban_sdk::Symbol = symbol_short!("CTR_CT");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(env: Env, usdc_address: Address) {
        env.storage().instance().set(&USDC_KEY, &usdc_address);
    }

    pub fn fund(
        env: Env,
        buyer: Address,
        farmer: Address,
        oracle: Address,
        batch_id: u64,
        amount_usdc: i128,
        ttl_ledgers: u32,
    ) -> u64 {
        buyer.require_auth();

        let usdc_address: Address = env.storage().instance().get(&USDC_KEY).expect("Not initialized");
        let usdc = token::Client::new(&env, &usdc_address);
        usdc.transfer(&buyer, &env.current_contract_address(), &amount_usdc);

        let contract_id: u64 = env
            .storage()
            .instance()
            .get(&CONTRACT_CT)
            .unwrap_or(0u64)
            + 1;

        let escrow = EscrowData {
            buyer,
            farmer,
            oracle,
            batch_id,
            amount_usdc,
            status: EscrowStatus::Funded,
            expiry_ledger: env.ledger().sequence() + ttl_ledgers,
        };

        env.storage().persistent().set(&contract_id, &escrow);
        env.storage().instance().set(&CONTRACT_CT, &contract_id);

        env.events().publish(
            (symbol_short!("ESCROW"), symbol_short!("FUNDED")),
            contract_id,
        );

        contract_id
    }

    pub fn confirm_delivery(env: Env, oracle: Address, contract_id: u64) {
        oracle.require_auth();

        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&contract_id)
            .expect("Contract not found");

        assert!(escrow.status == EscrowStatus::Funded, "Not in funded state");
        assert_eq!(escrow.oracle, oracle, "Unauthorized oracle");

        let usdc_address: Address = env.storage().instance().get(&USDC_KEY).unwrap();
        let usdc = token::Client::new(&env, &usdc_address);
        usdc.transfer(
            &env.current_contract_address(),
            &escrow.farmer,
            &escrow.amount_usdc,
        );

        escrow.status = EscrowStatus::Released;
        env.storage().persistent().set(&contract_id, &escrow);

        env.events().publish(
            (symbol_short!("ESCROW"), symbol_short!("RELEASED")),
            contract_id,
        );
    }

    pub fn refund_expired(env: Env, contract_id: u64) {
        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&contract_id)
            .expect("Contract not found");

        assert!(escrow.status == EscrowStatus::Funded, "Not in funded state");
        assert!(
            env.ledger().sequence() > escrow.expiry_ledger,
            "Not expired yet"
        );

        let usdc_address: Address = env.storage().instance().get(&USDC_KEY).unwrap();
        let usdc = token::Client::new(&env, &usdc_address);
        usdc.transfer(
            &env.current_contract_address(),
            &escrow.buyer,
            &escrow.amount_usdc,
        );

        escrow.status = EscrowStatus::Refunded;
        env.storage().persistent().set(&contract_id, &escrow);
    }

    pub fn raise_dispute(env: Env, caller: Address, contract_id: u64) {
        caller.require_auth();
        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&contract_id)
            .expect("Contract not found");

        assert!(escrow.status == EscrowStatus::Funded, "Not in funded state");
        assert!(
            escrow.buyer == caller || escrow.farmer == caller,
            "Not a party"
        );

        escrow.status = EscrowStatus::Disputed;
        env.storage().persistent().set(&contract_id, &escrow);
    }

    pub fn get_escrow(env: Env, contract_id: u64) -> EscrowData {
        env.storage()
            .persistent()
            .get(&contract_id)
            .expect("Contract not found")
    }
}
