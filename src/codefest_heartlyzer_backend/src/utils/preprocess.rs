use crate::types::HealthData;

pub fn preprocess_data(dataset: Vec<HealthData>) -> (Vec<Vec<f64>>, Vec<i32>) {
    let mut features = Vec::new();
    let mut labels = Vec::new();

    for record in dataset {
        // Encoding categorical data
        let encoded_gender = match record.gender.as_str() {
            "Male" => 1.0,
            "Female" => 0.0,
            _ => 0.0,
        };
        let encoded_region = match record.region.as_str() {
            "Urban" => 1.0,
            "Rural" => 0.0,
            _ => 0.0,
        };
        let encoded_income_level = match record.income_level.as_str() {
            "High" => 2.0,
            "Middle" => 1.0,
            "Low" => 0.0,
            _ => 0.0,
        };
        let encoded_smoking_status = match record.smoking_status.as_str() {
            "Current" => 2.0,
            "Past" => 1.0,
            "Never" => 0.0,
            _ => 0.0,
        };
        let encoded_alcohol_consumption = match record.alcohol_consumption.as_str() {
            "High" => 2.0,
            "Moderate" => 1.0,
            "None" => 0.0,
            _ => 0.0,
        };
        let encoded_physical_activity = match record.physical_activity.as_str() {
            "High" => 2.0,
            "Moderate" => 1.0,
            "Low" => 0.0,
            _ => 0.0,
        };
        let encoded_dietary_habits = match record.dietary_habits.as_str() {
            "Healthy" => 1.0,
            "Unhealthy" => 0.0,
            _ => 0.0,
        };
        let encoded_air_pollution_exposure = match record.air_pollution_exposure.as_str() {
            "High" => 2.0,
            "Moderate" => 1.0,
            "Low" => 0.0,
            _ => 0.0,
        };
        let encoded_stress_level = match record.stress_level.as_str() {
            "High" => 2.0,
            "Moderate" => 1.0,
            "Low" => 0.0,
            _ => 0.0,
        };
        let encoded_ekg_results = match record.ekg_results.as_str() {
            "Abnormal" => 1.0,
            "Normal" => 0.0,
            _ => 0.0,
        };

        let normalized_age = record.age as f64 / 100.0;
        let normalized_cholesterol_level = record.cholesterol_level as f64 / 300.0;
        let normalized_waist_circumference = record.waist_circumference as f64 / 150.0;
        let normalized_sleep_hours = record.sleep_hours as f64 / 10.0;
        let normalized_blood_pressure_systolic = record.blood_pressure_systolic as f64 / 200.0;
        let normalized_blood_pressure_diastolic = record.blood_pressure_diastolic as f64 / 120.0;
        let normalized_fasting_blood_sugar = record.fasting_blood_sugar as f64 / 200.0;
        let normalized_cholesterol_hdl = record.cholesterol_hdl as f64 / 100.0;
        let normalized_cholesterol_ldl = record.cholesterol_ldl as f64 / 200.0;
        let normalized_triglycerides = record.triglycerides as f64 / 300.0;

        let feature_vector = vec![
            normalized_age,
            encoded_gender,
            encoded_region,
            encoded_income_level,
            record.hypertension as i32 as f64, 
            record.diabetes as i32 as f64,
            normalized_cholesterol_level,
            record.obesity as i32 as f64,
            normalized_waist_circumference,
            record.family_history as i32 as f64,
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
            record.previous_heart_disease as i32 as f64,
            record.medication_usage as i32 as f64,
            record.participated_in_free_screening as i32 as f64,
        ];

        features.push(feature_vector);
        labels.push(record.heart_attack as i32);
    }

    (features, labels)
}