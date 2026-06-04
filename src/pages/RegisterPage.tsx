import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axios';
import { isAxiosError } from 'axios';
import { Activity } from 'lucide-react';

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
        <main className="min-h-screen flex flex-col lg:flex-row bg-slate-50 lg:bg-white font-sans">
            
            <section className="lg:w-[40%] xl:w-[35%] bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden lg:fixed lg:h-screen">
                
                <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                        <Activity className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Health AI Coach</span>
                </div>

                {/* Mobile / Tablette */}
                <div className="mt-10 mb-6 lg:hidden relative z-10">
                    <h1 className="text-3xl font-extrabold mb-2">Créer un compte</h1>
                    <p className="text-blue-100 text-sm">Votre profil de santé personnalisé.</p>
                </div>

                {/* Desktop */}
                <div className="hidden lg:flex flex-col justify-center flex-1 relative z-10 mt-16 max-w-md">
                    <h1 className="text-5xl font-extrabold leading-tight mb-6">
                        Start Your<br />Fitness Journey<br />Today
                    </h1>
                    <p className="text-lg text-blue-100 mb-12 leading-relaxed">
                        Rejoignez Health AI Coach pour atteindre vos objectifs avec un coaching propulsé par l'IA.
                    </p>

                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm shrink-0">01</div>
                            <div>
                                <h3 className="font-bold text-lg">Votre profil</h3>
                                <p className="text-blue-100 text-sm">Saisissez vos métriques de santé</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm shrink-0">02</div>
                            <div>
                                <h3 className="font-bold text-lg">Votre plan</h3>
                                <p className="text-blue-100 text-sm">L'IA génère votre programme</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm shrink-0">03</div>
                            <div>
                                <h3 className="font-bold text-lg">Vos résultats</h3>
                                <p className="text-blue-100 text-sm">Suivez vos progrès en temps réel</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block relative z-10 text-sm text-blue-100">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="font-bold text-white hover:underline">Connectez-vous</Link>
                </div>
            </section>

            {/* ================= FORMULAIRE================= */}
            <section className="flex-1 flex justify-center p-4 sm:p-8 lg:p-12 lg:ml-[40%] xl:ml-[35%] relative z-10 -mt-8 sm:-mt-12 lg:mt-0">
                <div className="w-full max-w-3xl bg-white rounded-3xl lg:rounded-none shadow-xl lg:shadow-none p-6 sm:p-10 lg:p-4">
                    
                    {/* Titre Desktop */}
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">Créer votre compte</h2>
                        <p className="text-slate-500 mt-2">Créez votre profil de santé personnalisé.</p>
                    </div>

                    {globalError && (
                        <div role="alert" className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
                            {globalError}
                        </div>
                    )}

                    <form className="space-y-10" onSubmit={handleSubmit} noValidate>
                        
                        <div className="space-y-5">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Identité & Connexion</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700 mb-2">Prénom</label>
                                    <input 
                                        id="first_name" name="first_name" type="text" required 
                                        value={formData.first_name} onChange={handleChange}
                                        aria-invalid={errors.first_name ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.first_name ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.first_name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.first_name[0]}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
                                    <input 
                                        id="last_name" name="last_name" type="text" required 
                                        value={formData.last_name} onChange={handleChange}
                                        aria-invalid={errors.last_name ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.last_name ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.last_name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.last_name[0]}</p>}
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                    <input 
                                        id="email" name="email" type="email" required 
                                        value={formData.email} onChange={handleChange}
                                        aria-invalid={errors.email ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.email ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.email && <p className="text-red-600 text-xs mt-1 font-medium">{errors.email[0]}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                                    <input 
                                        id="password" name="password" type="password" required 
                                        value={formData.password} onChange={handleChange}
                                        aria-invalid={errors.password ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.password ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.password && <p className="text-red-600 text-xs mt-1 font-medium">{errors.password[0]}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le mot de passe</label>
                                    <input 
                                        id="password_confirmation" name="password_confirmation" type="password" required 
                                        value={formData.password_confirmation} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Métriques de santé</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="birthdate" className="block text-sm font-semibold text-slate-700 mb-2">Date de naissance</label>
                                    <input 
                                        id="birthdate" name="birthdate" type="date" required 
                                        value={formData.birthdate} onChange={handleChange}
                                        aria-invalid={errors.birthdate ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white ${errors.birthdate ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.birthdate && <p className="text-red-600 text-xs mt-1 font-medium">{errors.birthdate[0]}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-2">Genre</label>
                                    <select 
                                        id="gender" name="gender" 
                                        value={formData.gender} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:border-slate-300 focus:ring-2 focus:ring-slate-200 bg-white hover:bg-slate-50"
                                    >
                                        <option value="male">Homme</option>
                                        <option value="female">Femme</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label htmlFor="physical_activity_level" className="block text-sm font-semibold text-slate-700 mb-2">Niveau d'activité physique</label>
                                    <select 
                                        id="physical_activity_level" name="physical_activity_level" 
                                        value={formData.physical_activity_level} onChange={handleChange}
                                        aria-invalid={errors.physical_activity_level ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white ${errors.physical_activity_level ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <option value="Sédentaire">Sédentaire</option>
                                        <option value="Moyennement Actif(ve)">Moyennement Actif(ve)</option>
                                        <option value="Actif(ve)">Actif(ve)</option>
                                    </select>
                                    {errors.physical_activity_level && <p className="text-red-600 text-xs mt-1 font-medium">{errors.physical_activity_level[0]}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                                <div>
                                    <label htmlFor="height" className="block text-sm font-semibold text-slate-700 mb-2">Taille (cm)</label>
                                    <input 
                                        id="height" name="height" type="number" required placeholder="180" 
                                        min={0}
                                        onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                                        value={formData.height} onChange={handleChange}
                                        aria-invalid={errors.height ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.height ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.height && <p className="text-red-600 text-xs mt-1 font-medium">{errors.height[0]}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="weight" className="block text-sm font-semibold text-slate-700 mb-2">Poids (kg)</label>
                                    <input 
                                        id="weight" name="weight" type="number" step="0.1" required placeholder="75.5" 
                                        min={0}
                                        onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                                        value={formData.weight} onChange={handleChange}
                                        aria-invalid={errors.weight ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.weight ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.weight && <p className="text-red-600 text-xs mt-1 font-medium">{errors.weight[0]}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="body_fat_pct" className="block text-sm font-semibold text-slate-700 mb-2">Masse Grasse (%)</label>
                                    <input 
                                        id="body_fat_pct" name="body_fat_pct" type="number" step="0.1" required placeholder="18.5" 
                                        min={0}
                                        onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                                        value={formData.body_fat_pct} onChange={handleChange}
                                        aria-invalid={errors.body_fat_pct ? "true" : "false"}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.body_fat_pct ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                    />
                                    {errors.body_fat_pct && <p className="text-red-600 text-xs mt-1 font-medium">{errors.body_fat_pct[0]}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="daily_caloric_intake" className="block text-sm font-semibold text-slate-700 mb-2">Apport calorique cible (kcal)</label>
                                <input 
                                    id="daily_caloric_intake" name="daily_caloric_intake" type="number" required 
                                    min={0}
                                    onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                                    value={formData.daily_caloric_intake} onChange={handleChange}
                                    aria-invalid={errors.daily_caloric_intake ? "true" : "false"}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.daily_caloric_intake ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'}`} 
                                />
                                {errors.daily_caloric_intake && <p className="text-red-600 text-xs mt-1 font-medium">{errors.daily_caloric_intake[0]}</p>}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                aria-busy={isSubmitting}
                                className="w-full flex justify-center py-4 px-4 rounded-xl text-white font-bold bg-[#7B3FF2] hover:bg-[#6830d1] shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B3FF2] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création du dossier...
                                    </span>
                                ) : 'Créer mon compte'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center lg:hidden">
                        <p className="text-sm text-slate-600">
                            Déjà un compte ? <Link to="/login" className="font-bold text-[#7B3FF2] hover:underline">Connectez-vous ici</Link>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}