/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
    Search, 
    Plus, 
    Flame, 
    Beef,
    CheckSquare, 
    Square, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Check, 
    X,
    AlertTriangle, 
    SlidersHorizontal,
    Wheat,
    Droplet,
    Apple
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from '../../lib/axios';

// Interface strictement alignée sur FoodResource.php
interface Food {
    id: string;
    user_id: string;
    name: string;
    category: string;
    image?: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugars: number;
    sodium: number;
    cholesterol: number;
}

const filters = ['All', 'Meat & Fish', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Snacks'];

const filterTranslations: Record<string, string> = {
    'All': 'Tous',
    'Meat & Fish': 'Viandes & Poissons',
    'Vegetables': 'Légumes',
    'Fruits': 'Fruits',
    'Dairy': 'Produits laitiers',
    'Grains': 'Céréales & Féculents',
    'Snacks': 'Snacks'
};

export default function FoodsMainPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const [sortBy, setSortBy] = useState('recent');
    
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [reloadKey, setReloadKey] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [globalTotal, setGlobalTotal] = useState<number | null>(null);
    const itemsPerPage = 25;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchGlobalTotal = async () => {
            try {
                const response = await axios.get('/api/foods/count');
                setGlobalTotal(response.data);
            } catch (err) {
                console.error("Impossible de récupérer le total global", err);
                setGlobalTotal(0);
            }
        };
        fetchGlobalTotal();
    }, [reloadKey]);

    useEffect(() => {
        const fetchFoods = async () => {
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
                    case 'recent': apiSorts.push({ field: 'id', direction: 'desc' }); break;
                    case 'protein_high': apiSorts.push({ field: 'protein', direction: 'desc' }); break;
                    case 'calories_high': apiSorts.push({ field: 'calories', direction: 'desc' }); break;
                    case 'calories_low': apiSorts.push({ field: 'calories', direction: 'asc' }); break;
                    case 'carbs_low': apiSorts.push({ field: 'carbohydrates', direction: 'asc' }); break;
                }

                const response = await axios.post('/api/foods/search', {
                    search: {
                        page: currentPage,
                        limit: itemsPerPage,
                        filters: apiFilters.length > 0 ? apiFilters : undefined,
                        sorts: apiSorts.length > 0 ? apiSorts : undefined
                    }
                });

                if (response.data && response.data.data) {
                    setFoods(response.data.data);
                    setTotalItems(response.data.total || response.data.data.length);
                }
            } catch (err: any) {
                console.error("Erreur récupération aliments:", err);
                let msg = "Impossible de charger la base de données alimentaire. Vérifiez la connexion.";
                
                if (err.response?.status === 401) {
                    msg = "Votre session a expiré. Veuillez vous reconnecter.";
                }
                
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFoods();
    }, [currentPage, activeFilter, debouncedSearch, sortBy, reloadKey]);

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedIds([]);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === foods.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(foods.map(f => f.id));
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Supprimer les ${selectedIds.length} aliment(s) sélectionné(s) ?`)) return;

        const countDeleted = selectedIds.length;

        try {
            await axios.delete('/api/foods', { data: { resources: selectedIds } });
            
            setSelectedIds([]);
            setIsSelectMode(false);
            setReloadKey(k => k + 1);
            
            toast.success(`${countDeleted} aliment(s) supprimé(s) avec succès !`);
        } catch (err) {
            console.error('Erreur suppression:', err);
            setError("Impossible de supprimer les aliments sélectionnés.");
            toast.error("Impossible de supprimer les aliments sélectionnés. Veuillez réessayer.");
        }
    };

    const getCategoryStyles = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('meat & fish') || cat.includes('viande')) return 'bg-red-100 text-red-800';
        if (cat.includes('fruit') || cat.includes('vegetable') || cat.includes('légume')) return 'bg-green-100 text-green-800';
        if (cat.includes('dairy') || cat.includes('lait')) return 'bg-blue-100 text-blue-800';
        if (cat.includes('grain') || cat.includes('céréale')) return 'bg-amber-100 text-amber-800';
        return 'bg-slate-100 text-slate-800';
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    return (
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Apple className="h-8 w-8 text-[#7B3FF2]" aria-hidden="true" />
                        Alimentation
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500" aria-live="polite">
                        {globalTotal !== null ? `${globalTotal} aliments dans votre bibliothèque` : 'Chargement...'}
                    </p>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    {isSelectMode && selectedIds.length > 0 && (
                        <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-100 text-red-700 hover:bg-red-150 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Supprimer ({selectedIds.length})</span>
                        </button>
                    )}

                    {isSelectMode && (
                        <button onClick={toggleSelectAll} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                            {selectedIds.length === foods.length && foods.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-[#7B3FF2]" aria-hidden="true" />
                            ) : (
                                <Square className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">
                                {selectedIds.length === foods.length && foods.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </span>
                        </button>
                    )}

                    <button onClick={toggleSelectMode} className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-colors text-sm font-bold border focus:outline-none focus-visible:ring-2 ${isSelectMode ? 'bg-slate-800 border-slate-800 text-white hover:bg-slate-700 focus-visible:ring-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-[#7B3FF2]'}`}>
                        {isSelectMode ? <X className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                        <span className="hidden sm:inline">{isSelectMode ? 'Annuler' : 'Sélection'}</span>
                    </button>

                    <Link to="/food/create" className="flex items-center justify-center bg-[#7B3FF2] hover:bg-[#6830d1] text-white transition-colors sm:px-4 sm:py-2.5 rounded-xl w-10 h-10 sm:w-auto sm:h-auto shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2">
                        <Plus className="h-5 w-5 sm:mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline font-bold text-sm">Ajouter un aliment</span>
                    </Link>
                </div>
            </header>

            <section aria-label="Recherche et filtres" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <input
                            type="search"
                            placeholder="Rechercher un aliment, une marque..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Rechercher un aliment"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                        />
                    </div>

                    <div className="relative shrink-0 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SlidersHorizontal className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <label htmlFor="sort-select" className="sr-only">Trier les aliments</label>
                        <select
                            id="sort-select"
                            value={sortBy}
                            onChange={handleSortChange}
                            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] appearance-none cursor-pointer"
                        >
                            <option value="recent">Les plus récents</option>
                            <option value="oldest">Les plus anciens</option>
                            <option value="protein_high">Protéines (+ au -)</option>
                            <option value="calories_high">Calories (+ au -)</option>
                            <option value="calories_low">Calories (- au +)</option>
                            <option value="carbs_low">Glucides (Low Carb)</option>
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
                            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                activeFilter === filter
                                    ? 'bg-[#4A6BF0] text-white shadow-md '
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {filterTranslations[filter] || filter}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6" aria-hidden="true">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white p-5 h-40 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                            <div className="pt-6 space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-full"></div>
                                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : foods.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                    <p className="text-slate-500 font-bold">Aucun aliment trouvé avec ces critères.</p>
                </div>
            ) : (
                <section aria-label="Liste des aliments">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {foods.map((food) => {
                            const isSelected = selectedIds.includes(food.id);
                            return (
                                <li key={food.id}>
                                    {isSelectMode ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleSelection(food.id)}
                                            className={`w-full text-left block h-full bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 ${
                                                isSelected ? 'border-[#7B3FF2] shadow-md bg-blue-50/30' : 'border-slate-100 shadow-sm hover:border-slate-200'
                                            }`}
                                        >
                                            <CardContent food={food} isSelected={isSelected} isSelectMode={isSelectMode} getCategoryStyles={getCategoryStyles} filterTranslations={filterTranslations} />
                                        </button>
                                    ) : (
                                        <Link 
                                            to={`/food/${food.id}`}
                                            aria-label={`Voir les détails de l'aliment ${food.name}`}
                                            className="block h-full bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-[#7B3FF2] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2"
                                        >
                                            <CardContent food={food} isSelected={false} isSelectMode={false} getCategoryStyles={getCategoryStyles} filterTranslations={filterTranslations} />
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

function CardContent({ food, isSelected, isSelectMode, getCategoryStyles, filterTranslations }: { food: Food, isSelected: boolean, isSelectMode: boolean, getCategoryStyles: (c: string) => string, filterTranslations: Record<string, string> }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 capitalize truncate pr-2" title={food.name}>
                    {food.name}
                </h2>
                {isSelectMode && (
                    <div className={`shrink-0 ${isSelected ? 'text-[#7B3FF2]' : 'text-slate-300'}`} aria-hidden="true">
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </div>
                )}
            </div>
            
            <span className={`inline-block w-fit px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold mb-4 ${getCategoryStyles(food.category)}`}>
                {filterTranslations[food.category] || food.category}
            </span>
            
            <div className="mt-auto pt-4 border-t border-slate-50">
                {/* Ligne 1 : Calories & Protéines */}
                <div className="flex items-center justify-between gap-2 mb-2 text-slate-600 text-xs font-medium">
                    <div className="flex items-center gap-1.5" title="Calories pour 100g">
                        <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                        <span>{food.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Protéines pour 100g">
                        <Beef className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                        <span>{food.protein}g pro</span>
                    </div>
                </div>
                {/* Ligne 2 : Glucides & Lipides */}
                <div className="flex items-center justify-between gap-2 text-slate-500 text-xs font-medium">
                    <div className="flex items-center gap-1.5" title="Glucides pour 100g">
                        <Wheat className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                        <span>{food.carbohydrates}g glu</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Lipides pour 100g">
                        <Droplet className="h-3.5 w-3.5 text-yellow-500" aria-hidden="true" />
                        <span>{food.fat}g lip</span>
                    </div>
                </div>
            </div>
        </div>
    );
}