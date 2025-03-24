import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AnalysisResult {
  'recommendations' : Array<string>,
  'primary_factors' : Array<string>,
  'timestamp' : bigint,
  'risk_level' : string,
  'risk_percentage' : number,
}
export interface ChatMessage { 'content' : string, 'role' : ChatRole }
export interface ChatRole { 'user' : [] | [null], 'system' : [] | [null] }
export type DatasetResult = { 'Ok' : Array<HealthData> } |
  { 'Err' : string };
export type GenericResult = { 'Ok' : null } |
  { 'Err' : string };
export interface HealthData {
  'age' : number,
  'region' : string,
  'participated_in_free_screening' : boolean,
  'sleep_hours' : number,
  'blood_pressure_systolic' : number,
  'physical_activity' : string,
  'family_history' : boolean,
  'hypertension' : boolean,
  'cholesterol_level' : number,
  'income_level' : string,
  'alcohol_consumption' : string,
  'cholesterol_hdl' : number,
  'cholesterol_ldl' : number,
  'blood_pressure_diastolic' : number,
  'medication_usage' : boolean,
  'smoking_status' : string,
  'previous_heart_disease' : boolean,
  'triglycerides' : number,
  'waist_circumference' : number,
  'heart_attack' : boolean,
  'stress_level' : string,
  'gender' : string,
  'obesity' : boolean,
  'ekg_results' : string,
  'fasting_blood_sugar' : number,
  'air_pollution_exposure' : string,
  'diabetes' : boolean,
  'dietary_habits' : string,
}
export interface PredictionInput { 'health_data' : HealthData }
export interface PredictionResult { 'risk_level' : string }
export type Result = { 'Ok' : AnalysisResult } |
  { 'Err' : string };
export interface _SERVICE {
  'clear_prediction_history' : ActorMethod<[], GenericResult>,
  'delete_prediction_history' : ActorMethod<[bigint], GenericResult>,
  'get_prediction_history' : ActorMethod<[], Array<PredictionResult>>,
  'get_principal' : ActorMethod<[], string>,
  'load_dataset' : ActorMethod<[], DatasetResult>,
  'train_and_predict' : ActorMethod<[HealthData], PredictionResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
