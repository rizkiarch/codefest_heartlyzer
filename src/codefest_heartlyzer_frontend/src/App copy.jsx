import { useEffect, useRef, useState } from 'react';
import { codefest_heartlyzer_backend } from 'declarations/codefest_heartlyzer_backend';
import { idlFactory } from 'declarations/codefest_heartlyzer_backend/codefest_heartlyzer_backend.did.js';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';

function App() {
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(-1); // -1 for intro, 0+ for questions
  const [userResponses, setUserResponses] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const chatBoxRef = useRef();

  const [AuthState, setAuthState] = useState({
    actor: undefined,
    authClient: undefined,
    isAuthenticated: false,
    principal: "Login to see your principal",
  });

  const identityProvider = "https://identity.ic0.app";
  const canisterId = process.env.CANISTER_ID_HEARTLYZER_BACKEND;

  const Button = ({ onClick, children, className = "" }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium focus:outline-none ${className}`}
    >
      {children}
    </button>
  );

  const createActor = (canisterId, options) => {
    const agent = new HttpAgent({ ...options?.agentOptions });
    if (process.env.NODE_ENV !== "production") {
      agent.fetchRootKey().catch(err => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }

    // Use the imported idlFactory instead of accessing it through Heartlyzer_backend
    return Actor.createActor(idlFactory, {
      agent,
      canisterId,
      ...options?.actorOptions,
    });
  };

  const updateActor = async () => {
    try {
      // Create AuthClient first
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();

      // Get identity only if authenticated
      const identity = isAuthenticated ? authClient.getIdentity() : null;

      // Create actor with identity if available
      const actor = createActor(canisterId, identity ? {
        agentOptions: { identity }
      } : {});

      setAuthState((prev) => ({
        ...prev,
        actor,
        authClient,
        isAuthenticated,
      }));

      // If authenticated, get principal directly from the auth client identity
      if (isAuthenticated) {
        try {
          // Get the principal directly from the identity
          const principal = identity.getPrincipal().toString();
          setUserInfo({ principal });

          // Show welcome message if authenticated
          setChat([{
            role: { system: null },
            content: `Selamat datang di Heartlyzer, sistem analisis risiko penyakit jantung berbasis AI.
  
  Saya akan membantu Anda mengevaluasi risiko penyakit jantung berdasarkan data kesehatan Anda. Anda akan menjawab beberapa pertanyaan satu per satu, dan setiap jawaban Anda akan disimpan untuk analisis.
  
  Proses ini membutuhkan sekitar 5-10 menit. Semua data yang Anda berikan bersifat rahasia dan hanya digunakan untuk perhitungan risiko.
  
  Siap untuk memulai? Ketik "Mulai" untuk melanjutkan.`
          }]);
        } catch (principalError) {
          console.error("Error getting principal:", principalError);
        }
      }
    } catch (error) {
      console.error("Failed to update actor:", error);
    }
  };

  const login = async () => {
    try {
      if (!AuthState.authClient) {
        await updateActor();
      }
      await AuthState.authClient.login({
        identityProvider,
        onSuccess: async () => {
          await updateActor();
        },
      });
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  const logout = async () => {
    try {
      if (!AuthState.authClient) {
        await updateActor();
      }
      await AuthState.authClient.logout();
      // Clear user data on logout
      setUserInfo(null);
      setChat([]);
      setQuestionIndex(-1);
      setUserResponses({});
      setPredictionResult(null);
      await updateActor();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const whoami = async () => {
    try {
      if (!AuthState.authClient) {
        await updateActor();
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        principal: "Loading...",
      }));

      // Get principal directly from the auth client
      if (AuthState.isAuthenticated) {
        const identity = AuthState.authClient.getIdentity();
        const principal = identity.getPrincipal().toString();

        setAuthState((prev) => ({
          ...prev,
          principal,
        }));
      } else {
        setAuthState((prev) => ({
          ...prev,
          principal: "Not authenticated",
        }));
      }
    } catch (error) {
      console.error("Failed to get principal:", error);
      setAuthState((prev) => ({
        ...prev,
        principal: "Error fetching principal",
      }));
    }
  };

  // Questions with explanations and examples
  const questions = [
    {
      id: 'age',
      question: 'Berapa usia Anda saat ini?',
      explanation: 'Usia adalah faktor risiko penting untuk penyakit jantung. Risiko meningkat seiring bertambahnya usia.',
      example: 'Contoh: 45',
      type: 'number',
      validation: (value) => value >= 18 && value <= 100,
      errorMsg: 'Masukkan usia valid antara 18-100 tahun',
    },
    // ... rest of the questions (unchanged)
  ];

  // Recommendations based on prediction results
  const recommendations = {
    high_risk: {
      title: "Rekomendasi untuk Risiko Tinggi Penyakit Jantung",
      hospitals: [
        {
          name: "Rumah Sakit Jantung dan Pembuluh Darah Harapan Kita",
          location: "Jakarta",
          specialist: "Pusat rujukan nasional untuk penyakit kardiovaskular",
          contact: "(021) 5684085",
        },
        // ... rest of hospitals (unchanged)
      ],
      advice: "Segera konsultasikan hasil ini dengan dokter spesialis jantung. Jangan menunda pemeriksaan medis lebih lanjut. Perubahan gaya hidup HARUS segera dilakukan bersamaan dengan konsultasi medis profesional."
    },
    low_risk: {
      title: "Rekomendasi untuk Menjaga Kesehatan Jantung",
      preventions: [
        // ... rest of preventions (unchanged)
      ],
      advice: "Meskipun risiko Anda rendah, tetap penting untuk menjaga kesehatan jantung dengan gaya hidup sehat. Konsultasikan dengan dokter untuk pemeriksaan rutin sesuai usia dan faktor risiko Anda."
    }
  };

  // Fetch authentication state on component mount
  useEffect(() => {
    updateActor();
  }, []);

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
      // Process final prediction after all questions answered
      processPrediction();
    }
  }, [questionIndex]);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const processPrediction = async () => {
    try {
      setIsLoading(true);

      // Add processing message
      setChat(prevChat => [...prevChat, {
        role: { system: null },
        content: 'Menganalisis data kesehatan Anda...'
      }]);

      const analysisSteps = [
        "Mengumpulkan data dan memverifikasi informasi...",
        "Menganalisis tekanan darah dan kadar gula darah...",
        "Mengevaluasi riwayat keluarga dan faktor risiko...",
        "Menghitung tingkat kolesterol dan trigliserida...",
        "Memprediksi tingkat risiko berdasarkan pola kesehatan...",
        "Menyusun rekomendasi berdasarkan hasil analisis...",
        "Menyajikan hasil analisis dan rekomendasi..."
      ];

      for (let i = 1; i < analysisSteps.length; i++) {
        setTimeout(() => {
          setChat(prevChat => [...prevChat, {
            role: { system: null },
            content: analysisSteps[i]
          }]);
        }, i * 2000);
      }

      // Prepare prediction input from user responses
      const predictionInput = {
        age: parseInt(userResponses.age),
        gender: userResponses.gender,
        region: userResponses.region,
        income_level: userResponses.income_level,
        hypertension: userResponses.hypertension,
        diabetes: userResponses.diabetes,
        cholesterol_level: parseInt(userResponses.cholesterol_level),
        obesity: userResponses.obesity,
        waist_circumference: parseInt(userResponses.waist_circumference),
        family_history: userResponses.family_history,
        smoking_status: userResponses.smoking_status,
        alcohol_consumption: userResponses.alcohol_consumption,
        physical_activity: userResponses.physical_activity,
        dietary_habits: userResponses.dietary_habits,
        air_pollution_exposure: userResponses.air_pollution_exposure,
        stress_level: userResponses.stress_level,
        sleep_hours: parseInt(userResponses.sleep_hours),
        blood_pressure_systolic: parseInt(userResponses.blood_pressure_systolic),
        blood_pressure_diastolic: parseInt(userResponses.blood_pressure_diastolic),
        fasting_blood_sugar: parseInt(userResponses.fasting_blood_sugar),
        cholesterol_hdl: parseInt(userResponses.cholesterol_hdl),
        cholesterol_ldl: parseInt(userResponses.cholesterol_ldl),
        triglycerides: parseInt(userResponses.triglycerides),
        ekg_results: userResponses.ekg_results,
        previous_heart_disease: userResponses.previous_heart_disease,
        medication_usage: userResponses.medication_usage,
        participated_in_free_screening: userResponses.participated_in_free_screening,
        heart_attack: userResponses.heart_attack,
      };

      await new Promise(resolve => setTimeout(resolve, 10000));

      // Call the backend
      const result = await Heartlyzer_backend.train_and_predict(predictionInput);
      setPredictionResult(result);

      // Generate recommendation message based on result
      let recommendationMessage = '';
      if (result.risk_level === "High risk") {
        const hospitals = recommendations.high_risk.hospitals;
        recommendationMessage = `## ${recommendations.high_risk.title}

${recommendations.high_risk.advice}

### Rumah Sakit yang Direkomendasikan:

${hospitals.map(hospital => `- **${hospital.name}** (${hospital.location})
  ${hospital.specialist}
  Kontak: ${hospital.contact}`).join('\n\n')}

Segera hubungi fasilitas kesehatan terdekat atau dokter spesialis jantung untuk evaluasi lebih lanjut. Kondisi ini memerlukan perhatian medis.`;
      } else {
        const preventions = recommendations.low_risk.preventions;
        recommendationMessage = `## ${recommendations.low_risk.title}

${recommendations.low_risk.advice}

${preventions.map(prevention => `### ${prevention.category}:
${prevention.tips.map(tip => `- ${tip}`).join('\n')}`).join('\n\n')}

Tetap jaga kesehatan jantung Anda dengan pemeriksaan rutin dan gaya hidup sehat.`;
      }

      // Update chat with result and recommendations
      setChat(prevChat => {
        const newChat = [...prevChat];
        newChat[newChat.length - 1] = {
          role: { system: null },
          content: `# Hasil Analisis Risiko Penyakit Jantung

Berdasarkan data yang Anda berikan, tingkat risiko penyakit jantung Anda adalah:
## ${result.risk_level === "High risk" ? "🚨 RISIKO TINGGI" : "✅ RISIKO RENDAH"}

${recommendationMessage}

Terima kasih telah menggunakan Heartlyzer. Jika ingin melakukan analisis ulang, ketik "Mulai lagi".`
        };
        return newChat;
      });
    } catch (error) {
      console.error("Error processing prediction:", error);
      setChat(prevChat => {
        const newChat = [...prevChat];
        newChat[newChat.length - 1] = {
          role: { system: null },
          content: 'Terjadi kesalahan saat menganalisis data. Silakan coba lagi dengan mengetik "Mulai lagi".'
        };
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !AuthState.isAuthenticated) return;

    // Add user message to chat
    const userMessage = {
      role: { user: null },
      content: inputValue,
    };
    setChat(prevChat => [...prevChat, userMessage]);

    const processInput = () => {
      // If we're at the intro stage
      if (questionIndex === -1) {
        if (inputValue.toLowerCase() === "mulai") {
          // Start questionnaire
          setQuestionIndex(0);
        } else if (inputValue.toLowerCase() === "mulai lagi" && predictionResult) {
          // Reset and start over
          setQuestionIndex(-1);
          setUserResponses({});
          setPredictionResult(null);
          setChat([{
            role: { system: null },
            content: `Selamat datang kembali di Heartlyzer.

Saya akan membantu Anda mengevaluasi risiko penyakit jantung berdasarkan data kesehatan Anda. Ketik "Mulai" untuk melanjutkan.`
          }]);
        } else {
          // Invalid input for intro
          setChat(prevChat => [...prevChat, {
            role: { system: null },
            content: 'Untuk memulai analisis, ketik "Mulai".'
          }]);
        }
      }
      // If we're at the questionnaire stage
      else if (questionIndex >= 0 && questionIndex < questions.length) {
        const currentQuestion = questions[questionIndex];
        // Check if the answer is valid
        if (currentQuestion.validation(inputValue)) {
          let normalizedValue;

          // Process value based on question type
          if (currentQuestion.type === 'number') {
            normalizedValue = parseInt(inputValue);
          } else if (currentQuestion.type === 'boolean') {
            normalizedValue = currentQuestion.normalize(inputValue);
          } else if (currentQuestion.type === 'select') {
            normalizedValue = currentQuestion.normalize(inputValue);
          } else {
            normalizedValue = inputValue;
          }

          // Save response
          setUserResponses(prev => ({
            ...prev,
            [currentQuestion.id]: normalizedValue
          }));

          // Move to next question
          setQuestionIndex(questionIndex + 1);
        } else {
          // Invalid input for question
          setChat(prevChat => [...prevChat, {
            role: { system: null },
            content: `${currentQuestion.errorMsg}. Mohon jawab sesuai format yang diminta.`
          }]);
        }
      } else if (inputValue.toLowerCase() === "mulai lagi") {
        // Reset if user wants to start over after completion
        setQuestionIndex(-1);
        setUserResponses({});
        setPredictionResult(null);
        setChat([{
          role: { system: null },
          content: `Selamat datang kembali di Heartlyzer.

Saya akan membantu Anda mengevaluasi risiko penyakit jantung berdasarkan data kesehatan Anda. Ketik "Mulai" untuk melanjutkan.`
        }]);
      } else {
        // General response for other inputs after completion
        setChat(prevChat => [...prevChat, {
          role: { system: null },
          content: 'Analisis telah selesai. Jika ingin memulai analisis baru, ketik "Mulai lagi".'
        }]);
      }
    };

    // Process after a short delay to allow UI update
    setTimeout(processInput, 100);
    setInputValue('');
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800">heartlyzer</h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            Sistem analisis risiko penyakit jantung berdasarkan AI berbasis Machine Learning Berdasarkan dataset prediksi Jantung di Indonesia
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Login Banner - Show when not authenticated */}
            {!AuthState.isAuthenticated && (
              <div className="bg-indigo-700 px-6 py-10 text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Selamat Datang di Heartlyzer</h2>
                <p className="mb-6">Untuk menggunakan layanan analisis kesehatan jantung ini, silakan masuk terlebih dahulu.</p>
                <Button
                  onClick={login}
                  className="bg-white text-indigo-700 hover:bg-indigo-100 transition-colors shadow-md"
                >
                  Masuk dengan Internet Identity
                </Button>
              </div>
            )}

            {/* User Info - Show when authenticated */}
            {AuthState.isAuthenticated && (
              <div className="bg-indigo-700 px-6 py-3 text-white text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">ID: </span>
                    <span className="opacity-75 text-xs">
                      {userInfo?.principal ?
                        `${userInfo.principal.substring(0, 20)}...` :
                        "Loading..."
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Button
                      onClick={logout}
                      className="text-xs font-medium underline focus:outline-none"
                    >
                      Keluar
                    </Button>
                    <div className="w-2 h-2 rounded-full bg-green-400 ml-2 mr-2"></div>
                    <span>Connected to ICP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Indicator - Only show when authenticated */}
            {AuthState.isAuthenticated && questionIndex >= 0 && questionIndex < questions.length && (
              <div className="px-6 py-2 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pertanyaan {questionIndex + 1} dari {questions.length}</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Area - Only show when authenticated */}
            {AuthState.isAuthenticated ? (
              <div className="flex-1 h-[60vh] overflow-y-auto p-6 bg-gray-50" ref={chatBoxRef}>
                {chat.map((message, index) => {
                  const isUser = 'user' in message.role;
                  const timestamp = formatDate(new Date());

                  return (
                    <div key={index} className={`mb-6 ${isUser ? 'text-right' : 'text-left'}`}>
                      <div className="inline-block max-w-md">
                        <div className={`px-4 py-2 rounded-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-white shadow-md border border-gray-100'}`}>
                          <div className="mb-1 text-xs opacity-75">{isUser ? 'Anda' : 'heartlyzer'} · {timestamp}</div>
                          <div
                            className={`${isUser ? 'text-white' : 'text-gray-700'} whitespace-pre-wrap`}
                            dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>').replace(/#+\s*([^\n]+)/g, '<strong class="text-lg">$1</strong>') }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 h-[60vh] flex items-center justify-center p-6 bg-gray-50">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <h3 className="text-xl font-medium mb-2">Anda belum masuk</h3>
                  <p className="mb-4">Silakan masuk untuk mengakses layanan analisis kesehatan jantung</p>
                  <Button
                    onClick={login}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    Masuk Sekarang
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area - Only enable when authenticated */}
            <div className="border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex p-4">
                <input
                  type="text"
                  placeholder={!AuthState.isAuthenticated
                    ? "Silakan masuk terlebih dahulu..."
                    : questionIndex >= 0 && questionIndex < questions.length
                      ? `Jawab pertanyaan ${questionIndex + 1}...`
                      : "Ketik pesan Anda..."}
                  className="flex-1 border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading || !AuthState.isAuthenticated}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim() || !AuthState.isAuthenticated}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-r-lg px-6 py-3 font-medium transition-colors"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Kirim"}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2025 - {new Date().getFullYear()} heartlyzer · Powered by Internet Computer Protocol · LLaMA3 1.8B Model</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;