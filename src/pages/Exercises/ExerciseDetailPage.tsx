/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Trash2, 
    Edit, 
    AlertTriangle,
    Dumbbell,
    Target,
    Activity,
    Maximize,
    ShieldAlert,
    HelpCircle,
    Flame,
    Zap,
    Clock,
    Timer,
    Info,
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
    image?: string | null;
    difficulty_level: string;
    injury_risk_level?: string;
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

// Image générique de fitness en cas d'absence d'image de la BDD
const DEFAULT_EXERCISE_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000";

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
                        includes: [
                            { relation: 'equipments' },
                            { relation: 'primaryMuscles' },
                            { relation: 'secondaryMuscles' }
                        ]
                    }
                });

                const results = response.data?.data || response.data;

                if (Array.isArray(results) && results.length > 0) {
                    setExercise(results[0]);
                } else if (results && results.id) {
                    setExercise(results);
                } else {
                    setError("L'exercice demandé est introuvable.");
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
            default: return difficulty || 'N/A';
        }
    };

    const getDifficultyStylesForOverlay = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-orange-100 text-orange-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getRiskTranslation = (risk?: string) => {
        switch (risk) {
            case 'Low': return 'Faible';
            case 'Medium': return 'Modéré';
            case 'High': return 'Élevé';
            default: return 'Inconnu';
        }
    };

    const getRiskStyles = (risk?: string) => {
        switch (risk) {
            case 'Low': return 'text-emerald-600 bg-emerald-50 border border-emerald-200';
            case 'Medium': return 'text-amber-600 bg-amber-50 border border-amber-200';
            case 'High': return 'text-red-600 bg-red-50 border border-red-200';
            default: return 'text-slate-600 bg-slate-50 border border-slate-200';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse" aria-hidden="true">
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
                    <div className="h-96 bg-slate-200 rounded-2xl"></div>
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

    // Calculs des métriques
    const durationMinutes = Math.max(1, Math.round((exercise.recommended_duration_seconds || 0) / 60));
    const estimatedCalories = Math.round(durationMinutes * (exercise.estimated_calories_per_minutes || 0));

    // Calculs pour la répartition (Graphique Donut : Effort vs Repos)
    const workSeconds = exercise.recommended_duration_seconds || 60;
    const restSeconds = (exercise.recommended_rest_minutes || 0) * 60;
    const totalSeconds = workSeconds + restSeconds || 1;

    const workPct = Math.round((workSeconds / totalSeconds) * 100);
    const restPct = Math.round((restSeconds / totalSeconds) * 100);

    const donutGradient = `conic-gradient(
        #3b82f6 0% ${workPct}%, 
        #eab308 ${workPct}% 100%
    )`;

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
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer</span>
                    </button>
                </div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                
                {/* COLONNE GAUCHE : Infos principales */}
                <section aria-labelledby="exercise-title" className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                        
                        {/* EMPLACEMENT IMAGE / BANNIÈRE AVEC OVERLAY */}
                        <div className="w-full h-56 sm:h-72 bg-slate-900 relative flex items-end justify-start group">
                            <img 
                                src={exercise.image || DEFAULT_EXERCISE_IMAGE} 
                                alt={`Image de ${exercise.name}`} 
                                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700"
                            />
                            {/* Overlay dégradé */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            
                            {/* Texte en superposition */}
                            <div className="relative z-10 p-6 sm:p-8 w-full">
                                <h1 id="exercise-title" className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight capitalize drop-shadow-md">
                                    {exercise.name}
                                </h1>
                                <div className="flex flex-wrap gap-2 items-center mt-2">
                                    <span className="px-3 py-1 bg-blue-500/80 text-white backdrop-blur-md rounded-md text-xs font-bold capitalize shadow-sm border border-white/10">
                                        {exercise.category}
                                    </span>
                                    {exercise.sub_category && (
                                        <span className="px-3 py-1 bg-white/20 text-white backdrop-blur-md rounded-md text-xs font-bold capitalize shadow-sm border border-white/10">
                                            {exercise.sub_category}
                                        </span>
                                    )}
                                    <span className={`px-3 py-1 backdrop-blur-md rounded-md text-xs font-bold shadow-sm border border-white/10 ${getDifficultyStylesForOverlay(exercise.difficulty_level)}`}>
                                        {getDifficultyTranslation(exercise.difficulty_level)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contenu textuel de la carte */}
                        <div className="p-6 sm:p-8">
                            
                            {/* Anatomie, Biomécanique & Équipements */}
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-[#7B3FF2]" />
                                    Anatomie & Équipements
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                        <span className="font-medium text-slate-600 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500" /> Muscle principal
                                        </span>
                                        <span className="font-bold text-slate-900 capitalize">
                                            {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 
                                                ? exercise.primaryMuscles.map(m => m.name).join(', ') 
                                                : exercise.target_muscle}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                        <span className="font-medium text-slate-600 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-slate-400" /> Muscle secondaire
                                        </span>
                                        <span className="font-bold text-slate-900 capitalize">
                                            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 
                                                ? exercise.secondaryMuscles.map(m => m.name).join(', ') 
                                                : (exercise.secondary_muscle !== 'Aucun' ? exercise.secondary_muscle : 'N/A')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                        <span className="font-medium text-slate-600 flex items-center gap-2">
                                            <Maximize className="h-4 w-4 text-orange-500" /> Amplitude (ROM)
                                        </span>
                                        <span className="font-bold text-slate-900 capitalize">
                                            {exercise.range_of_motion === 'Full' ? 'Complète' : exercise.range_of_motion === 'Partial' ? 'Partielle' : exercise.range_of_motion || 'Non définie'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm pb-1">
                                        <span className="font-medium text-slate-600 flex items-center gap-2">
                                            <ShieldAlert className="h-4 w-4 text-red-500" /> Risque de blessure
                                        </span>
                                        <span className={`font-bold px-2.5 py-1 rounded-md text-xs ${getRiskStyles(exercise.injury_risk_level)}`}>
                                            {getRiskTranslation(exercise.injury_risk_level)}
                                        </span>
                                    </div>
                                </div>

                                {exercise.equipments && exercise.equipments.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <p className="text-sm font-medium text-slate-600 mb-3">Matériel requis :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {exercise.equipments.map(eq => (
                                                <span key={eq.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg capitalize">
                                                    <Dumbbell className="h-3.5 w-3.5 text-[#7B3FF2]" />
                                                    {eq.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Consignes & Instructions */}
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5 text-emerald-500" />
                                    Consignes d'exécution
                                </h2>
                                
                                {exercise.short_description && (
                                    <p className="text-sm font-medium text-slate-700 mb-4 pb-4 border-b border-slate-50">
                                        {exercise.short_description}
                                    </p>
                                )}
                                
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    {exercise.instructions || "Aucune consigne spécifique n'a encore été renseignée pour cet exercice. Veillez à toujours maintenir une posture droite, à engager votre sangle abdominale et à contrôler la phase excentrique de chaque mouvement."}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* COLONNE DROITE : Sidebar sticky */}
                <aside aria-label="Vue d'ensemble" className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-6 lg:sticky lg:top-8">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Vue d'ensemble</h2>
                    
                    {/* Carte Dépense Estimée */}
                    <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                            <Flame className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Dépense globale</p>
                            <p className="text-xl font-extrabold text-slate-900">{estimatedCalories} <span className="text-sm font-medium text-slate-500">kcal</span></p>
                        </div>
                    </div>

                    {/* Grille des 3 métriques clés */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-medium text-slate-600">Répétitions</span>
                            </div>
                            <span className="font-bold text-slate-900">{exercise.rep_range_min}-{exercise.rep_range_max}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-[#7B3FF2]" />
                                <span className="text-sm font-medium text-slate-600">Durée estimée</span>
                            </div>
                            <span className="font-bold text-slate-900">{durationMinutes} min</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Timer className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium text-slate-600">Temps de repos</span>
                            </div>
                            <span className="font-bold text-slate-900">{exercise.recommended_rest_minutes || 0} min</span>
                        </div>
                    </div>

                    {/* Donut Chart Ratio */}
                    <div className="p-5 border border-slate-100 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <Info className="h-4 w-4 text-slate-400" />
                            Ratio de séance
                        </h3>
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-28 h-28 shrink-0 rounded-full shadow-inner" style={{ background: donutGradient }}>
                                <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full"></div>
                            </div>
                            
                            <div className="space-y-3 w-full">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                                        <span className="text-slate-600 font-medium">Temps sous tension</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{workPct}%</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500"></span>
                                        <span className="text-slate-600 font-medium">Récupération</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{restPct}%</span>
                                </div>
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