import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, 
    Activity, 
    Moon, 
    Flame, 
    Heart, 
    Footprints, 
    Calendar,
    ChevronRight,
    ChevronLeft,
    Scale,
    AlertTriangle,
    Timer,
    CheckSquare,
    Square,
    Trash2,
    X,
    Check // Ajout de l'icône Check
} from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface HealthMetric {
    id: string;
    date: string;
    weight: number | null;
    avg_bpm: number | null;
    steps_count: number | null;
    sleep_time: string | null;
    calories_burned: number | null;
    active_minute: number | null;
}

export default function HealthMetricsMainPage() {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [reloadKey, setReloadKey] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [globalTotal, setGlobalTotal] = useState<number | null>(null);
    const itemsPerPage = 25;

    const { user } = useAuth();

    useEffect(() => {
        const fetchGlobalTotal = async () => {
            try {
                const response = await axios.get('/api/health-metrics/count');
                setGlobalTotal(response.data);
            } catch (err) {
                console.error("Impossible de récupérer le total global", err);
                setGlobalTotal(0);
            }
        };
        fetchGlobalTotal();
    }, [reloadKey]);

    useEffect(() => {
        if (!user) return;
        
        const fetchMetrics = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.post('/api/health-metrics/search', {
                    search: {
                        page: currentPage,
                        limit: itemsPerPage,
                        filters: [
                            { field: 'user_id', operator: '=', value: user.id }
                        ],
                        sorts: [
                            { field: 'date', direction: 'desc' }
                        ]
                    }
                });

                const results = response.data?.data || response.data || [];
                setMetrics(Array.isArray(results) ? results : []);
                setTotalItems(response.data?.total || (Array.isArray(results) ? results.length : 0));
            } catch (err: any) {
                console.error("Erreur lors de la récupération des métriques:", err);
                setError("Impossible de charger votre historique de santé.");
                toast.error("Erreur de connexion.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [user, reloadKey, currentPage]);

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedIds([]);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === metrics.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(metrics.map(m => m.id));
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Supprimer les ${selectedIds.length} bilan(s) sélectionné(s) ?`)) return;

        const countDeleted = selectedIds.length;

        try {
            await axios.delete('/api/health-metrics', { data: { resources: selectedIds } });
            
            setSelectedIds([]);
            setIsSelectMode(false);
            setReloadKey(k => k + 1);
            
            toast.success(`${countDeleted} bilan(s) supprimé(s) avec succès !`);
        } catch (err) {
            console.error('Erreur suppression:', err);
            toast.error("Impossible de supprimer les bilans sélectionnés. Veuillez réessayer.");
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

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    return (
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="h-8 w-8 text-[#7B3FF2]" aria-hidden="true" />
                        Mon Journal de Santé
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500" aria-live="polite">
                        {globalTotal !== null ? `${globalTotal} bilans dans votre historique` : 'Chargement...'}
                    </p>
                </div>
                
                {/* --- BARRE D'ACTIONS EXACTEMENT COMME FOODS --- */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {isSelectMode && selectedIds.length > 0 && (
                        <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-100 text-red-700 hover:bg-red-150 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Supprimer ({selectedIds.length})</span>
                        </button>
                    )}

                    {isSelectMode && (
                        <button onClick={toggleSelectAll} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                            {selectedIds.length === metrics.length && metrics.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-[#7B3FF2]" aria-hidden="true" />
                            ) : (
                                <Square className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">
                                {selectedIds.length === metrics.length && metrics.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </span>
                        </button>
                    )}

                    <button onClick={toggleSelectMode} className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-colors text-sm font-bold border focus:outline-none focus-visible:ring-2 ${isSelectMode ? 'bg-slate-800 border-slate-800 text-white hover:bg-slate-700 focus-visible:ring-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-[#7B3FF2]'}`}>
                        {isSelectMode ? <X className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                        <span className="hidden sm:inline">{isSelectMode ? 'Annuler' : 'Sélection'}</span>
                    </button>

                    <Link to="/health-metric/create" className="flex items-center justify-center bg-[#7B3FF2] hover:bg-[#6830d1] text-white transition-colors sm:px-4 sm:py-2.5 rounded-xl w-10 h-10 sm:w-auto sm:h-auto shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2">
                        <Plus className="h-5 w-5 sm:mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline font-bold text-sm">Ajouter un bilan</span>
                    </Link>
                </div>
            </header>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-6 animate-pulse">
                            <div className="w-full sm:w-1/4 h-12 bg-slate-100 rounded-xl"></div>
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="h-10 bg-slate-50 rounded-lg"></div>
                                <div className="h-10 bg-slate-50 rounded-lg"></div>
                                <div className="h-10 bg-slate-50 rounded-lg"></div>
                                <div className="h-10 bg-slate-50 rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                    <AlertTriangle className="h-6 w-6 shrink-0" />
                    <p className="font-bold">{error}</p>
                </div>
            ) : metrics.length === 0 ? (
                <div className="p-10 bg-white border border-slate-100 shadow-sm rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-50 text-[#7B3FF2] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Aucun bilan enregistré</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Commencez à suivre vos métriques quotidiennes pour permettre à l'IA de vous fournir de meilleures recommandations.
                    </p>
                    <Link 
                        to="/health-metric/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold mt-2"
                    >
                        Créer mon premier bilan
                    </Link>
                </div>
            ) : (
                <ul className="space-y-4">
                    {metrics.map((metric) => {
                        const isSelected = selectedIds.includes(metric.id);
                        
                        return (
                            <li key={metric.id}>
                                {isSelectMode ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleSelection(metric.id)}
                                        className={`w-full text-left block bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 ${
                                            isSelected ? 'border-[#7B3FF2] shadow-md bg-blue-50/30' : 'border-slate-100 shadow-sm hover:border-slate-200'
                                        }`}
                                    >
                                        <CardContent metric={metric} isSelected={isSelected} isSelectMode={true} formatDate={formatDate} formatSleepTime={formatSleepTime} />
                                    </button>
                                ) : (
                                    <Link 
                                        to={`/health-metric/${metric.id}`} // Redirige vers le Détail
                                        className="block bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-[#7B3FF2] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2"
                                    >
                                        <CardContent metric={metric} isSelected={false} isSelectMode={false} formatDate={formatDate} formatSleepTime={formatSleepTime} />
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {!isLoading && !error && totalItems > 0 && (
                <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 mt-8 pb-8">
                    <p className="text-sm text-slate-500 font-medium" aria-live="polite">
                        Affichage de <span className="font-bold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> sur <span className="font-bold text-slate-900">{totalItems}</span> résultats
                    </p>

                    <nav aria-label="Pagination" className="inline-flex rounded-xl shadow-sm bg-white border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            aria-label="Page précédente"
                            className="px-3 py-2 border-r border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:bg-slate-100"
                        >
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                aria-current={currentPage === page ? "page" : undefined}
                                aria-label={`Aller à la page ${page}`}
                                className={`px-4 py-2 border-r border-slate-200 text-sm font-bold focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#7B3FF2] ${
                                    currentPage === page ? 'bg-[#4A6BF0] text-white' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            aria-label="Page suivante"
                            className="px-3 py-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:bg-slate-100"
                        >
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </footer>
            )}
        </main>
    );
}

function CardContent({ metric, isSelected, isSelectMode, formatDate, formatSleepTime }: any) {
    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 relative">
            
            {isSelectMode && (
                <div className={`shrink-0 flex items-center justify-center ${isSelected ? 'text-[#7B3FF2]' : 'text-slate-300'}`} aria-hidden="true">
                    {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
                </div>
            )}

            <div className="w-full lg:w-48 shrink-0 flex items-center gap-3 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
                <div className={`p-2.5 rounded-xl transition-colors ${isSelected ? 'bg-[#7B3FF2] text-white' : 'bg-slate-50 text-slate-600 group-hover:bg-purple-50 group-hover:text-[#7B3FF2]'}`}>
                    <Calendar className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Date du bilan</p>
                    <p className="font-bold text-slate-800 capitalize leading-tight">
                        {formatDate(metric.date)}
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                    <Scale className="h-4 w-4 text-slate-400" />
                    <div>
                        <p className="text-[11px] font-medium text-slate-500">Poids</p>
                        <p className="font-bold text-slate-700">{metric.weight ? `${metric.weight} kg` : '--'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Footprints className="h-4 w-4 text-emerald-500" />
                    <div>
                        <p className="text-[11px] font-medium text-slate-500">Pas</p>
                        <p className="font-bold text-slate-700">{metric.steps_count ? metric.steps_count.toLocaleString('fr-FR') : '--'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div>
                        <p className="text-[11px] font-medium text-slate-500">Calories</p>
                        <p className="font-bold text-slate-700">{metric.calories_burned ? `${metric.calories_burned} kcal` : '--'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <div>
                        <p className="text-[11px] font-medium text-slate-500">Sommeil</p>
                        <p className="font-bold text-slate-700">{formatSleepTime(metric.sleep_time)}</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <Timer className="h-4 w-4 text-blue-500" />
                    <div>
                        <p className="text-[11px] font-medium text-slate-500">Activité</p>
                        <p className="font-bold text-slate-700">{metric.active_minute ? `${metric.active_minute} min` : '--'}</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <div>
                        <p className="text-[11px] font-medium text-slate-500">BPM Moy.</p>
                        <p className="font-bold text-slate-700">{metric.avg_bpm ? metric.avg_bpm : '--'}</p>
                    </div>
                </div>
            </div>

            {!isSelectMode && (
                <div className="hidden lg:flex shrink-0 pl-4 items-center justify-center text-slate-300 group-hover:text-[#7B3FF2] transition-colors">
                    <ChevronRight className="h-6 w-6" />
                </div>
            )}
        </div>
    );
}