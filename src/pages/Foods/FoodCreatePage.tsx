/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    UploadCloud
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

export default function FoodCreatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Référence pour l'input file caché
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialisation avec des 0 pour satisfaire les "required" du back-end
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            // Conversion automatique en nombre pour les champs de type 'number'
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
        }));
    };

    // Gestion de l'upload d'image et conversion en Base64
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image est trop volumineuse. La taille maximum est de 5 MB.");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                // Le résultat est une chaîne Base64 (data URI) qui peut être lue comme une URL classique
                setForm(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.name.trim()) {
            toast.error("Veuillez renseigner le nom de l'aliment.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                mutate: [
                    {
                        operation: "create",
                        attributes: {
                            name: form.name,
                            category: form.category,
                            // Si le champ image est vide, on n'envoie pas de chaîne vide
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
            
            toast.success(`L'aliment "${form.name}" a été créé avec succès !`);
            navigate('/foods');
        } catch (err: any) {
            console.error("Erreur lors de la création de l'aliment:", err);
            if (err.response?.status === 422) {
                toast.error("Erreur de validation. Vérifiez que tous les champs numériques sont remplis.");
            } else {
                toast.error("Impossible de créer l'aliment. Problème de communication serveur.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            
            {/* Input file caché déclenché par le bouton */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
                aria-hidden="true"
            />

            <nav aria-label="Navigation secondaire">
                <Link 
                    to="/foods" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour aux aliments</span>
                </Link>
            </nav>

            <header>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Ajouter un aliment
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Enrichissez la base de données nutritionnelle de l'application. (Valeurs pour 100g)
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
                                placeholder="Ex: Blanc de poulet, Riz basmati complet..."
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
                                Image (URL ou fichier)
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text" // On passe en text pour supporter le format Base64
                                    id="image"
                                    name="image"
                                    value={form.image}
                                    onChange={handleChange}
                                    placeholder="https://... ou importez un fichier"
                                    className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] truncate"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#7B3FF2] transition-colors focus:outline-none"
                                    title="Uploader une image depuis l'ordinateur"
                                >
                                    <UploadCloud className="h-5 w-5" />
                                </button>
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
                                    step="any"
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
                                    step="any"
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
                                    step="any"
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
                                    step="any"
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
                                step="any"
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
                                step="any"
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
                                step="any"
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
                                step="any"
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
                        <span>{isSubmitting ? 'Création en cours...' : "Enregistrer l'aliment"}</span>
                    </button>
                </footer>

            </form>
        </main>
    );
}