//src/Heartlyzer_backend/src/types.rs
use candid::CandidType;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde::de::{Deserializer};

#[derive(Serialize, Deserialize, CandidType)]
pub struct HealthData {
    pub age: u32,
    pub gender: String,
    pub region: String,
    pub income_level: String,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub hypertension: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub diabetes: bool,
    pub cholesterol_level: u32,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub obesity: bool,
    pub waist_circumference: u32,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub family_history: bool,
    pub smoking_status: String,
    pub alcohol_consumption: String,
    pub physical_activity: String,
    pub dietary_habits: String,
    pub air_pollution_exposure: String,
    pub stress_level: String,
    pub sleep_hours: f32,
    pub blood_pressure_systolic: u32,
    pub blood_pressure_diastolic: u32,
    pub fasting_blood_sugar: u32,
    pub cholesterol_hdl: u32,
    pub cholesterol_ldl: u32,
    pub triglycerides: u32,
    pub ekg_results: String,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub previous_heart_disease: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub medication_usage: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub participated_in_free_screening: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub heart_attack: bool,
}

#[derive(CandidType, Deserialize)]
pub struct PredictionInput {
    pub age: u32,
    pub gender: String,
    pub region: String,
    pub income_level: String,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub hypertension: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub diabetes: bool,
    pub cholesterol_level: u32,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub obesity: bool,
    pub waist_circumference: u32,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub family_history: bool,
    pub smoking_status: String,
    pub alcohol_consumption: String,
    pub physical_activity: String,
    pub dietary_habits: String,
    pub air_pollution_exposure: String,
    pub stress_level: String,
    pub sleep_hours: f32,
    pub blood_pressure_systolic: u32,
    pub blood_pressure_diastolic: u32,
    pub fasting_blood_sugar: u32,
    pub cholesterol_hdl: u32,
    pub cholesterol_ldl: u32,
    pub triglycerides: u32,
    pub ekg_results: String,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub previous_heart_disease: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub medication_usage: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub participated_in_free_screening: bool,
    #[serde(deserialize_with = "deserialize_bool_from_int_or_bool")]
    pub heart_attack: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct PredictionResult {
    pub risk_level: String,
}

fn deserialize_bool_from_int_or_bool<'de, D>(deserializer: D) -> Result<bool, D::Error>
where
    D: Deserializer<'de>,
{
    let value = Value::deserialize(deserializer)?;
    match value {
        Value::Bool(b) => Ok(b),
        Value::Number(num) => {
            if let Some(i) = num.as_i64() {
                Ok(i != 0) 
            } else {
                Err(serde::de::Error::custom("Expected boolean or integer"))
            }
        }
        _ => Err(serde::de::Error::custom("Expected boolean or integer")),
    }
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct ChatRole {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<()>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<()>,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct ChatMessage {
    pub role: ChatRole,
    pub content: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ChatHistory {
    pub messages: Vec<ChatMessage>,
    pub timestamp: String,
    pub label: String,
}