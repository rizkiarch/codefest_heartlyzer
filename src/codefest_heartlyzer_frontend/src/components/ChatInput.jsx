import React from 'react';

const ChatInput = ({ inputValue, setInputValue, handleSubmit, isLoading, isAuthenticated, questionIndex, questions }) => {
    return (
        <div className="border-t border-gray-200 bg-white p-4 shadow-md">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 max-w-3xl mx-auto">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={
                            questionIndex >= 0 && questionIndex < questions.length
                                ? `Jawab pertanyaan ${questionIndex + 1}...`
                                : "Ketik pesan Anda..."
                        }
                        className="w-full max-w-md border border-gray-300 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl px-6 py-3 font-medium transition-all shadow-sm"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <span className="flex items-center space-x-2">
                            <span>Kirim</span>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7-7" />
                            </svg>
                        </span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ChatInput;