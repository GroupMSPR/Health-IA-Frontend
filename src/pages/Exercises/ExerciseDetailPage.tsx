import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Clock, 
    Flame, 
    Zap, 
    Dumbbell, 
    Target, 
    Trash2, 
    Edit, 
    AlertTriangle,
    Activity
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface Exercise {
    id: string;
    name: string;
    difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
    recommended_duration_seconds: number;
    estimated_calories_per_minutes: number;
    rep_range_min: number;
    rep_range_max: number;
    category: string;
    target_muscle: string;
    secondary_muscle: string;
    short_description?: string;
}

export default function ExerciseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExerciseDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.post('/api/exercises/search', {
                    search: {
                        filters: [
                            { field: 'id', operator: 'in', value: [id] }
                        ],
                        limit: 10
                    }
                });

                const results = response.data?.data || response.data;

                if (Array.isArray(results) && results.length > 0) {
                    setExercise(results[0]); // On prend le premier exercice trouvé
                } else if (results && results.id) {
                    setExercise(results);
                } else {
                    setError("L'exercice demandé reste introuvable.");
                    toast.error("Exercice introuvable.");
                }
            } catch (err: any) {
                console.error("Erreur récupération détail exercice:", err);
                const msg = "Impossible de charger les détails de l'exercice.";
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExerciseDetail();
    }, [id]);

    const handleDelete = async () => {
        if (!exercise) return;
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'exercice "${exercise.name}" ?`)) return;

        try {
            await axios.delete('/api/exercises', { data: { resources: [exercise.id] } });
            toast.success("L'exercice a été supprimé avec succès.");
            navigate('/exercises');
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            toast.error("Impossible de supprimer cet exercice.");
        }
    };

    const getDifficultyTranslation = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'Débutant';
            case 'Intermediate': return 'Intermédiaire';
            case 'Advanced': return 'Avancé';
            default: return difficulty;
        }
    };

    const getDifficultyStyles = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-orange-100 text-orange-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse" aria-hidden="true">
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                <div className="h-12 bg-slate-200 rounded w-1/2"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl"></div>
                    <div className="h-64 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (error || !exercise) {
        return (
            <div className="max-w-7xl mx-auto p-5 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700" role="alert">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <div>
                    <p className="text-sm font-bold">{error || "Une erreur inconnue est survenue."}</p>
                    <Link to="/exercises" className="mt-2 inline-block text-sm underline font-medium hover:text-red-800">
                        Retourner à la liste des exercices
                    </Link>
                </div>
            </div>
        );
    }

    const durationMinutes = Math.max(1, Math.round((exercise.recommended_duration_seconds || 0) / 60));
    const estimatedCalories = Math.round(durationMinutes * (exercise.estimated_calories_per_minutes || 0));

    return (
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <nav aria-label="Navigation secondaire" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link 
                    to="/exercises" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour aux exercices</span>
                </Link>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Link 
                        to={`/exercises/${exercise.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-[#7B3FF2] text-slate-700 hover:text-[#7B3FF2] rounded-xl transition-all text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2]"
                    >
                        <Edit className="h-4 w-4" />
                        <span>Modifier</span>
                    </Link>
                    <button 
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer</span>
                    </button>
                </div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                
                <section aria-labelledby="exercise-title" className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
                    <div>
                        <div className="flex flex-wrap gap-2 items-center mb-3">
                            <span className="px-3 py-1 bg-blue-50 text-[#4A6BF0] rounded-md text-xs font-bold capitalize">
                                {exercise.category}
                            </span>
                            <span className={`px-3 py-1 rounded-md text-xs font-bold ${getDifficultyStyles(exercise.difficulty_level)}`}>
                                {getDifficultyTranslation(exercise.difficulty_level)}
                            </span>
                        </div>
                        <h1 id="exercise-title" className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
                            {exercise.name}
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                            <Target className="h-5 w-5 text-[#7B3FF2]" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Muscle principal</p>
                                <p className="text-sm font-bold text-slate-800 capitalize">{exercise.target_muscle}</p>
                            </div>
                        </div>
                            {exercise.secondary_muscle && (
                                <div className="flex-1 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <Activity className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Muscle secondaire</p>
                                        <p className="text-sm font-bold text-slate-800 capitalize">{exercise.secondary_muscle}</p>
                                    </div>
                                </div>
                            )}
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-3">
                        <h2 className="text-lg font-bold text-slate-800">Instructions d'exécution</h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {exercise.short_description || "Aucune consigne spécifique n'a encore été renseignée pour cet exercice. Veillez à toujours maintenir une posture droite, à engager votre sangle abdominale et à contrôler la phase excentrique de chaque mouvement."}
                        </p>
                    </div>
                </section>

                <section aria-label="Indicateurs de performance" className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Objectifs recommandés</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="p-3 bg-purple-50 text-[#7B3FF2] rounded-xl">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Durée recommandée</p>
                                <p className="text-base font-bold text-slate-900">{durationMinutes} min</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                                <Flame className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Dépense estimée</p>
                                <p className="text-base font-bold text-slate-900">{estimatedCalories} kcal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Plage de reps</p>
                                <p className="text-base font-bold text-slate-900">{exercise.rep_range_min} - {exercise.rep_range_max} répétitions</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#7B3FF2]/5 to-[#4A6BF0]/5 border border-[#7B3FF2]/10 rounded-xl p-4 text-center">
                        <Dumbbell className="h-6 w-6 text-[#7B3FF2] mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-800">Généré par Health-IA Coach</p>
                        <p className="text-[11px] text-slate-500 mt-1">Ce profil d'exercice est ajusté dynamiquement selon vos objectifs de santé connectée.</p>
                    </div>
                </section>

            </div>
        </main>
    );
}