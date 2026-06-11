import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Save, 
    Dumbbell, 
    Clock, 
    Flame, 
    Target,
    HelpCircle,
    CheckSquare,
    Square,
    Timer,
    AlertTriangle
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface FormState {
    name: string;
    category: string;
    sub_category: string;
    difficulty_level: string;
    injury_risk_level: string;
    target_muscle_id: string;
    secondary_muscle_id: string;
    range_of_motion: string;
    rep_range_min: number;
    rep_range_max: number;
    recommended_duration_seconds: number;
    recommended_rest_minutes: number;
    estimated_calories_per_minutes: number;
    short_description: string;
    instructions: string;
}

interface ItemDefinition {
    id: string;
    name: string;
}

export default function ExerciseEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Listes globales de définition
    const [availableEquipments, setAvailableEquipments] = useState<ItemDefinition[]>([]);
    const [availableMuscles, setAvailableMuscles] = useState<ItemDefinition[]>([]);
    
    // État des sélections d'équipements
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);

    const [form, setForm] = useState<FormState>({
        name: '',
        category: 'Strength',
        sub_category: '',
        difficulty_level: 'Beginner',
        injury_risk_level: 'Low',
        target_muscle_id: '',
        secondary_muscle_id: '',
        range_of_motion: 'Full',
        rep_range_min: 8,
        rep_range_max: 12,
        recommended_duration_seconds: 60,
        recommended_rest_minutes: 1,
        estimated_calories_per_minutes: 5,
        short_description: '',
        instructions: ''
    });

    useEffect(() => {
        const loadAllData = async () => {
            if (!id) return;
            setIsLoadingData(true);
            setError(null);

            try {
                // 1. Récupération des listes globales ET des détails de l'exercice actuel avec ses relations
                const [equipmentsRes, musclesRes, exerciseRes] = await Promise.all([
                    axios.post('/api/equipments/search', { search: { limit: 50 } }),
                    axios.post('/api/muscles/search', { search: { limit: 50 } }),
                    axios.post('/api/exercises/search', {
                        search: {
                            filters: [{ field: 'id', operator: 'in', value: [id] }],
                            includes: [
                                { relation: 'equipments' },
                                { relation: 'primaryMuscles' },
                                { relation: 'secondaryMuscles' }
                            ],
                            limit: 10
                        }
                    })
                ]);

                // Injection des dictionnaires d'équipements et muscles
                const eqData = equipmentsRes.data?.data || equipmentsRes.data;
                if (Array.isArray(eqData)) setAvailableEquipments(eqData);

                const musData = musclesRes.data?.data || musclesRes.data;
                if (Array.isArray(musData)) setAvailableMuscles(musData);

                // Extraction de l'exercice recherché
                const exerciseResults = exerciseRes.data?.data || exerciseRes.data;
                const currentExercise = Array.isArray(exerciseResults) ? exerciseResults[0] : exerciseResults;

                if (!currentExercise || !currentExercise.id) {
                    setError("L'exercice à modifier est introuvable.");
                    return;
                }

                // 2. Pré-remplissage du formulaire et des cases à cocher
                setForm({
                    name: currentExercise.name || '',
                    category: currentExercise.category || 'Strength',
                    sub_category: currentExercise.sub_category || '',
                    difficulty_level: currentExercise.difficulty_level || 'Beginner',
                    injury_risk_level: currentExercise.injury_risk_level || 'Low',
                    target_muscle_id: currentExercise.primaryMuscles?.[0]?.id || '',
                    secondary_muscle_id: currentExercise.secondaryMuscles?.[0]?.id || '',
                    range_of_motion: currentExercise.range_of_motion || 'Full',
                    rep_range_min: currentExercise.rep_range_min ?? 8,
                    rep_range_max: currentExercise.rep_range_max ?? 12,
                    recommended_duration_seconds: currentExercise.recommended_duration_seconds ?? 60,
                    recommended_rest_minutes: currentExercise.recommended_rest_minutes ?? 1,
                    estimated_calories_per_minutes: currentExercise.estimated_calories_per_minutes ?? 5,
                    short_description: currentExercise.short_description || '',
                    instructions: currentExercise.instructions || ''
                });

                // Pré-cocher les équipements actuellement liés
                if (Array.isArray(currentExercise.equipments)) {
                    setSelectedEquipmentIds(currentExercise.equipments.map((e: any) => e.id));
                }

            } catch (err) {
                console.error("Erreur lors du chargement des données d'édition:", err);
                setError("Impossible de charger les données de l'exercice.");
            } finally {
                setIsLoadingData(false);
            }
        };

        loadAllData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleToggleEquipment = (equipmentId: string) => {
        setSelectedEquipmentIds(prev => 
            prev.includes(equipmentId) ? prev.filter(item => item !== equipmentId) : [...prev, equipmentId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.name.trim() || !form.instructions.trim()) {
            toast.error("Veuillez remplir tous les champs obligatoires (*)");
            return;
        }

        setIsSubmitting(true);

        try {
            const targetMuscleObj = availableMuscles.find(m => m.id === form.target_muscle_id);
            const secondaryMuscleObj = availableMuscles.find(m => m.id === form.secondary_muscle_id);

            // 3. Payload Lomkit REST optimisé avec l'opération "update" et la synchronisation des pivots via "sync"
            const payload = {
                mutate: [
                    {
                        operation: "update",
                        key: id, // L'ID de l'exercice à modifier
                        attributes: {
                            name: form.name,
                            category: form.category,
                            sub_category: form.sub_category || 'Général',
                            difficulty_level: form.difficulty_level,
                            injury_risk_level: form.injury_risk_level,
                            target_muscle: targetMuscleObj ? targetMuscleObj.name : 'Aucun', 
                            secondary_muscle: secondaryMuscleObj ? secondaryMuscleObj.name : 'Aucun', 
                            range_of_motion: form.range_of_motion,
                            equipment: 'Aucun',
                            rep_range_min: form.rep_range_min,
                            rep_range_max: form.rep_range_max,
                            recommended_duration_seconds: form.recommended_duration_seconds,
                            recommended_rest_minutes: form.recommended_rest_minutes,
                            estimated_calories_per_minutes: form.estimated_calories_per_minutes,
                            short_description: form.short_description || 'Aucune description',
                            instructions: form.instructions
                        },
                        // "sync" va automatiquement détacher les anciens éléments et attacher les nouveaux d'un seul coup
                        relations: {
                            equipments: [{ operation: "sync", key: selectedEquipmentIds }],
                            primaryMuscles: [{ operation: "sync", key: form.target_muscle_id ? [form.target_muscle_id] : [] }],
                            secondaryMuscles: [{ operation: "sync", key: form.secondary_muscle_id ? [form.secondary_muscle_id] : [] }]
                        }
                    }
                ]
            };

            await axios.post('/api/exercises/mutate', payload);
            
            toast.success(`L'exercice "${form.name}" a été mis à jour avec succès !`);
            navigate(`/exercise/${id}`);
        } catch (err: any) {
            console.error("Erreur lors de la modification de l'exercice:", err);
            toast.error("Impossible d'enregistrer les modifications.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-pulse" aria-hidden="true">
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                <div className="h-12 bg-slate-200 rounded w-1/2"></div>
                <div className="h-96 bg-slate-100 rounded-2xl"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-5 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700" role="alert">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <div>
                    <p className="text-sm font-bold">{error}</p>
                    <Link to="/exercises" className="mt-2 inline-block text-sm underline font-medium hover:text-red-800">
                        Retourner à la liste des exercices
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            <nav aria-label="Navigation secondaire">
                <Link 
                    to={`/exercise/${id}`} 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Annuler et retourner au détail</span>
                </Link>
            </nav>

            <header>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Modifier l'exercice
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Mettez à jour les paramètres de performance et les focus anatomiques.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 sm:p-8 space-y-8">
                
                {/* SECTION 1 : Informations Générales */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-[#7B3FF2]" />
                        <span>Informations générales</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">
                                Nom de l'exercice <span className="text-red-700" aria-hidden="true">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                aria-required="true"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-1">
                                Catégorie
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer"
                            >
                                <option value="Strength">Force</option>
                                <option value="Cardio">Cardio</option>
                                <option value="HIIT">HIIT</option>
                                <option value="Flexibility">Souplesse</option>
                                <option value="Balance">Équilibre</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="sub_category" className="block text-sm font-bold text-slate-700 mb-1">
                                Sous-catégorie
                            </label>
                            <input
                                type="text"
                                id="sub_category"
                                name="sub_category"
                                value={form.sub_category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="difficulty_level" className="block text-sm font-bold text-slate-700 mb-1">
                                Niveau de difficulté <span className="text-red-700" aria-hidden="true">*</span>
                            </label>
                            <select
                                id="difficulty_level"
                                name="difficulty_level"
                                required
                                aria-required="true"
                                value={form.difficulty_level}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer"
                            >
                                <option value="Beginner">Débutant</option>
                                <option value="Intermediate">Intermédiaire</option>
                                <option value="Advanced">Avancé</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="injury_risk_level" className="block text-sm font-bold text-slate-700 mb-1">
                                Risque de blessure
                            </label>
                            <select
                                id="injury_risk_level"
                                name="injury_risk_level"
                                value={form.injury_risk_level}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer"
                            >
                                <option value="Low">Faible</option>
                                <option value="Medium">Modéré</option>
                                <option value="High">Élevé</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 : Anatomie & Équipements */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-[#4A6BF0]" />
                        <span>Anatomie & Biomécanique</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="target_muscle_id" className="block text-sm font-bold text-slate-700 mb-1">
                                Muscle principal
                            </label>
                            <select
                                id="target_muscle_id"
                                name="target_muscle_id"
                                value={form.target_muscle_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer"
                            >
                                <option value="">Sélectionner...</option>
                                {availableMuscles.map(muscle => (
                                    <option key={muscle.id} value={muscle.id} className="capitalize">
                                        {muscle.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="secondary_muscle_id" className="block text-sm font-bold text-slate-700 mb-1">
                                Muscle secondaire
                            </label>
                            <select
                                id="secondary_muscle_id"
                                name="secondary_muscle_id"
                                value={form.secondary_muscle_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer"
                            >
                                <option value="">Sélectionner...</option>
                                {availableMuscles.map(muscle => (
                                    <option key={muscle.id} value={muscle.id} className="capitalize">
                                        {muscle.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="range_of_motion" className="block text-sm font-bold text-slate-700 mb-1">
                                Amplitude (ROM)
                            </label>
                            <select
                                id="range_of_motion"
                                name="range_of_motion"
                                value={form.range_of_motion}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer"
                            >
                                <option value="Full">Complète</option>
                                <option value="Partial">Partielle</option>
                                <option value="Isometric">Isométrique</option>
                            </select>
                        </div>
                    </div>

                    <fieldset className="space-y-3 pt-2 border-t border-slate-50 mt-4">
                        <legend className="text-sm font-bold text-slate-700 mb-2">
                            Équipements requis (sélection multiple)
                        </legend>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableEquipments.map((eq) => {
                                const isChecked = selectedEquipmentIds.includes(eq.id);
                                return (
                                    <button
                                        type="button"
                                        key={eq.id}
                                        onClick={() => handleToggleEquipment(eq.id)}
                                        aria-pressed={isChecked}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] ${
                                            isChecked 
                                                ? 'border-[#7B3FF2] bg-purple-50/40 text-slate-900 font-bold' 
                                                : 'border-slate-100 bg-white hover:border-slate-200 text-slate-600 font-medium'
                                        }`}
                                    >
                                        <div aria-hidden="true" className={isChecked ? 'text-[#7B3FF2]' : 'text-slate-300'}>
                                            {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                        </div>
                                        <span className="text-xs sm:text-sm capitalize truncate">{eq.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                </section>

                {/* SECTION 3 : Objectifs & Métriques */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <span>Performances & Métriques</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        <div>
                            <label htmlFor="rep_range_min" className="block text-sm font-bold text-slate-700 mb-1">
                                Rép. Min
                            </label>
                            <input
                                type="number"
                                id="rep_range_min"
                                name="rep_range_min"
                                min="0"
                                value={form.rep_range_min}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="rep_range_max" className="block text-sm font-bold text-slate-700 mb-1">
                                Rép. Max
                            </label>
                            <input
                                type="number"
                                id="rep_range_max"
                                name="rep_range_max"
                                min="0"
                                value={form.rep_range_max}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="recommended_duration_seconds" className="block text-sm font-bold text-slate-700 mb-1">
                                Durée (sec)
                            </label>
                            <input
                                type="number"
                                id="recommended_duration_seconds"
                                name="recommended_duration_seconds"
                                min="0"
                                value={form.recommended_duration_seconds}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="recommended_rest_minutes" className="block text-sm font-bold text-slate-700 mb-1">
                                Repos (min)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="recommended_rest_minutes"
                                    name="recommended_rest_minutes"
                                    min="0"
                                    value={form.recommended_rest_minutes}
                                    onChange={handleChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                                />
                                <Timer className="absolute right-3 top-3 h-4 w-4 text-slate-300 pointer-events-none" />
                            </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                            <label htmlFor="estimated_calories_per_minutes" className="block text-sm font-bold text-slate-700 mb-1">
                                kcal / min
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="estimated_calories_per_minutes"
                                    name="estimated_calories_per_minutes"
                                    min="0"
                                    value={form.estimated_calories_per_minutes}
                                    onChange={handleChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                                />
                                <Flame className="absolute right-3 top-3 h-4 w-4 text-orange-300 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4 : Descriptions & Instructions */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-emerald-500" />
                        <span>Description & Consignes</span>
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="short_description" className="block text-sm font-bold text-slate-700 mb-1">
                                Description courte
                            </label>
                            <textarea
                                id="short_description"
                                name="short_description"
                                rows={2}
                                value={form.short_description}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] resize-y min-h-[60px]"
                            />
                        </div>

                        <div>
                            <label htmlFor="instructions" className="block text-sm font-bold text-slate-700 mb-1">
                                Instructions détaillées d'exécution <span className="text-red-700" aria-hidden="true">*</span>
                            </label>
                            <textarea
                                id="instructions"
                                name="instructions"
                                required
                                aria-required="true"
                                rows={4}
                                value={form.instructions}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] resize-y min-h-[100px]"
                            />
                        </div>
                    </div>
                </section>

                <footer className="flex items-center justify-end border-t border-slate-100 pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#7B3FF2] hover:bg-[#6830d1] text-white transition-colors rounded-xl shadow-sm text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                        <Save className="h-4 w-4" />
                        <span>{isSubmitting ? 'Enregistrement...' : 'Sauvegarder les modifications'}</span>
                    </button>
                </footer>

            </form>
        </main>
    );
}