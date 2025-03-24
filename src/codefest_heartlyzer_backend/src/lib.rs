//src/codefest_heartlyzer_backend/src/lib.rs
mod models;
mod services;
mod utils;
mod types;

use candid::Principal;
use types::{HealthData, PredictionInput, PredictionResult};
use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static PREDICTION_STORAGE: RefCell<HashMap<Principal, Vec<PredictionResult>>> = RefCell::new(HashMap::new());
}

#[ic_cdk::query]
fn get_principal() -> Principal {
    ic_cdk::caller()
}

#[ic_cdk::update]
fn load_dataset() -> Result<Vec<HealthData>, String> {
    services::health::load_dataset()
}

#[ic_cdk::update]
fn train_and_predict(input: PredictionInput) -> PredictionResult {
    let caller = ic_cdk::caller();
    let result = services::health::train_and_predict(input);
    
    PREDICTION_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        let mut user_history = storage.get(&caller).cloned().unwrap_or_default();
        user_history.push(result.clone());
        storage.insert(caller, user_history);
    });
    
    result
}

#[ic_cdk::query]
fn get_prediction_history() -> Vec<PredictionResult> {
    let caller = ic_cdk::caller();
    
    PREDICTION_STORAGE.with(|storage| {
        storage.borrow().get(&caller).cloned().unwrap_or_default()
    })
}

#[ic_cdk::update]
fn delete_prediction_history(index: usize) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    PREDICTION_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        if let Some(mut user_history) = storage.get(&caller).cloned() {
            if index < user_history.len() {
                user_history.remove(index);
                storage.insert(caller, user_history);
                Ok(())
            } else {
                Err("Index out of bounds".to_string())
            }
        } else {
            Err("No history found for user".to_string())
        }
    })
}

#[ic_cdk::update]
fn clear_prediction_history() -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    PREDICTION_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        storage.remove(&caller);
        Ok(())
    })
}

#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    let storage = PREDICTION_STORAGE.with(|storage| storage.borrow().clone());
    match ic_cdk::storage::stable_save((storage,)) {
        Ok(_) => (),
        Err(e) => ic_cdk::trap(&format!("Failed to save stable storage: {}", e)),
    }
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    match ic_cdk::storage::stable_restore::<(HashMap<Principal, Vec<PredictionResult>>,)>() {
        Ok((storage,)) => {
            PREDICTION_STORAGE.with(|s| *s.borrow_mut() = storage);
        },
        Err(e) => ic_cdk::trap(&format!("Failed to restore stable storage: {}", e)),
    }
}

ic_cdk::export_candid!();