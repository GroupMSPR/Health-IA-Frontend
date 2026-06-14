import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    Sparkles, 
    Save, 
    Flame,
    Activity,
    AlertTriangle,
    RefreshCw,
    Info,
    CheckCircle2,
    Apple
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface FoodAIResult {
    name: string;
    category: string;
    image: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugars: number;
    sodium: number;
    cholesterol: number;
    confidence?: number;
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

export default function FoodScanIAResultPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSaving, setIsSaving] = useState(false);
    
    // On récupère le mock (ou les vraies datas plus tard) passé via navigate()
    const food = location.state?.aiResult as FoodAIResult;

    // Si on accède à la page sans passer par le scan, on redirige
    useEffect(() => {
        if (!food) {
            navigate('/food-scan');
        }
        window.scrollTo(0, 0);
    }, [food, navigate]);

    if (!food) return null;

    const handleSave = async () => {
        setIsSaving(true);

        try {
            // Vraie requête de création via Lomkit
            const payload = {
                mutate: [
                    {
                        operation: "create",
                        attributes: {
                            name: food.name,
                            category: food.category,
                            image: food.image,
                            calories: food.calories,
                            protein: food.protein,
                            carbohydrates: food.carbohydrates,
                            fat: food.fat,
                            fiber: food.fiber,
                            sugars: food.sugars,
                            sodium: food.sodium,
                            cholesterol: food.cholesterol
                        }
                    }
                ]
            };

            await axios.post('/api/foods/mutate', payload);
            
            toast.success(`L'aliment "${food.name}" a été ajouté à votre bibliothèque !`);
            navigate('/foods');
        } catch (err: any) {
            console.error("Erreur lors de l'enregistrement:", err);
            toast.error("Impossible d'enregistrer l'aliment. Vérifiez votre connexion.");
            setIsSaving(false);
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

    // Calculs pour la répartition des macros (Graphique Donut)
    const calories = Number(food.calories) || 0;
    const protein = Number(food.protein) || 0;
    const carbohydrates = Number(food.carbohydrates) || 0;
    const fat = Number(food.fat) || 0;

    const totalMacros = protein + carbohydrates + fat;
    const safeTotal = totalMacros > 0 ? totalMacros : 1; 
    
    const proteinPct = Math.round((protein / safeTotal) * 100);
    const carbsPct = Math.round((carbohydrates / safeTotal) * 100);
    const fatPct = Math.round((fat / safeTotal) * 100);

    const donutGradient = totalMacros > 0 
        ? `conic-gradient(
            #3b82f6 0% ${proteinPct}%, 
            #f97316 ${proteinPct}% ${proteinPct + carbsPct}%, 
            #eab308 ${proteinPct + carbsPct}% 100%
        )`
        : `conic-gradient(#f1f5f9 0% 100%)`;

    return (
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500 mb-24">
            
            <nav aria-label="Navigation secondaire" className="flex items-center justify-between">
                <Link 
                    to="/food-scan" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refaire un scan</span>
                </Link>
            </nav>

            <header className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Résultat de l'Analyse
                </h1>
                <p className="text-slate-500 font-medium text-sm sm:text-base flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    L'IA a identifié cet aliment avec succès.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                
                {/* COLONNE GAUCHE : Infos principales (Basé sur FoodDetail) */}
                <section className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden">
                        
                        {/* EMPLACEMENT IMAGE / BANNIÈRE AVEC OVERLAY */}
                        <div className="w-full h-56 sm:h-72 bg-slate-900 relative flex items-end justify-start group">
                            <img 
                                src={food.image || DEFAULT_FOOD_IMAGE} 
                                alt={`Image de ${food.name}`} 
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            
                            {/* Badge de certitude IA flottant */}
                            {food.confidence && (
                                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg animate-pulse">
                                    <Sparkles className="h-4 w-4 text-amber-300" />
                                    <span className="text-xs font-bold text-white">Précision IA: {food.confidence}%</span>
                                </div>
                            )}

                            {/* Texte en superposition */}
                            <div className="relative z-10 p-6 sm:p-8 w-full">
                                <div className="flex flex-wrap gap-2 items-center mb-2">
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${getCategoryStyles(food.category)}`}>
                                        {filterTranslations[food.category] || food.category}
                                    </span>
                                    <span className="px-3 py-1 bg-white/20 text-white backdrop-blur-md rounded-md text-xs font-bold shadow-sm border border-white/10">
                                        Pour 100g
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight capitalize drop-shadow-md">
                                    {food.name}
                                </h1>
                            </div>
                        </div>

                        {/* Contenu textuel de la carte */}
                        <div className="p-6 sm:p-8">
                            
                            {/* Alerte intelligente (ex: Sodium) */}
                            {food.sodium > 500 && (
                                <div className="flex items-start gap-3 p-4 bg-amber-100 border border-amber-300 rounded-2xl text-amber-800 mb-6">
                                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-bold">Haute teneur en sodium détectée</p>
                                        <p className="text-xs font-medium mt-1">L'IA remarque que cet aliment contient {food.sodium}mg de sodium pour 100g. À consommer avec modération.</p>
                                    </div>
                                </div>
                            )}

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
                                            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(proteinPct, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Glucides */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-slate-600">Glucides</span>
                                            <span className="font-bold text-slate-900">{carbohydrates}g</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-orange-500 h-full rounded-full transition-all duration-1000 delay-100" style={{ width: `${Math.min(carbsPct, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Lipides */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-slate-600">Lipides</span>
                                            <span className="font-bold text-slate-900">{fat}g</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-yellow-500 h-full rounded-full transition-all duration-1000 delay-200" style={{ width: `${Math.min(fatPct, 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Micronutriments */}
                                <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3">Micronutriments & autres</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Sucres purs</span>
                                            <span className="font-bold text-slate-700">{food.sugars || 0}g</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Fibres alimentaires</span>
                                            <span className="font-bold text-slate-700">{food.fiber || 0}g</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Sodium</span>
                                            <span className="font-bold text-slate-700">{food.sodium || 0}mg</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl">
                                            <span className="font-medium text-slate-500">Cholestérol</span>
                                            <span className="font-bold text-slate-700">{food.cholesterol || 0}mg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COLONNE DROITE : Sidebar sticky */}
                <aside className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl p-6 space-y-6 lg:sticky lg:top-8">
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
                        <p className="text-xs font-bold text-slate-800">Vision par Ordinateur</p>
                        <p className="text-[11px] text-slate-500 mt-1">Valeurs estimées par notre IA. Vérifiez les informations si nécessaire.</p>
                    </div>

                    <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-[#7B3FF2] hover:bg-[#6830d1] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#7B3FF2]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            <Save className="h-5 w-5" />
                            <span>{isSaving ? "Enregistrement en cours..." : "Enregistrer cet aliment"}</span>
                        </button>
                </aside>
            </div>
        </main>
    );
}