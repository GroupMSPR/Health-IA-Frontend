import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Sparkles, 
    Activity, 
    Clock, 
    Target, 
    ChevronRight,
    AlertTriangle,
    Dumbbell,
    Info
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';
// IMPORT À ADAPTER SELON L'EMPLACEMENT DE TON CONTEXTE
import { useAuth } from '../../contexts/AuthContext'; 

interface Exercise {
    id: string;
    name: string;
    category: string;
    image?: string | null;
    difficulty_level: string;
    target_muscle: string;
    recommended_duration_seconds: number;
    // Donnée fusionnée depuis l'IA
    ai_confidence?: number; 
}

const DEFAULT_EXERCISE_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000";

export default function ExerciseIARecommendPage() {
    // Récupération de l'utilisateur courant depuis ton AuthContext
    const { user } = useAuth();
    
    const [recommendations, setRecommendations] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // On attend que les données de l'utilisateur soient chargées
        if (!user) return;

        const fetchRecommendations = async (user: any) => {
            setIsLoading(true);
            setError(null);

            try {
                // 1. Préparation du Body (Payload) avec les données du User
                // Calcul du BMI de secours si non fourni directement dans le user
                let calculatedBmi = user.bmi;
                if (!calculatedBmi && user.weight && user.height) {
                    calculatedBmi = user.weight / Math.pow(user.height / 100, 2);
                }

                const aiPayload = {
                    physical_activity_level: user.physical_activity_level || "moderate",
                    bmi: parseFloat((calculatedBmi || 22.0).toFixed(1)),
                    birthdate: user.birthdate || "2000-01-01",
                    // Respect de la clé exacte demandée par l'API (avec la faute de frappe "categorie")
                    favorite_exercise_categorie: user.favorite_exercise_category || user.favorite_exercise_categorie || "cardio"
                };

                // 2. Appel à l'IA pour obtenir les prédictions
                const aiResponse = await axios.post('/api/ai/recommend', aiPayload);
                const predictions = aiResponse.data?.predictions || [];

                if (!Array.isArray(predictions) || predictions.length === 0) {
                    throw new Error("L'IA n'a retourné aucune prédiction.");
                }

                // On prend le Top 5
                const top5Predictions = predictions.slice(0, 5);
                const exerciseNames = top5Predictions.map((p: any) => p.exercise);

                // 3. Récupération des détails complets depuis la BDD (Lomkit)
                const dbResponse = await axios.post('/api/exercises/search', {
                    search: {
                        filters: [
                            { field: 'name', operator: 'in', value: exerciseNames }
                        ]
                    }
                });

                const dbExercises = dbResponse.data?.data || dbResponse.data || [];

                // 4. Fusion des données IA (confidence) avec les données de la BDD
                const finalRecommendations = top5Predictions.map((pred: any) => {
                    // On cherche l'exercice complet correspondant
                    const dbData = dbExercises.find((ex: any) => 
                        ex.name.toLowerCase() === pred.exercise.toLowerCase()
                    );

                    if (dbData) {
                        return {
                            ...dbData,
                            ai_confidence: pred.confidence
                        };
                    } else {
                        // Fallback : Si l'exercice généré par l'IA n'existe pas en BDD
                        return {
                            id: `ai-mock-${Math.random()}`,
                            name: pred.exercise,
                            category: "Non catégorisé",
                            difficulty_level: "Inconnu",
                            target_muscle: "Multiples",
                            recommended_duration_seconds: 1200,
                            ai_confidence: pred.confidence
                        };
                    }
                });

                setRecommendations(finalRecommendations);

            } catch (err: any) {
                console.error("Erreur lors de la récupération des recommandations:", err);
                setError("Impossible de générer vos recommandations pour le moment.");
                toast.error("Échec de la connexion à l'IA.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations(user);
    }, [user]); // Le useEffect se relance si le user change

    const getDifficultyTranslation = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'Débutant';
            case 'Intermediate': return 'Intermédiaire';
            case 'Advanced': return 'Avancé';
            case 'Inconnu': return 'Adaptatif';
            default: return difficulty || 'N/A';
        }
    };

    const getDifficultyStyles = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
            case 'Intermediate': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            
            <nav aria-label="Navigation secondaire">
                <Link 
                    to="/exercises" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour aux exercices</span>
                </Link>
            </nav>

            <header className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-purple-50 text-[#7B3FF2] rounded-2xl mb-2 animate-bounce-slow">
                    <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Programme sur-mesure
                </h1>
                <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm sm:text-base">
                    Basé sur votre profil (IMC, âge, activité), voici les {recommendations.length > 0 ? recommendations.length : 5} exercices que notre IA a sélectionnés pour vous.
                </p>
            </header>

            {isLoading || !user ? (
                <div className="space-y-4" aria-busy="true" aria-label="Chargement des recommandations">
                    {[1, 2, 3, 4, 5].map((skeleton) => (
                        <div key={skeleton} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 animate-pulse">
                            <div className="w-full sm:w-48 h-32 bg-slate-200 rounded-xl shrink-0"></div>
                            <div className="flex-1 space-y-4 py-2">
                                <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                                <div className="flex gap-2">
                                    <div className="h-5 bg-slate-200 rounded-md w-20"></div>
                                    <div className="h-5 bg-slate-200 rounded-md w-24"></div>
                                </div>
                                <div className="h-4 bg-slate-200 rounded-md w-full mt-4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl flex flex-col items-center justify-center text-center gap-3 text-red-700">
                    <AlertTriangle className="h-8 w-8" />
                    <div>
                        <p className="font-bold text-lg">{error}</p>
                        <p className="text-sm mt-1 opacity-80">Assurez-vous que le serveur est bien démarré et que la route /api/ai/recommend est accessible.</p>
                    </div>
                </div>
            ) : recommendations.length === 0 ? (
                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-4">
                    <Dumbbell className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-700">Aucune recommandation disponible</h3>
                    <p className="text-slate-500 text-sm">Nous n'avons pas assez de données pour vous recommander des exercices pour le moment.</p>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    {recommendations.map((exercise, index) => {
                        const durationMinutes = Math.max(1, Math.round((exercise.recommended_duration_seconds || 60) / 60));
                        // L'API renvoie des scores très bas (ex: 0.115). On le met en valeur de façon propre.
                        const aiScore = exercise.ai_confidence ? (exercise.ai_confidence * 100).toFixed(1) : null;

                        return (
                            <article 
                                key={exercise.id} 
                                className="group bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-[#7B3FF2]/30 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col sm:flex-row"
                            >
                                {/* Image de l'exercice */}
                                <div className="w-full sm:w-56 h-48 sm:h-auto relative shrink-0 bg-slate-900 overflow-hidden">
                                    <img 
                                        src={exercise.image || DEFAULT_EXERCISE_IMAGE} 
                                        alt={exercise.name} 
                                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Numéro de la recommandation stylisé */}
                                    <div className="absolute top-4 left-4 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg text-white font-black text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden"></div>
                                </div>

                                {/* Détails de l'exercice */}
                                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {index === 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-[#7B3FF2] text-[10px] font-black uppercase tracking-wider rounded-lg border border-purple-100">
                                                <Sparkles className="h-3 w-3" />
                                                Meilleur Choix
                                            </span>
                                        )}
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getDifficultyStyles(exercise.difficulty_level)}`}>
                                            {getDifficultyTranslation(exercise.difficulty_level)}
                                        </span>
                                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold capitalize">
                                            {exercise.category}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-extrabold text-slate-900 capitalize mb-4 group-hover:text-[#7B3FF2] transition-colors">
                                        {exercise.name}
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 mb-4 sm:mb-0">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium capitalize">{exercise.target_muscle}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            <span className="font-medium">{durationMinutes} min</span>
                                        </div>
                                        {aiScore && (
                                            <div className="flex items-center gap-2" title="Score de recommandation IA">
                                                <Activity className="h-4 w-4 text-[#7B3FF2]" />
                                                <span className="font-bold text-[#7B3FF2]">Score IA : {aiScore}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Si l'ID contient 'ai-mock', c'est que l'IA a inventé un exercice qui n'est pas dans la BDD */}
                                    {exercise.id.startsWith('ai-mock') && (
                                        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-medium border border-amber-100">
                                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>Cet exercice suggéré par l'IA ne possède pas encore de page de détails complète dans votre base de données.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Bouton d'action à droite (desktop) / en bas (mobile) */}
                                <div className="p-5 sm:p-6 bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-100 flex items-center justify-center shrink-0">
                                    <Link 
                                        to={exercise.id.startsWith('ai-mock') ? '#' : `/exercises/${exercise.id}`}
                                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] ${
                                            exercise.id.startsWith('ai-mock') 
                                                ? 'opacity-50 cursor-not-allowed' 
                                                : 'hover:border-[#7B3FF2] text-slate-700 hover:text-[#7B3FF2]'
                                        }`}
                                    >
                                        <span>Détails</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}} />
        </main>
    );
}