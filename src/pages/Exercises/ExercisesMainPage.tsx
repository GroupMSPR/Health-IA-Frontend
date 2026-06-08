import { useState, useEffect } from 'react';
import { Search, Plus, Clock, Flame, Zap, CheckSquare, Square, Trash2, ChevronLeft, ChevronRight, Check, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../lib/axios';

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
}

const filters = ['All', 'Strength', 'Cardio', 'HIIT', 'Flexibility', 'Balance'];

export default function ExercisesMainPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const [sortBy, setSortBy] = useState('recent');
    
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [globalTotal, setGlobalTotal] = useState<number | null>(null);
    const itemsPerPage = 10;

    // Debounce de la recherche textuelle
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    // ==========================================
    // EFFET 1 : Récupérer le GRAND TOTAL de la table (Une seule fois au montage)
    // ==========================================
    useEffect(() => {
        const fetchGlobalTotal = async () => {
            try {
                // Requête Lomkit sans filtre, ultra-légère (limit: 1) pour intercepter le "total" global
                const response = await axios.post('/api/exercises/search', {
                    search: { page: 1, limit: 1 }
                });
                if (response.data && response.data.total !== undefined) {
                    setGlobalTotal(response.data.total);
                }
            } catch (err) {
                console.error("Impossible de récupérer le total global via Lomkit", err);
                // On affecte 0 en cas d'échec (ex: 401 transitoire) pour couper court aux boucles infinies
                setGlobalTotal(0); 
            }
        };

        fetchGlobalTotal();
    }, []);

    // ==========================================
    // EFFET 2 : Récupération des exercices filtrés et triés (Lomkit standard)
    // ==========================================
    useEffect(() => {
        const fetchExercises = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const apiFilters: any[] = [];
                if (activeFilter !== 'All') {
                    apiFilters.push({ field: 'category', operator: '=', value: activeFilter });
                }
                if (debouncedSearch) {
                    apiFilters.push({ field: 'name', operator: 'like', value: `%${debouncedSearch}%` });
                }

                const apiSorts: any[] = [];
                switch (sortBy) {
                    case 'recent':
                        apiSorts.push({ field: 'created_at', direction: 'desc' });
                        break;
                    case 'oldest':
                        apiSorts.push({ field: 'created_at', direction: 'asc' });
                        break;
                    case 'calories_high':
                        apiSorts.push({ field: 'estimated_calories_per_minutes', direction: 'desc' });
                        break;
                    case 'duration_long':
                        apiSorts.push({ field: 'recommended_duration_seconds', direction: 'desc' });
                        break;
                    case 'duration_short':
                        apiSorts.push({ field: 'recommended_duration_seconds', direction: 'asc' });
                        break;
                }

                const response = await axios.post('/api/exercises/search', {
                    search: {
                        page: currentPage,
                        limit: itemsPerPage,
                        filters: apiFilters.length > 0 ? apiFilters : undefined,
                        sorts: apiSorts.length > 0 ? apiSorts : undefined
                    }
                });

                if (response.data && response.data.data) {
                    setExercises(response.data.data);
                    setTotalItems(response.data.total || response.data.data.length);
                }
            } catch (err: any) {
                console.error("Erreur récupération exercices:", err);
                if (err.response?.status === 401) {
                    setError("Votre session a expiré ou est introuvable. Veuillez vous reconnecter.");
                } else {
                    setError("Impossible de charger le catalogue d'exercices. Vérifiez la connexion avec le serveur.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchExercises();
    }, [currentPage, activeFilter, debouncedSearch, sortBy]);

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedIds([]);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === exercises.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(exercises.map(ex => ex.id));
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

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    return (
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Exercises
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500" aria-live="polite">
                        {globalTotal !== null && globalTotal > 0 ? globalTotal : totalItems} exercises in your library
                    </p>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    {isSelectMode && selectedIds.length > 0 && (
                        <button className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Delete ({selectedIds.length})</span>
                        </button>
                    )}

                    {isSelectMode && (
                        <button onClick={toggleSelectAll} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors text-sm font-bold">
                            {selectedIds.length === exercises.length && exercises.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-[#7B3FF2]" aria-hidden="true" />
                            ) : (
                                <Square className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">
                                {selectedIds.length === exercises.length && exercises.length > 0 ? 'Deselect All' : 'Select All'}
                            </span>
                        </button>
                    )}

                    <button onClick={toggleSelectMode} className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-colors text-sm font-bold border ${isSelectMode ? 'bg-slate-800 border-slate-800 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{isSelectMode ? 'Cancel' : 'Select'}</span>
                    </button>

                    <Link to="/exercises/create" className="flex items-center justify-center bg-[#7B3FF2] hover:bg-[#6830d1] text-white transition-colors sm:px-4 sm:py-2.5 rounded-xl w-10 h-10 sm:w-auto sm:h-auto shadow-sm">
                        <Plus className="h-5 w-5 sm:mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline font-bold text-sm">Add Exercise</span>
                    </Link>
                </div>
            </header>

            <section aria-label="Search, sort and filter" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <input
                            type="search"
                            placeholder="Search exercises or muscles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Rechercher un exercice"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                        />
                    </div>

                    <div className="relative shrink-0 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SlidersHorizontal className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <label htmlFor="sort-select" className="sr-only">Trier les exercices</label>
                        <select
                            id="sort-select"
                            value={sortBy}
                            onChange={handleSortChange}
                            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] appearance-none cursor-pointer"
                        >
                            <option value="recent">Le plus récent</option>
                            <option value="oldest">Le plus ancien</option>
                            <option value="calories_high">Plus de calories / min</option>
                            <option value="duration_long">Durée : Le plus long</option>
                            <option value="duration_short">Durée : Le moins long</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" aria-hidden="true" />
                        </div>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar" role="tablist" aria-label="Filtrer par catégorie">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            role="tab"
                            aria-selected={activeFilter === filter}
                            onClick={() => handleFilterClick(filter)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 ${
                                activeFilter === filter
                                    ? 'bg-[#4A6BF0] text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {error ? (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700" role="alert">
                    <AlertTriangle className="h-6 w-6 shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            ) : isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" aria-hidden="true">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white p-5 h-36 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                            <div className="pt-4 flex gap-2">
                                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : exercises.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8">
                    <p className="text-slate-500 font-medium">Aucun exercice trouvé avec ces critères.</p>
                </div>
            ) : (
                <section aria-label="Liste des exercices">
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {exercises.map((exercise) => {
                            const isSelected = selectedIds.includes(exercise.id);
                            return (
                                <li key={exercise.id}>
                                    {isSelectMode ? (
                                        <button
                                            onClick={() => toggleSelection(exercise.id)}
                                            aria-pressed={isSelected}
                                            className={`w-full text-left block h-full bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] ${
                                                isSelected ? 'border-[#7B3FF2] shadow-md bg-blue-50/30' : 'border-slate-100 shadow-sm hover:border-slate-200'
                                            }`}
                                        >
                                            <CardContent exercise={exercise} isSelected={isSelected} isSelectMode={isSelectMode} getDifficultyStyles={getDifficultyStyles} />
                                        </button>
                                    ) : (
                                        <Link 
                                            to={`/exercises/${exercise.id}`}
                                            aria-label={`Voir les détails de l'exercice ${exercise.name}`}
                                            className="block h-full bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-[#7B3FF2] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2]"
                                        >
                                            <CardContent exercise={exercise} isSelected={false} isSelectMode={false} getDifficultyStyles={getDifficultyStyles} />
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
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
                                aria-label={`Page ${page}`}
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

function CardContent({ exercise, isSelected, isSelectMode, getDifficultyStyles }: { exercise: Exercise, isSelected: boolean, isSelectMode: boolean, getDifficultyStyles: (d: string) => string }) {
    const durationMinutes = Math.max(1, Math.round((exercise.recommended_duration_seconds || 0) / 60));
    const estimatedCalories = Math.round(durationMinutes * (exercise.estimated_calories_per_minutes || 0));

    return (
        <>
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 capitalize truncate pr-2">{exercise.name}</h2>
                {isSelectMode && (
                    <div className={`shrink-0 ${isSelected ? 'text-[#7B3FF2]' : 'text-slate-300'}`} aria-hidden="true">
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </div>
                )}
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold mb-4 ${getDifficultyStyles(exercise.difficulty_level)}`}>
                {exercise.difficulty_level}
            </span>
            <div className="flex items-center gap-3 sm:gap-4 text-slate-500 text-[10px] sm:text-xs font-medium">
                <div className="flex items-center gap-1" title="Estimated duration"><Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" /><span aria-label={`${durationMinutes} minutes`}>{durationMinutes} min</span></div>
                <div className="flex items-center gap-1" title="Estimated calories"><Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-orange-500" aria-hidden="true" /><span aria-label={`${estimatedCalories} calories`}>{estimatedCalories} cal</span></div>
                <div className="flex items-center gap-1" title="Rep range"><Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" aria-hidden="true" /><span aria-label={`De ${exercise.rep_range_min} à ${exercise.rep_range_max} répétitions`}>{exercise.rep_range_min}-{exercise.rep_range_max} reps</span></div>
            </div>
        </>
    );
}