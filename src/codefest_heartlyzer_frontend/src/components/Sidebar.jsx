import React from 'react';

const Sidebar = ({
    isOpen,
    predictionHistory,
    onNewChat,
    onSelectHistory,
    onDeleteHistory,
    selectedTab,
    setSelectedTab,
    AuthState
}) => {
    return (
        <div className={`${isOpen ? 'block' : 'hidden'} md:block w-64 bg-gray-50 border-r border-gray-200 text-gray-800 p-4 h-full flex flex-col`}>
            <div className="flex items-center mb-6">
                <svg className="w-8 h-8 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <h1 className="text-xl font-bold">heartlyzer</h1>
            </div>

            <button
                onClick={onNewChat}
                className="w-full mb-4 bg-white text-gray-800 hover:bg-gray-100 rounded-md px-3 py-2 text-sm font-medium border border-gray-200 flex items-center justify-center"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Chat Baru
            </button>

            {/* Tab Selector */}
            <div className="flex mb-4 border-b border-gray-200">
                <button
                    onClick={() => setSelectedTab('predictions')}
                    className={`flex-1 py-2 text-sm font-medium ${selectedTab === 'predictions'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Prediksi
                </button>
            </div>

            {/* Prediction History Tab */}
            {selectedTab === 'predictions' && (
                <div className="space-y-2 mb-4 flex-1 overflow-y-auto">
                    <p className="text-xs text-gray-500 uppercase font-medium px-3 mb-1">Riwayat Prediksi</p>

                    {predictionHistory && predictionHistory.length === 0 || !AuthState.isAuthenticated ? (
                        <p className="text-sm text-gray-500 px-3">Belum ada riwayat prediksi</p>
                    ) : (
                        predictionHistory?.map((item, index) => (
                            <div key={`prediction-${index}`} className="group relative">
                                <button
                                    onClick={() => onSelectHistory(item)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded flex items-center justify-between"
                                >
                                    <div className="flex flex-col flex-grow truncate">
                                        <span className="font-medium truncate">
                                            {item.label || `Analisis #${index + 1}`}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteHistory(index);
                                        }}
                                        className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete prediction"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2 px-3">Powered by</p>
                <div className="flex items-center px-3">
                    <span className="text-xs text-gray-700">Internet Computer Protocol</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;