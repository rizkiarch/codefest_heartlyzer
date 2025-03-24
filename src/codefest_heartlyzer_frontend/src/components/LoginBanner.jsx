import React from 'react';

const LoginBanner = ({ login }) => {
    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <h2 className="text-2xl font-bold mb-3 text-gray-800">Selamat Datang di Heartlyzer</h2>
                <p className="mb-6 text-gray-600">
                    Sistem analisis risiko penyakit jantung berdasarkan AI berbasis Machine Learning menggunakan dataset prediksi Jantung di Indonesia
                </p>
                <button
                    onClick={login}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md px-6 py-3 rounded-md font-medium"
                >
                    Masuk dengan Internet Identity
                </button>
            </div>
        </div>
    );
};

export default LoginBanner;