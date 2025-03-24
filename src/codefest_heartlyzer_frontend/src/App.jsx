//src/Heartlyzer_frontend/src/App.jsx
import { useEffect, useRef, useState } from 'react';

import { updateActor, login, logout } from './utils/auth';
import { processPrediction, handleSubmit } from './utils/chat';
import { questions, recommendations } from './data/questions';

import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoginBanner from './components/LoginBanner';
import Navbar from './components/Navbar';

function App() {
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [userResponses, setUserResponses] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [selectedTab, setSelectedTab] = useState('predictions');

  const chatBoxRef = useRef();

  const [AuthState, setAuthState] = useState({
    actor: undefined,
    authClient: undefined,
    isAuthenticated: false,
    principal: "Login to see your principal",
  });

  useEffect(() => {
    updateActor(setAuthState, setUserInfo, setChat);
  }, []);

  useEffect(() => {
    if (AuthState.actor && AuthState.isAuthenticated) {
      fetchPredictionHistory();
    }
  }, [AuthState.isAuthenticated]);

  const fetchPredictionHistory = async () => {
    try {
      if (AuthState.actor) {
        const history = await AuthState?.actor?.get_prediction_history();
        console.log('Prediction history:', history);
        // Format history items with additional UI metadata
        const formattedHistory = history.map((item, index) => ({
          ...item,
          label: `Analisis Jantung #${index + 1}`,
          timestamp: new Date().toISOString(), // In a real app, this would come from the backend
        }));
        setPredictionHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Error fetching prediction history:', error);
    }
  };

  useEffect(() => {
    if (predictionResult && !isLoading && questionIndex === questions.length) {
      setPredictionHistory(prev => [...prev, {
        ...predictionResult,
        label: `Analisis Jantung #${prev.length + 1}`,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [predictionResult, questionIndex, isLoading]);

  useEffect(() => {
    if (questionIndex >= 0 && questionIndex < questions.length) {
      const currentQuestion = questions[questionIndex];
      setChat(prevChat => [...prevChat, {
        role: { system: null },
        content: `${currentQuestion.question}

${currentQuestion.explanation}

${currentQuestion.example}`
      }]);
    } else if (questionIndex === questions.length) {
      processPrediction(userResponses, setChat, setIsLoading, setPredictionResult, recommendations);
    }
  }, [questionIndex]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSelectHistory = (historyItem) => {
    setPredictionResult(historyItem);
    setChat([
      {
        role: { system: null },
        content: "Berikut adalah hasil analisis risiko jantung Anda dari sesi sebelumnya:"
      },
      {
        role: { system: null },
        content: JSON.stringify(historyItem, null, 2)
      }
    ]);

    setQuestionIndex(-2);
    setUserResponses({});
  };

  const handleNewChat = () => {
    setChat([]);
    setQuestionIndex(-1);
    setUserResponses({});
    setPredictionResult(null);

    setChat([{
      role: { system: null },
      content: 'Selamat datang di Heartlyzer! Aplikasi ini akan membantu Anda menganalisis risiko penyakit jantung Anda. ketik "mulai" untuk memulai analisis.'
    }]);
  };

  const handleDeleteHistory = async (index) => {
    try {
      await AuthState.actor.delete_prediction_history(index);
      setPredictionHistory(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/*Sidebar - Bisa dikecilkan pada layar kecil */}
        <Sidebar
          isOpen={isSidebarOpen}
          predictionHistory={predictionHistory}
          onNewChat={handleNewChat}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          AuthState={AuthState}
        />
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with User Info */}
          <header className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <h1 className="text-lg font-bold text-gray-800">heartlyzer</h1>
            </div>

            {/* Menu Button for Mobile */}
            <button className="md:hidden text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* User Info in Navbar */}
            <Navbar AuthState={AuthState}
              logout={() => logout(AuthState.authClient, () => updateActor(setAuthState, setUserInfo, setChat), setUserInfo, setChat, setQuestionIndex, setUserResponses, setPredictionResult)}
              login={() => login(AuthState.authClient, () => updateActor(setAuthState, setUserInfo, setChat))}
              userInfo={userInfo} />
          </header>

          {/* Login Banner - Show when not authenticated */}
          {!AuthState.isAuthenticated && <LoginBanner
            login={() => login(AuthState.authClient, () => updateActor(setAuthState, setUserInfo, setChat))} />}

          {/* Chat Area - Only show when authenticated */}
          {AuthState.isAuthenticated && (
            <div className="flex-1 flex flex-col">
              {/* Progress Indicator */}
              {questionIndex >= 0 && questionIndex < questions.length && (
                <div className="px-4 py-2 bg-white border-b border-gray-100">
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pertanyaan {questionIndex + 1} dari {questions.length}</span>
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4" ref={chatBoxRef}>
                {chat.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
              </div>

              {/* Input Area */}
              <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSubmit={(e) => handleSubmit(e, inputValue, isLoading, AuthState.isAuthenticated, questionIndex, questions, setChat, setInputValue, setQuestionIndex, setUserResponses, predictionResult, setPredictionResult)}
                isLoading={isLoading}
                isAuthenticated={AuthState.isAuthenticated}
                questionIndex={questionIndex}
                questions={questions}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;