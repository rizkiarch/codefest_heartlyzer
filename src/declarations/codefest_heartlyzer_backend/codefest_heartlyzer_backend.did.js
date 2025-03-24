export const idlFactory = ({ IDL }) => {
  const GenericResult = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const PredictionResult = IDL.Record({ 'risk_level' : IDL.Text });
  const HealthData = IDL.Record({
    'age' : IDL.Nat32,
    'region' : IDL.Text,
    'participated_in_free_screening' : IDL.Bool,
    'sleep_hours' : IDL.Float32,
    'blood_pressure_systolic' : IDL.Nat32,
    'physical_activity' : IDL.Text,
    'family_history' : IDL.Bool,
    'hypertension' : IDL.Bool,
    'cholesterol_level' : IDL.Nat32,
    'income_level' : IDL.Text,
    'alcohol_consumption' : IDL.Text,
    'cholesterol_hdl' : IDL.Nat32,
    'cholesterol_ldl' : IDL.Nat32,
    'blood_pressure_diastolic' : IDL.Nat32,
    'medication_usage' : IDL.Bool,
    'smoking_status' : IDL.Text,
    'previous_heart_disease' : IDL.Bool,
    'triglycerides' : IDL.Nat32,
    'waist_circumference' : IDL.Nat32,
    'heart_attack' : IDL.Bool,
    'stress_level' : IDL.Text,
    'gender' : IDL.Text,
    'obesity' : IDL.Bool,
    'ekg_results' : IDL.Text,
    'fasting_blood_sugar' : IDL.Nat32,
    'air_pollution_exposure' : IDL.Text,
    'diabetes' : IDL.Bool,
    'dietary_habits' : IDL.Text,
  });
  const DatasetResult = IDL.Variant({
    'Ok' : IDL.Vec(HealthData),
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'clear_prediction_history' : IDL.Func([], [GenericResult], []),
    'delete_prediction_history' : IDL.Func([IDL.Nat64], [GenericResult], []),
    'get_prediction_history' : IDL.Func(
        [],
        [IDL.Vec(PredictionResult)],
        ['query'],
      ),
    'get_principal' : IDL.Func([], [IDL.Text], ['query']),
    'load_dataset' : IDL.Func([], [DatasetResult], []),
    'train_and_predict' : IDL.Func([HealthData], [PredictionResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
