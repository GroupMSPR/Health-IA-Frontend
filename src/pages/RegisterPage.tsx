import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axios';
import { isAxiosError } from 'axios';

export default function Register() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [globalError, setGlobalError] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        birthdate: '',
        gender: 'Femme',
        weight: '',
        height: '',
        body_fat_pct: '',
        physical_activity_level: 'Actif(ve)',
        daily_caloric_intake: '2000',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: [] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        setGlobalError('');

        try {
            await axios.get('/sanctum/csrf-cookie');

            await axios.post('/api/register', {
                ...formData,
                weight: parseFloat(formData.weight),
                height: parseInt(formData.height),
                body_fat_pct: parseFloat(formData.body_fat_pct),
                daily_caloric_intake: parseInt(formData.daily_caloric_intake),
            });

            navigate('/login', { state: { message: "Inscription réussie ! Veuillez vous connecter." } });
            
        } catch (err) {
            if (isAxiosError(err) && err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setGlobalError('Impossible de finaliser l\'inscription. Vérifiez votre connexion.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">Rejoignez Health AI Coach</h2>
                    <p className="mt-2 text-sm text-slate-500">Créez votre profil de santé personnalisé</p>
                </div>
                
                {globalError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center font-medium">{globalError}</div>
                )}

                <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Identité & Connexion</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Prénom</label>
                                <input name="first_name" type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom</label>
                                <input name="last_name" type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name[0]}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                <input name="email" type="email" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Mot de passe</label>
                                <input name="password" type="password" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmer le mot de passe</label>
                                <input name="password_confirmation" type="password" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Métriques de santé</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Date de naissance</label>
                                <input name="birthdate" type="date" required className="w-full border border-slate-300 rounded-lg p-2.5" onChange={handleChange} />
                                {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Genre</label>
                                <select name="gender" className="w-full border border-slate-300 rounded-lg p-2.5 bg-white" onChange={handleChange}>
                                    <option value="male">Homme</option>
                                    <option value="female">Femme</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Niveau d'activité</label>
                                <select name="physical_activity_level" className="w-full border border-slate-300 rounded-lg p-2.5 bg-white" onChange={handleChange}>
                                    <option value="Sédentaire">Sédentaire</option>
                                    <option value="Moyennement Actif(ve)">Moyennement Actif(ve)</option>
                                    <option value="Actif(ve)">Actif(ve)</option>
                                </select>
                                {errors.physical_activity_level && <p className="text-red-500 text-xs mt-1">{errors.physical_activity_level[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Taille (cm)</label>
                                <input name="height" type="number" required placeholder="Ex: 180" className="w-full border border-slate-300 rounded-lg p-2.5" onChange={handleChange} />
                                {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Poids (kg)</label>
                                <input name="weight" type="number" step="0.1" required placeholder="Ex: 75.5" className="w-full border border-slate-300 rounded-lg p-2.5" onChange={handleChange} />
                                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Masse Grasse (%)</label>
                                <input name="body_fat_pct" type="number" step="0.1" required placeholder="Ex: 18.5" className="w-full border border-slate-300 rounded-lg p-2.5" onChange={handleChange} />
                                {errors.body_fat_pct && <p className="text-red-500 text-xs mt-1">{errors.body_fat_pct[0]}</p>}
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Apport calorique cible (kcal)</label>
                                <input name="daily_caloric_intake" type="number" defaultValue="2000" required className="w-full border border-slate-300 rounded-lg p-2.5" onChange={handleChange} />
                                {errors.daily_caloric_intake && <p className="text-red-500 text-xs mt-1">{errors.daily_caloric_intake[0]}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
                            {isSubmitting ? 'Création de votre dossier...' : 'Créer mon compte'}
                        </button>
                    </div>
                </form>

                <div className="text-center pt-2">
                    <p className="text-sm text-slate-600">
                        Vous avez déjà un compte ? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">Connectez-vous ici</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}