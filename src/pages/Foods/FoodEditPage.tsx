import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Save, 
    Apple, 
    Flame, 
    Activity,
    Image as ImageIcon,
    Beef,
    Wheat,
    Droplet,
    Dna,
    AlertTriangle
} from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface FormState {
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
}

export default function FoodEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>({
        name: '',
        category: 'Vegetables',
        image: '',
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugars: 0,
        sodium: 0,
        cholesterol: 0
    });

    useEffect(() => {
        const loadFoodData = async () => {
            if (!id) return;
            setIsLoadingData(true);
            setError(null);

            try {
                // Récupération des détails de l'aliment
                const response = await axios.post('/api/foods/search', {
                    search: {
                        filters: [{ field: 'id', operator: 'in', value: [id] }],
                    }
                });

                const results = response.data?.data || response.data;
                const currentFood = Array.isArray(results) ? results[0] : results;

                if (!currentFood || !currentFood.id) {
                    setError("L'aliment à modifier est introuvable.");
                    return;
                }

                // Pré-remplissage du formulaire
                setForm({
                    name: currentFood.name || '',
                    category: currentFood.category || 'Vegetables',
                    image: currentFood.image || '',
                    calories: Number(currentFood.calories) || 0,
                    protein: Number(currentFood.protein) || 0,
                    carbohydrates: Number(currentFood.carbohydrates) || 0,
                    fat: Number(currentFood.fat) || 0,
                    fiber: Number(currentFood.fiber) || 0,
                    sugars: Number(currentFood.sugars) || 0,
                    sodium: Number(currentFood.sodium) || 0,
                    cholesterol: Number(currentFood.cholesterol) || 0
                });

            } catch (err) {
                console.error("Erreur lors du chargement des données d'édition:", err);
                setError("Impossible de charger les données de l'aliment.");
            } finally {
                setIsLoadingData(false);
            }
        };

        loadFoodData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            // Conversion automatique en nombre pour les champs numériques
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.name.trim()) {
            toast.error("Veuillez renseigner le nom de l'aliment.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Payload Lomkit REST pour la mise à jour (update)
            const payload = {
                mutate: [
                    {
                        operation: "update",
                        key: id, // L'ID de l'aliment à modifier
                        attributes: {
                            name: form.name,
                            category: form.category,
                            image: form.image.trim() || null,
                            calories: form.calories,
                            protein: form.protein,
                            carbohydrates: form.carbohydrates,
                            fat: form.fat,
                            fiber: form.fiber,
                            sugars: form.sugars,
                            sodium: form.sodium,
                            cholesterol: form.cholesterol
                        }
                    }
                ]
            };

            await axios.post('/api/foods/mutate', payload);
            
            toast.success(`L'aliment "${form.name}" a été mis à jour avec succès !`);
            navigate(`/food/${id}`);
        } catch (err: any) {
            console.error("Erreur lors de la modification de l'aliment:", err);
            if (err.response?.status === 422) {
                toast.error("Erreur de validation. Vérifiez les champs du formulaire.");
            } else {
                toast.error("Impossible d'enregistrer les modifications.");
            }
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
                    <Link to="/foods" className="mt-2 inline-block text-sm underline font-medium hover:text-red-800">
                        Retourner à la liste des aliments
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            <nav aria-label="Navigation secondaire">
                <Link 
                    to={`/foods/${id}`} 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Annuler et retourner au détail</span>
                </Link>
            </nav>

            <header>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Modifier l'aliment
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Ajustez les valeurs nutritionnelles et les détails de ce produit.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 sm:p-8 space-y-8">
                
                {/* SECTION 1 : Informations Générales */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Apple className="h-5 w-5 text-[#7B3FF2]" />
                        <span>Informations générales</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">
                                Nom de l'aliment <span className="text-red-500" aria-hidden="true">*</span>
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
                                <option value="Meat">Viandes & Poissons</option>
                                <option value="Vegetables">Légumes</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Dairy">Produits laitiers</option>
                                <option value="Grains">Céréales & Féculents</option>
                                <option value="Snacks">Snacks & Autre</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm font-bold text-slate-700 mb-1">
                                URL de l'image (optionnel)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="url"
                                    id="image"
                                    name="image"
                                    value={form.image}
                                    onChange={handleChange}
                                    placeholder="https://exemple.com/image.jpg"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 : Macronutriments */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <span>Macronutriments & Énergie (pour 100g)</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                        <div>
                            <label htmlFor="calories" className="block text-sm font-bold text-slate-700 mb-1">
                                Calories
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="calories"
                                    name="calories"
                                    min="0"
                                    step="0.01"
                                    value={form.calories}
                                    onChange={handleChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                                />
                                <Flame className="absolute right-3 top-3 h-4 w-4 text-orange-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="protein" className="block text-sm font-bold text-slate-700 mb-1">
                                Protéines (g)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="protein"
                                    name="protein"
                                    min="0"
                                    step="0.01"
                                    value={form.protein}
                                    onChange={handleChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                                />
                                <Beef className="absolute right-3 top-3 h-4 w-4 text-blue-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="carbohydrates" className="block text-sm font-bold text-slate-700 mb-1">
                                Glucides (g)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="carbohydrates"
                                    name="carbohydrates"
                                    min="0"
                                    step="0.01"
                                    value={form.carbohydrates}
                                    onChange={handleChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                                />
                                <Wheat className="absolute right-3 top-3 h-4 w-4 text-orange-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="fat" className="block text-sm font-bold text-slate-700 mb-1">
                                Lipides (g)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="fat"
                                    name="fat"
                                    min="0"
                                    step="0.01"
                                    value={form.fat}
                                    onChange={handleChange}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                                />
                                <Droplet className="absolute right-3 top-3 h-4 w-4 text-yellow-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 : Micronutriments */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Dna className="h-5 w-5 text-emerald-500" />
                        <span>Micronutriments & Détails (pour 100g)</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                        <div>
                            <label htmlFor="fiber" className="block text-sm font-bold text-slate-700 mb-1">
                                Fibres (g)
                            </label>
                            <input
                                type="number"
                                id="fiber"
                                name="fiber"
                                min="0"
                                step="0.01"
                                value={form.fiber}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="sugars" className="block text-sm font-bold text-slate-700 mb-1">
                                Sucres (g)
                            </label>
                            <input
                                type="number"
                                id="sugars"
                                name="sugars"
                                min="0"
                                step="0.01"
                                value={form.sugars}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="sodium" className="block text-sm font-bold text-slate-700 mb-1">
                                Sodium (mg)
                            </label>
                            <input
                                type="number"
                                id="sodium"
                                name="sodium"
                                min="0"
                                step="0.01"
                                value={form.sodium}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
                            />
                        </div>

                        <div>
                            <label htmlFor="cholesterol" className="block text-sm font-bold text-slate-700 mb-1">
                                Cholestérol (mg)
                            </label>
                            <input
                                type="number"
                                id="cholesterol"
                                name="cholesterol"
                                min="0"
                                step="0.01"
                                value={form.cholesterol}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2]"
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