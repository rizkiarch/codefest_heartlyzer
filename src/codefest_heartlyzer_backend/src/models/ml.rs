use smartcore::linalg::basic::matrix::DenseMatrix;
use smartcore::linear::logistic_regression::LogisticRegression;

pub fn train_model(features: Vec<Vec<f64>>, labels: Vec<i32>) -> LogisticRegression<f64, i32, DenseMatrix<f64>, Vec<i32>> {
    let x = DenseMatrix::from_2d_vec(&features).unwrap();
    LogisticRegression::fit(&x, &labels, Default::default()).unwrap()
}

pub fn predict(model: &LogisticRegression<f64, i32, DenseMatrix<f64>, Vec<i32>>, input: Vec<f64>) -> Vec<i32> {
    let x = DenseMatrix::from_2d_array(&[&input]).unwrap(); 
    model.predict(&x).unwrap()
}