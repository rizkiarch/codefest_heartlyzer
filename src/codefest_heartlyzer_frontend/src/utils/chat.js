import { codefest_heartlyzer_backend } from 'declarations/codefest_heartlyzer_backend';

export const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
};

export const processPrediction = async (userResponses, setChat, setIsLoading, setPredictionResult, recommendations) => {
    try {
        setIsLoading(true);

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
        ];

        for (let i = 1; i < analysisSteps.length; i++) {
            setTimeout(() => {
                setChat(prevChat => [...prevChat, {
                    role: { system: null },
                    content: analysisSteps[i]
                }]);
            }, i * 2000);
        }

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

        const result = await codefest_heartlyzer_backend.train_and_predict(predictionInput);
        setPredictionResult(result);

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

export const handleSubmit = (e, inputValue, isLoading, isAuthenticated, questionIndex, questions, setChat, setInputValue, setQuestionIndex, setUserResponses, predictionResult, setPredictionResult) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isAuthenticated) return;

    const userMessage = {
        role: { user: null },
        content: inputValue,
    };
    setChat(prevChat => [...prevChat, userMessage]);

    const processInput = () => {
        if (questionIndex === -1) {
            if (inputValue.toLowerCase() === "mulai") {
                setQuestionIndex(0);
            } else if (inputValue.toLowerCase() === "mulai lagi" && predictionResult) {
                setQuestionIndex(-1);
                setUserResponses({});
                setPredictionResult(null);
                setChat([{
                    role: { system: null },
                    content: `Selamat datang kembali di Heartlyzer.

Saya akan membantu Anda mengevaluasi risiko penyakit jantung berdasarkan data kesehatan Anda. Ketik "Mulai" untuk melanjutkan.`
                }]);
            } else {
                setChat(prevChat => [...prevChat, {
                    role: { system: null },
                    content: 'Untuk memulai analisis, ketik "Mulai".'
                }]);
            }
        } else if (questionIndex >= 0 && questionIndex < questions.length) {
            const currentQuestion = questions[questionIndex];
            if (currentQuestion.validation(inputValue)) {
                let normalizedValue;

                if (currentQuestion.type === 'number') {
                    normalizedValue = parseInt(inputValue);
                } else if (currentQuestion.type === 'boolean') {
                    normalizedValue = currentQuestion.normalize(inputValue);
                } else if (currentQuestion.type === 'select') {
                    normalizedValue = currentQuestion.normalize(inputValue);
                } else {
                    normalizedValue = inputValue;
                }

                setUserResponses(prev => ({
                    ...prev,
                    [currentQuestion.id]: normalizedValue
                }));

                setQuestionIndex(questionIndex + 1);
            } else {
                setChat(prevChat => [...prevChat, {
                    role: { system: null },
                    content: `${currentQuestion.errorMsg}. Mohon jawab sesuai format yang diminta.`
                }]);
            }
        } else if (inputValue.toLowerCase() === "mulai lagi") {
            setQuestionIndex(-1);
            setUserResponses({});
            setPredictionResult(null);
            setChat([{
                role: { system: null },
                content: `Selamat datang kembali di Heartlyzer.

Saya akan membantu Anda mengevaluasi risiko penyakit jantung berdasarkan data kesehatan Anda. Ketik "Mulai" untuk melanjutkan.`
            }]);
        } else {
            setChat(prevChat => [...prevChat, {
                role: { system: null },
                content: 'Analisis telah selesai. Jika ingin memulai analisis baru, ketik "Mulai lagi".'
            }]);
        }
    };

    setTimeout(processInput, 100);
    setInputValue('');
};