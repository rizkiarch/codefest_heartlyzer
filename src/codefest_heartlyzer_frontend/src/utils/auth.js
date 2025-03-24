import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from 'declarations/codefest_heartlyzer_backend/codefest_heartlyzer_backend.did.js';

const identityProvider = "https://identity.ic0.app";
const canisterId = process.env.CANISTER_ID_CODEFEST_HEARTLYZER_BACKEND;

export const createActor = (canisterId, options) => {
    const agent = new HttpAgent({ ...options?.agentOptions });
    if (process.env.NODE_ENV !== "production") {
        agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }

    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options?.actorOptions,
    });
};

export const updateActor = async (setAuthState, setUserInfo, setChat) => {
    try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();
        const identity = isAuthenticated ? authClient.getIdentity() : null;
        const actor = createActor(canisterId, identity ? { agentOptions: { identity } } : {});

        setAuthState((prev) => ({
            ...prev,
            actor,
            authClient,
            isAuthenticated,
        }));

        if (isAuthenticated) {
            try {
                const principal = identity.getPrincipal().toString();
                setUserInfo({ principal });

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

export const login = async (authClient, updateActor) => {
    try {
        if (!authClient) {
            await updateActor();
        }
        await authClient.login({
            identityProvider,
            onSuccess: async () => {
                await updateActor();
            },
        });
    } catch (error) {
        console.error("Failed to login:", error);
    }
};

export const logout = async (authClient, updateActor, setUserInfo, setChat, setQuestionIndex, setUserResponses, setPredictionResult) => {
    try {
        if (!authClient) {
            await updateActor();
        }
        await authClient.logout();
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