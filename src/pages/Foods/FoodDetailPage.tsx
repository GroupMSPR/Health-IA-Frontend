/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Trash2, 
    Edit, 
    AlertTriangle,
    Flame,
    Apple,
    Activity,
    Info
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface Food {
    id: string;
    name: string;
    category: string;
    image?: string | null;
    calories: number | string;
    protein: number | string;
    carbohydrates: number | string;
    fat: number | string;
    fiber: number | string;
    sugars: number | string;
    sodium: number | string;
    cholesterol: number | string;
}

const filterTranslations: Record<string, string> = {
    'All': 'Tous',
    'Meat': 'Viandes & Poissons',
    'Vegetables': 'Légumes',
    'Fruits': 'Fruits',
    'Dairy': 'Produits laitiers',
    'Grains': 'Céréales & Féculents',
    'Snacks': 'Snacks'
};

const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000";

export default function FoodDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [food, setFood] = useState<Food | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoodDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.post('/api/foods/search', {
                    search: {
                        filters: [
                            { field: 'id', operator: 'in', value: [id] }
                        ],
                    }
                });

                const results = response.data?.data || response.data;

                if (Array.isArray(results) && results.length > 0) {
                    setFood(results[0]);
                } else if (results && results.id) {
                    setFood(results);
                } else {
                    setError("L'aliment demandé est introuvable.");
                    toast.error("Aliment introuvable.");
                }
            } catch (err: any) {
                console.error("Erreur récupération détail aliment:", err);
                const msg = "Impossible de charger les détails de l'aliment.";
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFoodDetail();
    }, [id]);

    const handleDelete = async () => {
        if (!food) return;
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'aliment "${food.name}" ?`)) return;

        try {
            await axios.delete('/api/foods', { data: { resources: [food.id] } });
            toast.success("L'aliment a été supprimé avec succès.");
            navigate('/foods');
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            toast.error("Impossible de supprimer cet aliment.");
        }
    };

    const getCategoryStyles = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('meat') || cat.includes('viande')) return 'bg-red-100 text-red-800';
        if (cat.includes('fruit') || cat.includes('vegetable') || cat.includes('légume')) return 'bg-green-100 text-green-800';
        if (cat.includes('dairy') || cat.includes('lait')) return 'bg-blue-100 text-blue-800';
        if (cat.includes('grain') || cat.includes('céréale')) return 'bg-amber-100 text-amber-800';
        return 'bg-slate-100 text-slate-800';
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

    if (error || !food) {
        return (
            <div className="max-w-7xl mx-auto p-5 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700" role="alert">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <div>
                    <p className="text-sm font-bold">{error || "Une erreur inconnue est survenue."}</p>
                    <Link to="/foods" className="mt-2 inline-block text-sm underline font-medium hover:text-red-800">
                        Retourner à la liste des aliments
                    </Link>
                </div>
            </div>
        );
    }

    // --- CORRECTION DES DONNÉES ---
    // On force la conversion en nombres pour éviter la concaténation de chaînes SQL
    const calories = Number(food.calories) || 0;
    const protein = Number(food.protein) || 0;
    const carbohydrates = Number(food.carbohydrates) || 0;
    const fat = Number(food.fat) || 0;
    const sugars = Number(food.sugars) || 0;
    const fiber = Number(food.fiber) || 0;
    const sodium = Number(food.sodium) || 0;
    const cholesterol = Number(food.cholesterol) || 0;

    // Calculs pour la répartition des macros (Graphique Donut)
    const totalMacros = protein + carbohydrates + fat;
    const safeTotal = totalMacros > 0 ? totalMacros : 1; 
    
    const proteinPct = Math.round((protein / safeTotal) * 100);
    const carbsPct = Math.round((carbohydrates / safeTotal) * 100);
    const fatPct = Math.round((fat / safeTotal) * 100);

    // Dégradé : S'il n'y a pas de macros, on affiche un cercle gris neutre (#f1f5f9)
    const donutGradient = totalMacros > 0 
        ? `conic-gradient(
            #3b82f6 0% ${proteinPct}%, 
            #f97316 ${proteinPct}% ${proteinPct + carbsPct}%, 
            #eab308 ${proteinPct + carbsPct}% 100%
        )`
        : `conic-gradient(#f1f5f9 0% 100%)`;

    return (
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            <nav aria-label="Navigation secondaire" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link 
                    to="/foods" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour aux aliments</span>
                </Link>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Link 
                        to={`/food/${food.id}/edit`}
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
                <section aria-labelledby="food-title" className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                        
                        {/* EMPLACEMENT IMAGE / BANNIÈRE AVEC OVERLAY */}
                        <div className="w-full h-56 sm:h-72 bg-slate-900 relative flex items-end justify-start group">
                            <img 
                                src={food.image || DEFAULT_FOOD_IMAGE} 
                                alt={`Image de ${food.name}`} 
                                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            
                            <div className="relative z-10 p-6 sm:p-8 w-full">
                                <h1 id="food-title" className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight capitalize drop-shadow-md">
                                    {food.name}
                                </h1>
                                <div className="flex flex-wrap gap-2 items-center mt-2">
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${getCategoryStyles(food.category)}`}>
                                        {filterTranslations[food.category] || food.category}
                                    </span>
                                    <span className="px-3 py-1 bg-white/20 text-white backdrop-blur-md rounded-md text-xs font-bold shadow-sm border border-white/10">
                                        Pour 100g
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contenu textuel de la carte */}
                        <div className="p-6 sm:p-8">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                    <Activity className="h-5 w-5 text-[#7B3FF2]" />
                                    Analyse nutritionnelle
                                </h2>
                                
                                <div className="space-y-4">
                                    {/* Protéines */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-slate-600">Protéines</span>
                                            <span className="font-bold text-slate-900">{protein}g</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(proteinPct, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Glucides */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-slate-600">Glucides</span>
                                            <span className="font-bold text-slate-900">{carbohydrates}g</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(carbsPct, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Lipides */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-slate-600">Lipides</span>
                                            <span className="font-bold text-slate-900">{fat}g</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${Math.min(fatPct, 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Micronutriments */}
                                <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3">Micronutriments & autres</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Sucres purs</span>
                                            <span className="font-bold text-slate-700">{sugars}g</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Fibres alimentaires</span>
                                            <span className="font-bold text-slate-700">{fiber}g</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Sodium</span>
                                            <span className="font-bold text-slate-700">{sodium}mg</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Cholestérol</span>
                                            <span className="font-bold text-slate-700">{cholesterol}mg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COLONNE DROITE : Sidebar sticky */}
                <aside aria-label="Vue d'ensemble" className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-6 lg:sticky lg:top-8">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Vue d'ensemble</h2>
                    
                    {/* Carte Calories */}
                    <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                            <Flame className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Énergie / 100g</p>
                            <p className="text-xl font-extrabold text-slate-900">{calories} <span className="text-sm font-medium text-slate-500">kcal</span></p>
                        </div>
                    </div>

                    {/* Donut Chart Macros */}
                    <div className="p-5 border border-slate-100 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <Info className="h-4 w-4 text-slate-400" />
                            Répartition
                        </h3>
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-28 h-28 shrink-0 rounded-full shadow-inner transition-all duration-300" style={{ background: donutGradient }}>
                                <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    {totalMacros === 0 && <span className="text-xs font-bold text-slate-300">0g</span>}
                                </div>
                            </div>
                            
                            <div className="space-y-3 w-full">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                                        <span className="text-slate-600 font-medium">Protéines</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{totalMacros > 0 ? proteinPct : 0}%</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
                                        <span className="text-slate-600 font-medium">Glucides</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{totalMacros > 0 ? carbsPct : 0}%</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500"></span>
                                        <span className="text-slate-600 font-medium">Lipides</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{totalMacros > 0 ? fatPct : 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#7B3FF2]/5 to-[#4A6BF0]/5 border border-[#7B3FF2]/10 rounded-xl p-4 text-center">
                        <Apple className="h-6 w-6 text-[#7B3FF2] mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-800">Généré par Health-IA Coach</p>
                        <p className="text-[11px] text-slate-500 mt-1">Valeurs nutritionnelles moyennes basées sur une portion de 100 grammes.</p>
                    </div>
                </aside>

            </div>
        </main>
    );
}