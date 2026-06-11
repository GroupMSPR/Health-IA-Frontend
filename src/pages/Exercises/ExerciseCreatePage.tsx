/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    Timer
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

export default function ExercisesCreatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [availableEquipments, setAvailableEquipments] = useState<ItemDefinition[]>([]);
    const [availableMuscles, setAvailableMuscles] = useState<ItemDefinition[]>([]);
    
    const [isLoadingData, setIsLoadingData] = useState(true);
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
        const fetchFormData = async () => {
            try {
                const [equipmentsRes, musclesRes] = await Promise.all([
                    axios.post('/api/equipments/search', { search: { limit: 50 } }),
                    axios.post('/api/muscles/search', { search: { limit: 50 } })
                ]);

                const eqData = equipmentsRes.data?.data || equipmentsRes.data;
                if (Array.isArray(eqData)) setAvailableEquipments(eqData);

                const musData = musclesRes.data?.data || musclesRes.data;
                if (Array.isArray(musData)) setAvailableMuscles(musData);

            } catch (err) {
                console.error("Erreur lors de la récupération des données:", err);
                toast.error("Erreur lors du chargement des listes (muscles/équipements).");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchFormData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleToggleEquipment = (id: string) => {
        setSelectedEquipmentIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
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

            const relationsObj: any = {};

            if (selectedEquipmentIds.length > 0) {
                relationsObj.equipments = selectedEquipmentIds.map(id => ({ operation: "attach", key: id }));
            }
            if (form.target_muscle_id) {
                relationsObj.primaryMuscles = [{ operation: "attach", key: form.target_muscle_id }];
            }
            if (form.secondary_muscle_id) {
                relationsObj.secondaryMuscles = [{ operation: "attach", key: form.secondary_muscle_id }];
            }

            const payload = {
                mutate: [
                    {
                        operation: "create",
                        attributes: {
                            name: form.name,
                            category: form.category,
                            sub_category: form.sub_category || 'Général',
                            difficulty_level: form.difficulty_level,
                            injury_risk_level: form.injury_risk_level,
                            target_muscle: targetMuscleObj ? targetMuscleObj.name : 'Aucun', 
                            secondary_muscle: secondaryMuscleObj ? secondaryMuscleObj.name : 'Aucun', 
                            range_of_motion: form.range_of_motion,
                            equipment: 'Aucun', // Gardé pour satisfaire la colonne SQL
                            rep_range_min: form.rep_range_min,
                            rep_range_max: form.rep_range_max,
                            recommended_duration_seconds: form.recommended_duration_seconds,
                            recommended_rest_minutes: form.recommended_rest_minutes,
                            estimated_calories_per_minutes: form.estimated_calories_per_minutes,
                            short_description: form.short_description || 'Aucune description',
                            instructions: form.instructions
                        },
                        ...(Object.keys(relationsObj).length > 0 && { relations: relationsObj })
                    }
                ]
            };

            await axios.post('/api/exercises/mutate', payload);
            
            toast.success(`L'exercice "${form.name}" a été créé avec succès !`);
            navigate('/exercises');
        } catch (err: any) {
            console.error("Erreur lors de la création de l'exercice:", err);
            if (err.response?.status === 422) {
                toast.error("Erreur de validation. Vérifiez les contraintes de l'API.");
            } else {
                toast.error("Impossible de créer l'exercice. Problème de communication serveur.");
            }
        } finally {
            setIsSubmitting(false);
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

            <header>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Ajouter un nouvel exercice
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Enrichissez la bibliothèque de l'application avec des données de santé connectée.
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
                                Nom de l'exercice <span className="text-red-900" aria-hidden="true">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                aria-required="true"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Ex: Développé couché, Squat au poids du corps..."
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
                                placeholder="Ex: Poids du corps, Haltérophilie..."
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="difficulty_level" className="block text-sm font-bold text-slate-700 mb-1">
                                Niveau de difficulté <span className="text-red-900" aria-hidden="true">*</span>
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
                                disabled={isLoadingData}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
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
                                disabled={isLoadingData}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
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
                        
                        {isLoadingData ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse" aria-hidden="true">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="h-11 bg-slate-100 rounded-xl border border-slate-200"></div>
                                ))}
                            </div>
                        ) : availableEquipments.length === 0 ? (
                            <p className="text-xs font-medium text-slate-400 italic">Aucun équipement disponible.</p>
                        ) : (
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
                        )}
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
                            <div className="relative">
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
                        </div>

                        <div>
                            <label htmlFor="rep_range_max" className="block text-sm font-bold text-slate-700 mb-1">
                                Rép. Max
                            </label>
                            <div className="relative">
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
                        </div>

                        <div>
                            <label htmlFor="recommended_duration_seconds" className="block text-sm font-bold text-slate-700 mb-1">
                                Durée (sec)
                            </label>
                            <div className="relative">
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
                                placeholder="Résumé rapide des bénéfices..."
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] resize-y min-h-[60px]"
                            />
                        </div>

                        <div>
                            <label htmlFor="instructions" className="block text-sm font-bold text-slate-700 mb-1">
                                Instructions détaillées d'exécution <span className="text-red-900" aria-hidden="true">*</span>
                            </label>
                            <textarea
                                id="instructions"
                                name="instructions"
                                required
                                aria-required="true"
                                rows={4}
                                value={form.instructions}
                                onChange={handleChange}
                                placeholder="1. Gardez le dos droit...&#10;2. Inspirez lors de la descente..."
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
                        <span>{isSubmitting ? 'Création en cours...' : "Enregistrer l'exercice"}</span>
                    </button>
                </footer>

            </form>
        </main>
    );
}