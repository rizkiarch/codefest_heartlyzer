import { useEffect, useRef, useState } from 'react';
import { codefest_heartlyzer_backend } from 'declarations/codefest_heartlyzer_backend';

function App() {
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(-1); // -1 for intro, 0+ for questions
  const [userResponses, setUserResponses] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const chatBoxRef = useRef();

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
    {
      id: 'gender',
      question: 'Apa jenis kelamin Anda?',
      explanation: 'Pria memiliki risiko lebih tinggi terkena penyakit jantung dibandingkan wanita sebelum menopause.',
      example: 'Ketik: Male atau Female',
      type: 'select',
      options: ['Male', 'Female'],
      validation: (value) => ['male', 'female'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Male atau Female',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'region',
      question: 'Apakah Anda tinggal di daerah perkotaan atau pedesaan?',
      explanation: 'Lingkungan tempat tinggal dapat mempengaruhi faktor risiko seperti tingkat stres dan polusi.',
      example: 'Ketik: Urban (perkotaan) atau Rural (pedesaan)',
      type: 'select',
      options: ['Urban', 'Rural'],
      validation: (value) => ['urban', 'rural'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Urban atau Rural',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'income_level',
      question: 'Bagaimana tingkat pendapatan Anda?',
      explanation: 'Status sosial ekonomi dapat mempengaruhi akses ke layanan kesehatan dan pola makan.',
      example: 'Ketik: Low (rendah), Middle (menengah), atau High (tinggi)',
      type: 'select',
      options: ['Low', 'Middle', 'High'],
      validation: (value) => ['low', 'middle', 'high'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Low, Middle, atau High',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'hypertension',
      question: 'Apakah Anda memiliki hipertensi (tekanan darah tinggi)?',
      explanation: 'Hipertensi meningkatkan risiko penyakit jantung dengan merusak pembuluh darah dari waktu ke waktu.',
      example: 'Ketik: Ya atau Tidak',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    },
    {
      id: 'diabetes',
      question: 'Apakah Anda menderita diabetes?',
      explanation: 'Diabetes dapat merusak pembuluh darah dan saraf yang mengendalikan jantung.',
      example: 'Ketik: Ya atau Tidak',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    },
    {
      id: 'cholesterol_level',
      question: 'Berapa kadar kolesterol total Anda? (dalam mg/dL)',
      explanation: 'Kolesterol tinggi dapat menyebabkan penumpukan plak di arteri, meningkatkan risiko penyakit jantung.',
      example: 'Contoh: 200 (nilai normal <200, batas tinggi 200-239, tinggi ≥240)',
      type: 'number',
      validation: (value) => value >= 100 && value <= 300,
      errorMsg: 'Masukkan nilai antara 100-300 mg/dL',
    },
    {
      id: 'obesity',
      question: 'Apakah Anda mengalami obesitas? (BMI ≥ 30)',
      explanation: 'Obesitas meningkatkan risiko hipertensi, diabetes, dan kolesterol tinggi.',
      example: 'Ketik: Ya atau Tidak (BMI = berat (kg) / tinggi² (m))',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    },
    {
      id: 'waist_circumference',
      question: 'Berapa lingkar pinggang Anda? (dalam cm)',
      explanation: 'Lingkar pinggang yang besar (>90cm untuk pria atau >80cm untuk wanita di Asia) berkaitan dengan risiko penyakit kardiovaskular.',
      example: 'Contoh: 85',
      type: 'number',
      validation: (value) => value >= 50 && value <= 150,
      errorMsg: 'Masukkan nilai antara 50-150 cm',
    },
    {
      id: 'family_history',
      question: 'Apakah ada riwayat penyakit jantung dalam keluarga Anda?',
      explanation: 'Riwayat keluarga dengan penyakit jantung meningkatkan risiko Anda mengalami kondisi yang sama.',
      example: 'Ketik: Ya atau Tidak',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    },
    {
      id: 'smoking_status',
      question: 'Bagaimana status merokok Anda?',
      explanation: 'Merokok merusak pembuluh darah dan mengurangi kadar oksigen dalam darah.',
      example: 'Ketik: Never (tidak pernah), Past (pernah), atau Current (saat ini)',
      type: 'select',
      options: ['Never', 'Past', 'Current'],
      validation: (value) => ['never', 'past', 'current'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Never, Past, atau Current',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'alcohol_consumption',
      question: 'Bagaimana tingkat konsumsi alkohol Anda?',
      explanation: 'Konsumsi alkohol berlebihan dapat meningkatkan tekanan darah dan risiko penyakit jantung.',
      example: 'Ketik: None (tidak), Moderate (sedang), atau High (tinggi)',
      type: 'select',
      options: ['None', 'Moderate', 'High'],
      validation: (value) => ['none', 'moderate', 'high'].includes(value.toLowerCase()),
      errorMsg: 'Pilih None, Moderate, atau High',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'physical_activity',
      question: 'Bagaimana tingkat aktivitas fisik Anda?',
      explanation: 'Aktivitas fisik teratur membantu menjaga kesehatan jantung dan mengurangi risiko.',
      example: 'Ketik: Low (rendah), Moderate (sedang), atau High (tinggi)',
      type: 'select',
      options: ['Low', 'Moderate', 'High'],
      validation: (value) => ['low', 'moderate', 'high'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Low, Moderate, atau High',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'dietary_habits',
      question: 'Bagaimana pola makan Anda secara umum?',
      explanation: 'Pola makan sehat yang kaya sayuran, buah, dan rendah lemak jenuh penting untuk kesehatan jantung.',
      example: 'Ketik: Healthy (sehat) atau Unhealthy (tidak sehat)',
      type: 'select',
      options: ['Healthy', 'Unhealthy'],
      validation: (value) => ['healthy', 'unhealthy'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Healthy atau Unhealthy',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'air_pollution_exposure',
      question: 'Bagaimana tingkat paparan polusi udara di lingkungan Anda?',
      explanation: 'Paparan polusi udara jangka panjang dikaitkan dengan peningkatan risiko penyakit kardiovaskular.',
      example: 'Ketik: Low (rendah), Moderate (sedang), atau High (tinggi)',
      type: 'select',
      options: ['Low', 'Moderate', 'High'],
      validation: (value) => ['low', 'moderate', 'high'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Low, Moderate, atau High',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'stress_level',
      question: 'Bagaimana tingkat stres Anda?',
      explanation: 'Stres kronis dapat meningkatkan tekanan darah dan kadar hormon stres yang mempengaruhi kesehatan jantung.',
      example: 'Ketik: Low (rendah), Moderate (sedang), atau High (tinggi)',
      type: 'select',
      options: ['Low', 'Moderate', 'High'],
      validation: (value) => ['low', 'moderate', 'high'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Low, Moderate, atau High',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'sleep_hours',
      question: 'Berapa rata-rata jam tidur Anda per malam?',
      explanation: 'Kualitas tidur yang baik penting untuk pemulihan jantung dan pembuluh darah.',
      example: 'Contoh: 7',
      type: 'number',
      validation: (value) => value >= 3 && value <= 12,
      errorMsg: 'Masukkan nilai antara 3-12 jam',
    },
    {
      id: 'blood_pressure_systolic',
      question: 'Berapa tekanan darah sistolik Anda? (angka atas, dalam mmHg)',
      explanation: 'Tekanan darah tinggi adalah faktor risiko utama penyakit jantung. Sistolik normal <120 mmHg.',
      example: 'Contoh: 120',
      type: 'number',
      validation: (value) => value >= 90 && value <= 200,
      errorMsg: 'Masukkan nilai antara 90-200 mmHg',
    },
    {
      id: 'blood_pressure_diastolic',
      question: 'Berapa tekanan darah diastolik Anda? (angka bawah, dalam mmHg)',
      explanation: 'Diastolik normal <80 mmHg. Kedua nilai tekanan darah penting untuk kesehatan jantung.',
      example: 'Contoh: 80',
      type: 'number',
      validation: (value) => value >= 60 && value <= 120,
      errorMsg: 'Masukkan nilai antara 60-120 mmHg',
    },
    {
      id: 'fasting_blood_sugar',
      question: 'Berapa kadar gula darah puasa Anda? (dalam mg/dL)',
      explanation: 'Kadar gula darah puasa normal <100 mg/dL. Kadar tinggi dapat menunjukkan risiko diabetes.',
      example: 'Contoh: 95',
      type: 'number',
      validation: (value) => value >= 70 && value <= 200,
      errorMsg: 'Masukkan nilai antara 70-200 mg/dL',
    },
    {
      id: 'cholesterol_hdl',
      question: 'Berapa kadar kolesterol HDL (kolesterol baik) Anda? (dalam mg/dL)',
      explanation: 'HDL tinggi (>60 mg/dL) bersifat protektif terhadap penyakit jantung.',
      example: 'Contoh: 50',
      type: 'number',
      validation: (value) => value >= 20 && value <= 100,
      errorMsg: 'Masukkan nilai antara 20-100 mg/dL',
    },
    {
      id: 'cholesterol_ldl',
      question: 'Berapa kadar kolesterol LDL (kolesterol jahat) Anda? (dalam mg/dL)',
      explanation: 'LDL tinggi (>100 mg/dL) meningkatkan risiko penyakit jantung.',
      example: 'Contoh: 120',
      type: 'number',
      validation: (value) => value >= 50 && value <= 200,
      errorMsg: 'Masukkan nilai antara 50-200 mg/dL',
    },
    {
      id: 'triglycerides',
      question: 'Berapa kadar trigliserida Anda? (dalam mg/dL)',
      explanation: 'Trigliserida tinggi (>150 mg/dL) dapat meningkatkan risiko penyakit jantung.',
      example: 'Contoh: 140',
      type: 'number',
      validation: (value) => value >= 50 && value <= 300,
      errorMsg: 'Masukkan nilai antara 50-300 mg/dL',
    },
    {
      id: 'ekg_results',
      question: 'Bagaimana hasil EKG (elektrokardiogram) terakhir Anda?',
      explanation: 'EKG dapat mendeteksi masalah jantung seperti aritmia atau tanda serangan jantung sebelumnya.',
      example: 'Ketik: Normal atau Abnormal',
      type: 'select',
      options: ['Normal', 'Abnormal'],
      validation: (value) => ['normal', 'abnormal'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Normal atau Abnormal',
      normalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },
    {
      id: 'previous_heart_disease',
      question: 'Apakah Anda pernah didiagnosis dengan penyakit jantung sebelumnya?',
      explanation: 'Riwayat penyakit jantung meningkatkan risiko masalah jantung di masa depan.',
      example: 'Ketik: Ya atau Tidak',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    },
    {
      id: 'medication_usage',
      question: 'Apakah Anda menggunakan obat-obatan untuk kondisi jantung?',
      explanation: 'Pengobatan dapat mengendalikan faktor risiko dan mencegah perkembangan penyakit jantung.',
      example: 'Ketik: Ya atau Tidak',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    },
    {
      id: 'participated_in_free_screening',
      question: 'Apakah Anda pernah mengikuti program skrining kesehatan jantung gratis?',
      explanation: 'Skrining jantung dapat membantu deteksi dini masalah jantung.',
      example: 'Ketik: Ya atau Tidak',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    },
    {
      id: 'heart_attack',
      question: 'Apakah Anda pernah mengalami serangan jantung sebelumnya?',
      explanation: 'Riwayat serangan jantung meningkatkan risiko serangan jantung berikutnya.',
      example: 'Ketik: Ya atau Tidak',
      type: 'boolean',
      validation: (value) => ['ya', 'tidak', 'yes', 'no', 'true', 'false'].includes(value.toLowerCase()),
      errorMsg: 'Pilih Ya atau Tidak',
      normalize: (value) => ['ya', 'yes', 'true'].includes(value.toLowerCase()),
    }
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
        {
          name: "Rumah Sakit Jantung Diagram",
          location: "Jakarta",
          specialist: "Spesialis kardiologi intervensi",
          contact: "(021) 30061114",
        },
        {
          name: "Rumah Sakit Umum Pusat Dr. Sardjito",
          location: "Yogyakarta",
          specialist: "Pusat kardiologi terkemuka di Jawa Tengah",
          contact: "(0274) 587333",
        },
        {
          name: "Rumah Sakit Umum Pusat Dr. Hasan Sadikin",
          location: "Bandung",
          specialist: "Pusat rujukan jantung di Jawa Barat",
          contact: "(022) 2034953",
        },
        {
          name: "Rumah Sakit Umum Pusat Dr. Wahidin Sudirohusodo",
          location: "Makassar",
          specialist: "Pusat rujukan kardiovaskular di Indonesia Timur",
          contact: "(0411) 584677",
        }
      ],
      advice: "Segera konsultasikan hasil ini dengan dokter spesialis jantung. Jangan menunda pemeriksaan medis lebih lanjut. Perubahan gaya hidup HARUS segera dilakukan bersamaan dengan konsultasi medis profesional."
    },
    low_risk: {
      title: "Rekomendasi untuk Menjaga Kesehatan Jantung",
      preventions: [
        {
          category: "Pola Makan",
          tips: [
            "Terapkan pola makan DASH (Dietary Approaches to Stop Hypertension) atau Mediterania",
            "Batasi konsumsi garam hingga <5g per hari",
            "Konsumsi makanan kaya serat, buah, sayuran, dan biji-bijian utuh",
            "Batasi lemak jenuh dan trans, pilih lemak sehat seperti minyak zaitun dan alpukat",
            "Perbanyak konsumsi ikan berlemak (salmon, makarel) yang kaya omega-3",
          ]
        },
        {
          category: "Aktivitas Fisik",
          tips: [
            "Lakukan minimal 150 menit aktivitas fisik intensitas sedang per minggu",
            "Lakukan latihan kardio (jalan cepat, berenang, bersepeda) 3-5 kali seminggu",
            "Tambahkan latihan kekuatan 2 kali seminggu",
            "Hindari duduk terlalu lama, lakukan peregangan setiap 30-60 menit",
          ]
        },
        {
          category: "Manajemen Stres",
          tips: [
            "Praktikkan teknik relaksasi seperti meditasi mindfulness",
            "Latihan pernapasan dalam selama 10 menit setiap hari",
            "Prioritaskan tidur berkualitas 7-8 jam per malam",
            "Jaga keseimbangan kehidupan kerja dan pribadi",
          ]
        },
        {
          category: "Pemeriksaan Rutin",
          tips: [
            "Periksa tekanan darah secara teratur",
            "Lakukan tes kolesterol setahun sekali",
            "Periksa gula darah secara berkala",
            "Skrining jantung sesuai rekomendasi dokter",
          ]
        }
      ],
      advice: "Meskipun risiko Anda rendah, tetap penting untuk menjaga kesehatan jantung dengan gaya hidup sehat. Konsultasikan dengan dokter untuk pemeriksaan rutin sesuai usia dan faktor risiko Anda."
    }
  };

  // Fetch user principal on component mount
  useEffect(() => {
    const getPrincipal = async () => {
      try {
        const principal = await Heartlyzer_backend.get_principal();
        setUserInfo({ principal });

        // Add welcome message after getting principal
        setChat([{
          role: { system: null },
          content: `Selamat datang di Heartlyzer, sistem analisis risiko penyakit jantung berbasis AI.

Saya akan membantu Anda mengevaluasi risiko penyakit jantung berdasarkan data kesehatan Anda. Anda akan menjawab beberapa pertanyaan satu per satu, dan setiap jawaban Anda akan disimpan untuk analisis.

Proses ini membutuhkan sekitar 5-10 menit. Semua data yang Anda berikan bersifat rahasia dan hanya digunakan untuk perhitungan risiko.

Siap untuk memulai? Ketik "Mulai" untuk melanjutkan.`
        }]);
      } catch (err) {
        console.error("Failed to get principal:", err);
      }
    };

    getPrincipal();
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
    if (!inputValue.trim() || isLoading) return;

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
            Sistem analisis risiko penyakit jantung berdasarkan AI dengan model LLaMA3
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* User Info */}
            {userInfo && (
              <div className="bg-indigo-700 px-6 py-3 text-white text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">ID: </span>
                    <span className="opacity-75 text-xs">{userInfo.principal.substring(0, 20)}...</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                    <span>Connected to ICP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            {questionIndex >= 0 && questionIndex < questions.length && (
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

            {/* Chat Area */}
            <div className="flex-1 h-[60vh] overflow-y-auto p-6 bg-gray-50" ref={chatBoxRef}>
              {chat.map((message, index) => {
                const isUser = 'user' in message.role;
                const timestamp = formatDate(new Date());

                return (
                  // <div key={index} className={`mb-6 ${isUser ? 'text-right' : 'text-left'}`}>
                  //   <div className="inline-block max-w-md">
                  //     <div className={`px-4 py-2 rounded-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-white shadow-md border border-gray-100'}`}>
                  //       <div className="mb-1 text-xs opacity-75">{isUser ? 'Anda' : 'heartlyzer'} · {timestamp}</div>
                  //       <div
                  //         className={`${isUser ? 'text-white' : 'text-gray-700'} whitespace-pre-wrap`}
                  //         dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>').replace(/#+\s*([^\n]+)/g, '<strong class="text-lg">$1</strong>') }}
                  //       />
                  //     </div>
                  //   </div>
                  // </div>
                  <div key={key} className={`mb-6 ${isUser ? 'text-right' : 'text-left'}`}>
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

            {/* Input Area */}
            <div className="border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex p-4">
                <input
                  type="text"
                  placeholder={questionIndex >= 0 && questionIndex < questions.length ?
                    `Jawab pertanyaan ${questionIndex + 1}...` :
                    "Ketik pesan Anda..."}
                  className="flex-1 border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
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
            <p>© 2025 heartlyzer · Powered by Internet Computer Protocol · LLaMA3 1.8B Model</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;