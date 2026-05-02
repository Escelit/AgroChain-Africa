#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone)]
pub struct FarmerCredit {
    pub farmer: Address,
    pub total_contracts: u32,
    pub completed_contracts: u32,
    pub total_value_usdc: i128,
    pub defaults: u32,
    pub score: u32,
    pub last_updated_ledger: u32,
}

const ESCROW_KEY: soroban_sdk::Symbol = soroban_sdk::symbol_short!("ESCROW");

#[contract]
pub struct CreditScoreContract;

#[contractimpl]
impl CreditScoreContract {
    pub fn initialize(env: Env, escrow_contract: Address) {
        env.storage().instance().set(&ESCROW_KEY, &escrow_contract);
    }

    pub fn record_completion(env: Env, escrow_contract: Address, farmer: Address, value: i128) {
        escrow_contract.require_auth();

        let authorized: Address = env
            .storage()
            .instance()
            .get(&ESCROW_KEY)
            .expect("Not initialized");
        assert_eq!(authorized, escrow_contract, "Unauthorized caller");

        let mut credit = env
            .storage()
            .persistent()
            .get::<Address, FarmerCredit>(&farmer)
            .unwrap_or(FarmerCredit {
                farmer: farmer.clone(),
                total_contracts: 0,
                completed_contracts: 0,
                total_value_usdc: 0,
                defaults: 0,
                score: 0,
                last_updated_ledger: 0,
            });

        credit.total_contracts += 1;
        credit.completed_contracts += 1;
        credit.total_value_usdc += value;
        credit.score = Self::calculate_score(&credit);
        credit.last_updated_ledger = env.ledger().sequence();

        env.storage().persistent().set(&farmer, &credit);
    }

    pub fn record_default(env: Env, escrow_contract: Address, farmer: Address) {
        escrow_contract.require_auth();

        let mut credit = env
            .storage()
            .persistent()
            .get::<Address, FarmerCredit>(&farmer)
            .unwrap_or(FarmerCredit {
                farmer: farmer.clone(),
                total_contracts: 0,
                completed_contracts: 0,
                total_value_usdc: 0,
                defaults: 0,
                score: 0,
                last_updated_ledger: 0,
            });

        credit.total_contracts += 1;
        credit.defaults += 1;
        credit.score = Self::calculate_score(&credit);
        credit.last_updated_ledger = env.ledger().sequence();

        env.storage().persistent().set(&farmer, &credit);
    }

    pub fn get_credit(env: Env, farmer: Address) -> FarmerCredit {
        env.storage()
            .persistent()
            .get(&farmer)
            .expect("No credit history")
    }

    pub fn get_score(env: Env, farmer: Address) -> u32 {
        env.storage()
            .persistent()
            .get::<Address, FarmerCredit>(&farmer)
            .map(|c| c.score)
            .unwrap_or(0)
    }

    fn calculate_score(credit: &FarmerCredit) -> u32 {
        if credit.total_contracts == 0 {
            return 0;
        }
        let completion_rate =
            (credit.completed_contracts as u64 * 1000) / credit.total_contracts as u64;
        let volume_bonus = ((credit.total_value_usdc / 10_000_000).min(200)) as u32;
        let default_penalty = (credit.defaults * 100).min(500);
        ((completion_rate as u32 * 8 / 10) + volume_bonus)
            .saturating_sub(default_penalty)
            .min(1000)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_score_increases_with_completions() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, CreditScoreContract);
        let client = CreditScoreContractClient::new(&env, &contract_id);

        let escrow = Address::generate(&env);
        let farmer = Address::generate(&env);

        client.initialize(&escrow);
        client.record_completion(&escrow, &farmer, &50_000_000i128);

        let score = client.get_score(&farmer);
        assert!(score > 0);
    }
}
