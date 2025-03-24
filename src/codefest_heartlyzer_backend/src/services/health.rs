//src/Heartlyzer_backend/src/services/health.rs
use crate::models::ml::{train_model, predict};
use crate::types::{HealthData, PredictionInput, PredictionResult};
use crate::utils::preprocess::preprocess_data;

pub fn load_dataset() -> Result<Vec<HealthData>, String> {
    let dataset_json = include_str!("../dataset.json");
    match serde_json::from_str(dataset_json) {
        Ok(data) => Ok(data),
        Err(e) => Err(format!("Unable to parse JSON: {}", e)),
    }
}

pub fn train_and_predict(input: PredictionInput) -> PredictionResult {
    let dataset = load_dataset().unwrap();
    let (features, labels) = preprocess_data(dataset);
    let model = train_model(features, labels);

    let encoded_gender = match input.gender.as_str() {
        "Male" => 1.0,
        "Female" => 0.0,
        _ => 0.0,
    };
    let encoded_region = match input.region.as_str() {
        "Urban" => 1.0,
        "Rural" => 0.0,
        _ => 0.0,
    };
    let encoded_income_level = match input.income_level.as_str() {
        "High" => 2.0,
        "Middle" => 1.0,
        "Low" => 0.0,
        _ => 0.0,
    };
    let encoded_smoking_status = match input.smoking_status.as_str() {
        "Current" => 2.0,
        "Past" => 1.0,
        "Never" => 0.0,
        _ => 0.0,
    };
    let encoded_alcohol_consumption = match input.alcohol_consumption.as_str() {
        "High" => 2.0,
        "Moderate" => 1.0,
        "None" => 0.0,
        _ => 0.0,
    };
    let encoded_physical_activity = match input.physical_activity.as_str() {
        "High" => 2.0,
        "Moderate" => 1.0,
        "Low" => 0.0,
        _ => 0.0,
    };
    let encoded_dietary_habits = match input.dietary_habits.as_str() {
        "Healthy" => 1.0,
        "Unhealthy" => 0.0,
        _ => 0.0,
    };
    let encoded_air_pollution_exposure = match input.air_pollution_exposure.as_str() {
        "High" => 2.0,
        "Moderate" => 1.0,
        "Low" => 0.0,
        _ => 0.0,
    };
    let encoded_stress_level = match input.stress_level.as_str() {
        "High" => 2.0,
        "Moderate" => 1.0,
        "Low" => 0.0,
        _ => 0.0,
    };
    let encoded_ekg_results = match input.ekg_results.as_str() {
        "Abnormal" => 1.0,
        "Normal" => 0.0,
        _ => 0.0,
    };

    let normalized_age = input.age as f64 / 100.0;
    let normalized_cholesterol_level = input.cholesterol_level as f64 / 300.0;
    let normalized_waist_circumference = input.waist_circumference as f64 / 150.0;
    let normalized_sleep_hours = input.sleep_hours as f64 / 10.0;
    let normalized_blood_pressure_systolic = input.blood_pressure_systolic as f64 / 200.0;
    let normalized_blood_pressure_diastolic = input.blood_pressure_diastolic as f64 / 120.0;
    let normalized_fasting_blood_sugar = input.fasting_blood_sugar as f64 / 200.0;
    let normalized_cholesterol_hdl = input.cholesterol_hdl as f64 / 100.0;
    let normalized_cholesterol_ldl = input.cholesterol_ldl as f64 / 200.0;
    let normalized_triglycerides = input.triglycerides as f64 / 300.0;

    let input_features = vec![
        normalized_age,
        encoded_gender,
        encoded_region,
        encoded_income_level,
        input.hypertension as i32 as f64,
        input.diabetes as i32 as f64,
        normalized_cholesterol_level,
        input.obesity as i32 as f64,
        normalized_waist_circumference,
        input.family_history as i32 as f64,
        encoded_smoking_status,
        encoded_alcohol_consumption,
        encoded_physical_activity,
        encoded_dietary_habits,
        encoded_air_pollution_exposure,
        encoded_stress_level,
        normalized_sleep_hours,
        normalized_blood_pressure_systolic,
        normalized_blood_pressure_diastolic,
        normalized_fasting_blood_sugar,
        normalized_cholesterol_hdl,
        normalized_cholesterol_ldl,
        normalized_triglycerides,
        encoded_ekg_results,
        input.previous_heart_disease as i32 as f64,
        input.medication_usage as i32 as f64,
        input.participated_in_free_screening as i32 as f64,
    ];

    if input_features.len() != 27 {
        panic!("Input features must have 27 dimensions");
    }

    let prediction = predict(&model, input_features);
    let risk_level = if prediction[0] == 1 {
        "High risk"
    } else {
        "Low risk"
    };

    PredictionResult {
        risk_level: risk_level.to_string(),
    }
}