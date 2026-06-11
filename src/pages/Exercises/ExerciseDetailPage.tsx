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
    Activity,
    Timer,
    ShieldAlert,
    BoxSelect
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface Equipment {
    id: string;
    name: string;
}

interface Muscle {
    id: string;
    name: string;
}

interface Exercise {
    id: string;
    name: string;
    category: string;
    sub_category?: string;
    difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
    injury_risk_level?: 'Low' | 'Medium' | 'High' | string;
    target_muscle: string;
    secondary_muscle: string;
    range_of_motion?: string;
    recommended_duration_seconds: number;
    recommended_rest_minutes: number;
    estimated_calories_per_minutes: number;
    rep_range_min: number;
    rep_range_max: number;
    short_description?: string;
    instructions?: string;
    equipments?: Equipment[];
    primaryMuscles?: Muscle[];
    secondaryMuscles?: Muscle[];
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
                        // LOMKIT INCLUDES : Demande au backend de joindre ces tables
                        includes: [
                            { relation: 'equipments' },
                            { relation: 'primaryMuscles' },
                            { relation: 'secondaryMuscles' }
                        ],
                        limit: 10
                    }
                });

                const results = response.data?.data || response.data;

                if (Array.isArray(results) && results.length > 0) {
                    setExercise(results[0]);
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

    const getRiskTranslation = (risk?: string) => {
        switch (risk) {
            case 'Low': return 'Risque Faible';
            case 'Medium': return 'Risque Modéré';
            case 'High': return 'Risque Élevé';
            default: return 'Risque Inconnu';
        }
    };

    const getRiskStyles = (risk?: string) => {
        switch (risk) {
            case 'Low': return 'text-emerald-700 bg-emerald-150 border-emerald-200';
            case 'Medium': return 'text-amber-700 bg-amber-150 border-amber-200';
            case 'High': return 'text-red-700 bg-red-150 border-red-200';
            default: return 'text-slate-700 bg-slate-150 border-slate-200';
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
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
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
                        to={`/exercise/${exercise.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-[#7B3FF2] text-slate-700 hover:text-[#7B3FF2] rounded-xl transition-all text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2]"
                    >
                        <Edit className="h-4 w-4" />
                        <span>Modifier</span>
                    </Link>
                    <button 
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-150 text-red-700 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer</span>
                    </button>
                </div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                
                <section aria-labelledby="exercise-title" className="lg:col-span-2 space-y-6 lg:space-y-8">
                    
                    {/* Bloc Principal d'Informations */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
                        <div>
                            <div className="flex flex-wrap gap-2 items-center mb-3">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold capitalize">
                                    {exercise.category}
                                </span>
                                {exercise.sub_category && (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold capitalize">
                                        {exercise.sub_category}
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-md text-xs font-bold ${getDifficultyStyles(exercise.difficulty_level)}`}>
                                    {getDifficultyTranslation(exercise.difficulty_level)}
                                </span>
                                <span className={`px-3 py-1 border rounded-md text-xs font-bold flex items-center gap-1 ${getRiskStyles(exercise.injury_risk_level)}`}>
                                    <ShieldAlert className="h-3 w-3" />
                                    {getRiskTranslation(exercise.injury_risk_level)}
                                </span>
                            </div>
                            <h1 id="exercise-title" className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
                                {exercise.name}
                            </h1>
                            {exercise.short_description && (
                                <p className="mt-2 text-slate-600 text-sm font-medium">
                                    {exercise.short_description}
                                </p>
                            )}
                        </div>

                        {/* Bloc Anatomie & Equipements */}
                        <div className="border-t border-slate-100 pt-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-[#7B3FF2]" />
                                <span>Focus Musculaire & Équipement</span>
                            </h2>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                                    <Target className="h-5 w-5 text-[#7B3FF2]" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Muscle principal</p>
                                        <p className="text-sm font-bold text-slate-800 capitalize">
                                            {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 
                                                ? exercise.primaryMuscles.map(m => m.name).join(', ') 
                                                : exercise.target_muscle}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <Activity className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Muscle secondaire</p>
                                        <p className="text-sm font-bold text-slate-800 capitalize">
                                            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 
                                                ? exercise.secondaryMuscles.map(m => m.name).join(', ') 
                                                : (exercise.secondary_muscle !== 'Aucun' ? exercise.secondary_muscle : 'N/A')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <BoxSelect className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Amplitude (ROM)</p>
                                        <p className="text-sm font-bold text-slate-800 capitalize">
                                            {exercise.range_of_motion === 'Full' ? 'Complète' : exercise.range_of_motion === 'Partial' ? 'Partielle' : exercise.range_of_motion || 'Non définie'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Liste des équipements avec des petits badges */}
                            {exercise.equipments && exercise.equipments.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-xs font-medium text-slate-500 mb-2">Équipements requis :</p>
                                    <div className="flex flex-wrap gap-2">
                                        {exercise.equipments.map(eq => (
                                            <span key={eq.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg capitalize">
                                                <Dumbbell className="h-3.5 w-3.5 text-[#7B3FF2]" />
                                                {eq.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bloc Instructions */}
                        <div className="border-t border-slate-100 pt-6 space-y-3">
                            <h2 className="text-lg font-bold text-slate-800">Instructions d'exécution</h2>
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-xl border border-slate-100">
                                {exercise.instructions || "Aucune consigne spécifique n'a encore été renseignée pour cet exercice."}
                            </div>
                        </div>
                    </div>
                </section>

                <aside aria-label="Indicateurs de performance" className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-6 lg:sticky lg:top-8">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cibles recommandées</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Plage de répétitions</p>
                                <p className="text-base font-bold text-slate-900">{exercise.rep_range_min} - {exercise.rep_range_max} reps</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="p-3 bg-purple-50 text-[#7B3FF2] rounded-xl">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Durée d'effort</p>
                                <p className="text-base font-bold text-slate-900">{durationMinutes} min</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                <Timer className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Temps de repos</p>
                                <p className="text-base font-bold text-slate-900">{exercise.recommended_rest_minutes || 0} min</p>
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
                    </div>

                    <div className="bg-gradient-to-br from-[#7B3FF2]/5 to-[#4A6BF0]/5 border border-[#7B3FF2]/10 rounded-xl p-4 text-center">
                        <Dumbbell className="h-6 w-6 text-[#7B3FF2] mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-800">Généré par Health-IA Coach</p>
                        <p className="text-[11px] text-slate-500 mt-1">Ce profil d'exercice s'adapte à la condition physique de vos utilisateurs.</p>
                    </div>
                </aside>

            </div>
        </main>
    );
}