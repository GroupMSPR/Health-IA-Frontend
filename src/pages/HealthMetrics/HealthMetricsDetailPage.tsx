import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Edit, 
    Trash2,
    Calendar,
    Scale,
    Footprints,
    Timer,
    Flame,
    Moon,
    HeartPulse,
    Activity,
    AlertTriangle
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface HealthMetric {
    id: string;
    date: string;
    weight: number | null;
    avg_bpm: number | null;
    max_bpm: number | null;
    resting_bpm: number | null;
    steps_count: number | null;
    sleep_time: string | null;
    calories_burned: number | null;
    active_minute: number | null;
}

export default function HealthMetricsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [metric, setMetric] = useState<HealthMetric | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchMetric = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.post('/api/health-metrics/search', {
                    search: {
                        filters: [
                            { field: 'id', operator: '=', value: id }
                        ]
                    }
                });

                const data = response.data?.data?.[0] || response.data?.[0];

                if (!data) {
                    setError("Le bilan demandé est introuvable.");
                    return;
                }

                setMetric(data);
            } catch (err) {
                console.error("Erreur lors de la récupération du bilan:", err);
                setError("Impossible de charger les détails du bilan.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetric();
    }, [id]);

    const handleDelete = async () => {
        if (!metric) return;
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le bilan du ${formatDate(metric.date)} ?`)) return;

        try {
            await axios.delete('/api/health-metrics', { data: { resources: [metric.id] } });
            toast.success("Le bilan a été supprimé avec succès.");
            navigate('/my-metrics');
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            toast.error("Impossible de supprimer ce bilan.");
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', options);
    };

    const formatSleepTime = (timeString: string | null) => {
        if (!timeString) return '--';
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            return `${h}h ${m > 0 ? m.toString().padStart(2, '0') + 'm' : ''}`;
        }
        return '--';
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                <div className="h-32 bg-slate-200 rounded-3xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-slate-200 rounded-3xl"></div>
                    <div className="h-48 bg-slate-200 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    if (error || !metric) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <p className="font-bold">{error}</p>
                <Link to="/my-metrics" className="ml-auto underline text-sm">Retour</Link>
            </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            
            <nav aria-label="Navigation secondaire" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link 
                    to="/my-metrics" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour à l'historique</span>
                </Link>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Link 
                        to={`/health-metric/${metric.id}/edit`}
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
                        <span className="hidden sm:inline">Supprimer</span>
                    </button>
                </div>
            </nav>

            <header className="bg-gradient-to-r from-[#7B3FF2] to-[#4A6BF0] rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none scale-150 transform translate-x-1/4 -translate-y-1/4">
                    <Activity className="h-64 w-64" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <Calendar className="h-5 w-5" />
                        <p className="font-bold text-sm tracking-wide uppercase">Bilan du jour</p>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold capitalize tracking-tight">
                        {formatDate(metric.date)}
                    </h1>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Carte Poids */}
                <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Scale className="h-4 w-4" /> Poids enregistré
                    </h2>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-extrabold text-slate-900">
                                {metric.weight ? `${metric.weight} kg` : '--'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Carte Activité */}
                <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Activité Quotidienne
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Footprints className="h-4 w-4" /></div>
                                <span className="font-bold text-slate-700">Nombre de pas</span>
                            </div>
                            <span className="font-extrabold text-slate-900">{metric.steps_count ? metric.steps_count.toLocaleString('fr-FR') : '--'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Timer className="h-4 w-4" /></div>
                                <span className="font-bold text-slate-700">Minutes actives</span>
                            </div>
                            <span className="font-extrabold text-slate-900">{metric.active_minute ? `${metric.active_minute} min` : '--'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Flame className="h-4 w-4" /></div>
                                <span className="font-bold text-slate-700">Calories brûlées</span>
                            </div>
                            <span className="font-extrabold text-slate-900">{metric.calories_burned ? `${metric.calories_burned} kcal` : '--'}</span>
                        </div>
                    </div>
                </section>

                {/* Carte Sommeil */}
                <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Moon className="h-4 w-4" /> Récupération
                    </h2>
                    <div className="flex items-center justify-center py-6">
                        <div className="text-center">
                            <p className="text-4xl font-extrabold text-[#7B3FF2] mb-1">{formatSleepTime(metric.sleep_time)}</p>
                            <p className="text-sm font-bold text-slate-400">Temps de sommeil enregistré</p>
                        </div>
                    </div>
                </section>

                {/* Carte Cardiaque */}
                <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <HeartPulse className="h-4 w-4" /> Rythme Cardiaque
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 mb-1">Repos</p>
                            <p className="text-xl font-extrabold text-slate-700">{metric.resting_bpm || '--'}</p>
                            <p className="text-[10px] text-slate-400 mt-1">bpm</p>
                        </div>
                        <div className="text-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
                            <p className="text-xs font-bold text-rose-400 mb-1">Moyen</p>
                            <p className="text-xl font-extrabold text-rose-600">{metric.avg_bpm || '--'}</p>
                            <p className="text-[10px] text-rose-400 mt-1">bpm</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 mb-1">Max</p>
                            <p className="text-xl font-extrabold text-slate-700">{metric.max_bpm || '--'}</p>
                            <p className="text-[10px] text-slate-400 mt-1">bpm</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}