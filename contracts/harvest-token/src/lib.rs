#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub struct HarvestBatch {
    pub farmer: Address,
    pub commodity: Symbol,
    pub grade: Symbol,
    pub weight_kg: u64,
    pub location_geohash: String,
    pub harvest_date_unix: u64,
    pub is_pledged: bool,
    pub is_delivered: bool,
}

const BATCH_COUNT: Symbol = symbol_short!("BATCH_CT");

#[contract]
pub struct HarvestTokenContract;

#[contractimpl]
impl HarvestTokenContract {
    pub fn create_batch(
        env: Env,
        farmer: Address,
        commodity: Symbol,
        grade: Symbol,
        weight_kg: u64,
        location_geohash: String,
        harvest_date_unix: u64,
    ) -> u64 {
        farmer.require_auth();

        let batch_id: u64 = env
            .storage()
            .instance()
            .get(&BATCH_COUNT)
            .unwrap_or(0u64)
            + 1;

        let batch = HarvestBatch {
            farmer: farmer.clone(),
            commodity,
            grade,
            weight_kg,
            location_geohash,
            harvest_date_unix,
            is_pledged: false,
            is_delivered: false,
        };

        env.storage().persistent().set(&batch_id, &batch);
        env.storage().instance().set(&BATCH_COUNT, &batch_id);

        env.events().publish(
            (symbol_short!("HARVEST"), symbol_short!("CREATED")),
            (farmer, batch_id),
        );

        batch_id
    }

    pub fn get_batch(env: Env, batch_id: u64) -> HarvestBatch {
        env.storage()
            .persistent()
            .get(&batch_id)
            .expect("Batch not found")
    }

    pub fn pledge_batch(env: Env, batch_id: u64, farmer: Address) {
        farmer.require_auth();
        let mut batch: HarvestBatch = env
            .storage()
            .persistent()
            .get(&batch_id)
            .expect("Batch not found");
        assert_eq!(batch.farmer, farmer, "Not the owner");
        assert!(!batch.is_pledged, "Already pledged");
        batch.is_pledged = true;
        env.storage().persistent().set(&batch_id, &batch);
    }

    pub fn mark_delivered(env: Env, batch_id: u64, oracle: Address) {
        oracle.require_auth();
        let mut batch: HarvestBatch = env
            .storage()
            .persistent()
            .get(&batch_id)
            .expect("Batch not found");
        assert!(batch.is_pledged, "Batch not pledged");
        batch.is_delivered = true;
        env.storage().persistent().set(&batch_id, &batch);
    }

    pub fn batch_count(env: Env) -> u64 {
        env.storage().instance().get(&BATCH_COUNT).unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_create_and_get_batch() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, HarvestTokenContract);
        let client = HarvestTokenContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let batch_id = client.create_batch(
            &farmer,
            &Symbol::new(&env, "MAIZE"),
            &Symbol::new(&env, "AA"),
            &1000u64,
            &String::from_str(&env, "u4pruydqqvj"),
            &1_700_000_000u64,
        );

        assert_eq!(batch_id, 1);
        let batch = client.get_batch(&batch_id);
        assert_eq!(batch.farmer, farmer);
        assert!(!batch.is_pledged);
    }

    #[test]
    fn test_pledge_batch() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, HarvestTokenContract);
        let client = HarvestTokenContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let batch_id = client.create_batch(
            &farmer,
            &Symbol::new(&env, "COFFEE"),
            &Symbol::new(&env, "AB"),
            &500u64,
            &String::from_str(&env, "u4pruydqqvj"),
            &1_700_000_000u64,
        );

        client.pledge_batch(&batch_id, &farmer);
        let batch = client.get_batch(&batch_id);
        assert!(batch.is_pledged);
    }
}
