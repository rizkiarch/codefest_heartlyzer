import React from 'react';

const ChatMessage = ({ index, message }) => {
    const isUser = 'user' in message.role;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
        <div key={index} className={`mb-6 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className="max-w-4xl mx-auto px-6">
                <div className="inline-block max-w-md">
                    <div className={`px-4 py-2 rounded-lg flex items-start gap-2 ${isUser ? 'bg-indigo-600 text-white' : 'bg-white shadow-md border border-gray-100'}`}>
                        {!isUser && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-100 text-red-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        <div>
                            <div className="mb-1 text-xs opacity-75">{isUser ? 'Anda' : 'heartlyzer'} · {timestamp}</div>
                            <div
                                className={`${isUser ? 'text-white' : 'text-gray-700'} whitespace-pre-wrap`}
                                dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>').replace(/#+\s*([^\n]+)/g, '<strong class="text-lg">$1</strong>') }}
                            />
                        </div>
                        {isUser && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;