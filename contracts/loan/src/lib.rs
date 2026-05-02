#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    token, Address, Env,
};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum LoanStatus {
    Active,
    Repaid,
    Defaulted,
    Liquidated,
}

#[contracttype]
#[derive(Clone)]
pub struct Loan {
    pub lender: Address,
    pub farmer: Address,
    pub batch_id: u64,
    pub principal_usdc: i128,
    pub interest_bps: u32,
    pub due_ledger: u32,
    pub repaid_usdc: i128,
    pub status: LoanStatus,
}

const USDC_KEY: soroban_sdk::Symbol = symbol_short!("USDC_ADDR");
const LOAN_CT: soroban_sdk::Symbol = symbol_short!("LOAN_CT");

#[contract]
pub struct LoanContract;

#[contractimpl]
impl LoanContract {
    pub fn initialize(env: Env, usdc_address: Address) {
        env.storage().instance().set(&USDC_KEY, &usdc_address);
    }

    pub fn create_loan(
        env: Env,
        lender: Address,
        farmer: Address,
        batch_id: u64,
        principal_usdc: i128,
        interest_bps: u32,
        ttl_ledgers: u32,
    ) -> u64 {
        lender.require_auth();

        let usdc_address: Address = env.storage().instance().get(&USDC_KEY).expect("Not initialized");
        let usdc = token::Client::new(&env, &usdc_address);
        usdc.transfer(&lender, &farmer, &principal_usdc);

        let loan_id: u64 = env
            .storage()
            .instance()
            .get(&LOAN_CT)
            .unwrap_or(0u64)
            + 1;

        let loan = Loan {
            lender,
            farmer,
            batch_id,
            principal_usdc,
            interest_bps,
            due_ledger: env.ledger().sequence() + ttl_ledgers,
            repaid_usdc: 0,
            status: LoanStatus::Active,
        };

        env.storage().persistent().set(&loan_id, &loan);
        env.storage().instance().set(&LOAN_CT, &loan_id);

        env.events().publish(
            (symbol_short!("LOAN"), symbol_short!("CREATED")),
            loan_id,
        );

        loan_id
    }

    pub fn repay(env: Env, farmer: Address, loan_id: u64, amount: i128) {
        farmer.require_auth();

        let mut loan: Loan = env
            .storage()
            .persistent()
            .get(&loan_id)
            .expect("Loan not found");

        assert_eq!(loan.farmer, farmer, "Not the borrower");
        assert!(loan.status == LoanStatus::Active, "Loan not active");

        let usdc_address: Address = env.storage().instance().get(&USDC_KEY).unwrap();
        let usdc = token::Client::new(&env, &usdc_address);
        usdc.transfer(&farmer, &loan.lender, &amount);

        loan.repaid_usdc += amount;

        let total_due = loan.principal_usdc
            + (loan.principal_usdc * loan.interest_bps as i128 / 10_000);

        if loan.repaid_usdc >= total_due {
            loan.status = LoanStatus::Repaid;
            env.events().publish(
                (symbol_short!("LOAN"), symbol_short!("REPAID")),
                loan_id,
            );
        }

        env.storage().persistent().set(&loan_id, &loan);
    }

    pub fn mark_defaulted(env: Env, lender: Address, loan_id: u64) {
        lender.require_auth();
        let mut loan: Loan = env
            .storage()
            .persistent()
            .get(&loan_id)
            .expect("Loan not found");

        assert_eq!(loan.lender, lender, "Not the lender");
        assert!(env.ledger().sequence() > loan.due_ledger, "Not past due");
        assert!(loan.status == LoanStatus::Active, "Loan not active");

        loan.status = LoanStatus::Defaulted;
        env.storage().persistent().set(&loan_id, &loan);
    }

    pub fn get_loan(env: Env, loan_id: u64) -> Loan {
        env.storage()
            .persistent()
            .get(&loan_id)
            .expect("Loan not found")
    }
}
