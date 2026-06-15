/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Save, 
    Scale,
    Footprints,
    Timer,
    Flame,
    Moon,
    HeartPulse,
    Activity
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface FormState {
    weight: number | string;
    steps_count: number | string;
    active_minute: number | string;
    calories_burned: number | string;
    sleep_hours: number | string;
    sleep_minutes: number | string;
    resting_bpm: number | string;
    avg_bpm: number | string;
    max_bpm: number | string;
}

export default function HealthMetricsCreatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState<FormState>({
        weight: '',
        steps_count: '',
        active_minute: '',
        calories_burned: '',
        sleep_hours: '',
        sleep_minutes: '',
        resting_bpm: '',
        avg_bpm: '',
        max_bpm: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // On stocke la valeur brute pour permettre la saisie des décimales (ex: "75.")
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Formatage du sommeil en HH:mm:ss pour satisfaire la validation date_format de Laravel
        const hours = String(form.sleep_hours || 0).padStart(2, '0');
        const minutes = String(form.sleep_minutes || 0).padStart(2, '0');
        const formattedSleepTime = `${hours}:${minutes}:00`;

        try {
            const payload = {
                mutate: [
                    {
                        operation: "create",
                        attributes: {
                            // La date et le user_id sont gérés par le backend (Lomkit mutating)
                            weight: form.weight === '' ? null : Number(form.weight),
                            steps_count: form.steps_count === '' ? null : Number(form.steps_count),
                            active_minute: form.active_minute === '' ? null : Number(form.active_minute),
                            calories_burned: form.calories_burned === '' ? null : Number(form.calories_burned),
                            sleep_time: formattedSleepTime,
                            resting_bpm: form.resting_bpm === '' ? null : Number(form.resting_bpm),
                            avg_bpm: form.avg_bpm === '' ? null : Number(form.avg_bpm),
                            max_bpm: form.max_bpm === '' ? null : Number(form.max_bpm),
                        }
                    }
                ]
            };

            await axios.post('/api/health-metrics/mutate', payload);
            
            toast.success("Votre bilan quotidien a été enregistré avec succès !");
            navigate('/my-metrics');
        } catch (err: any) {
            console.error("Erreur lors de la création du bilan:", err.response?.data || err);
            
            if (err.response?.status === 422) {
                console.log("Détails de validation:", err.response.data.errors);
                toast.error("Erreur de validation. Veuillez vérifier que tous les champs sont correctement remplis.");
            } else {
                toast.error("Impossible d'enregistrer le bilan. Vérifiez votre connexion.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            
            <nav aria-label="Navigation secondaire">
                <Link 
                    to="/my-metrics" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour à l'historique</span>
                </Link>
            </nav>

            <header>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Nouveau Bilan Quotidien
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Saisissez vos données d'aujourd'hui. (Tous les champs sont requis pour le suivi de l'IA).
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECTION 1 : Poids */}
                <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
                        <Scale className="h-5 w-5 text-[#7B3FF2]" />
                        <span>Évolution du poids</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="weight" className="block text-sm font-bold text-slate-700 mb-1">
                                Poids (kg) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    step="0.1"
                                    min="0"
                                    required
                                    value={form.weight}
                                    onChange={handleChange}
                                    placeholder="Ex: 75.0"
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] transition-colors"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Scale className="h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 : Activité Physique */}
                <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
                        <Activity className="h-5 w-5 text-emerald-500" />
                        <span>Activité de la journée</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="steps_count" className="block text-sm font-bold text-slate-700 mb-1">
                                Nombre de pas <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="steps_count"
                                    name="steps_count"
                                    min="0"
                                    required
                                    value={form.steps_count}
                                    onChange={handleChange}
                                    placeholder="Ex: 8500"
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Footprints className="h-4 w-4 text-emerald-500" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="active_minute" className="block text-sm font-bold text-slate-700 mb-1">
                                Minutes actives <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="active_minute"
                                    name="active_minute"
                                    min="0"
                                    max="1440"
                                    required
                                    value={form.active_minute}
                                    onChange={handleChange}
                                    placeholder="Ex: 45"
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Timer className="h-4 w-4 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="calories_burned" className="block text-sm font-bold text-slate-700 mb-1">
                                Calories brûlées <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="calories_burned"
                                    name="calories_burned"
                                    min="0"
                                    step="0.1"
                                    required
                                    value={form.calories_burned}
                                    onChange={handleChange}
                                    placeholder="Ex: 450"
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 : Sommeil & Cardiaque */}
                <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
                        <Moon className="h-5 w-5 text-indigo-500" />
                        <span>Sommeil & Fréquence Cardiaque</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Bloc Sommeil */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">
                                Temps de sommeil de la nuit dernière <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        id="sleep_hours"
                                        name="sleep_hours"
                                        min="0"
                                        max="24"
                                        required
                                        value={form.sleep_hours}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-right"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-medium">h</span>
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        id="sleep_minutes"
                                        name="sleep_minutes"
                                        min="0"
                                        max="59"
                                        required
                                        value={form.sleep_minutes}
                                        onChange={handleChange}
                                        placeholder="00"
                                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-right"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-medium">min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bloc Cardiaque (BPM) */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="resting_bpm" className="block text-xs font-bold text-slate-700 mb-1 truncate">
                                    BPM Repos <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="resting_bpm"
                                        name="resting_bpm"
                                        min="0"
                                        max="250"
                                        required
                                        value={form.resting_bpm}
                                        onChange={handleChange}
                                        placeholder="Ex: 55"
                                        className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                                    />
                                    <HeartPulse className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="avg_bpm" className="block text-xs font-bold text-slate-700 mb-1 truncate">
                                    BPM Moyen <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="avg_bpm"
                                        name="avg_bpm"
                                        min="0"
                                        max="250"
                                        required
                                        value={form.avg_bpm}
                                        onChange={handleChange}
                                        placeholder="Ex: 75"
                                        className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                                    />
                                    <HeartPulse className="absolute left-2.5 top-3 h-3.5 w-3.5 text-rose-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="max_bpm" className="block text-xs font-bold text-slate-700 mb-1 truncate">
                                    BPM Max <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="max_bpm"
                                        name="max_bpm"
                                        min="0"
                                        max="250"
                                        required
                                        value={form.max_bpm}
                                        onChange={handleChange}
                                        placeholder="Ex: 160"
                                        className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                                    />
                                    <HeartPulse className="absolute left-2.5 top-3 h-3.5 w-3.5 text-rose-600 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </section>

                <footer className="flex items-center justify-end pt-4 pb-12">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#7B3FF2] hover:bg-[#6830d1] text-white transition-all rounded-xl shadow-lg shadow-[#7B3FF2]/20 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                        <Save className="h-5 w-5" />
                        <span>{isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer mon bilan'}</span>
                    </button>
                </footer>

            </form>
        </main>
    );
}