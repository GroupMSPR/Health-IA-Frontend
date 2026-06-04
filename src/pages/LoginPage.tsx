import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { isAxiosError } from 'axios';
import { Check, Activity, Users, Trophy } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const { login } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: [] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setGlobalError('');
        setErrors({});

        try {
            await axios.get('/sanctum/csrf-cookie');
            
            const response = await axios.post('/api/login', formData);
            
            if (response.status >= 200 && response.status < 300) {
                if (login) {
                    login(response.data.user); 
                }
                
                navigate('/dashboard'); 
            }
        } catch (err) {
            if (isAxiosError(err)) {
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors || {});
                } else if (err.response?.status === 401) {
                    setGlobalError("Identifiants incorrects. Veuillez réessayer.");
                } else if (!err.response) {
                    setGlobalError("Impossible de joindre le serveur. Vérifiez votre connexion internet.");
                } else {
                    setGlobalError("Une erreur inattendue est survenue. Veuillez réessayer plus tard.");
                }
            } else {
                setGlobalError("Erreur critique de l'application.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
            
            {/* ================= SECTION GAUCHE / HAUT (PRÉSENTATION) ================= */}
            <section className="bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-white lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:p-20 relative overflow-hidden">
                <div className="absolute top-8 left-6 lg:top-12 lg:left-12 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Activity className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">Health AI Coach</span>
                </div>

                {/* Mobile / Tablette */}
                <div className="mt-12 lg:hidden text-center sm:text-left">
                    <h1 className="text-3xl font-extrabold mb-2 text-white">Ravi de vous revoir !</h1>
                    <p className="text-blue-50 text-sm sm:text-base mb-8">Connectez-vous pour continuer votre aventure sportive.</p>
                    
                    <div className="hidden sm:flex gap-4 mb-4">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm flex-1 text-center border border-white/10">
                            <div className="text-2xl font-bold text-white">10K+</div>
                            <div className="text-xs text-blue-50">Participants</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm flex-1 text-center border border-white/10">
                            <div className="text-2xl font-bold text-white">500+</div>
                            <div className="text-xs text-blue-50">Exercices</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm flex-1 text-center border border-white/10">
                            <div className="text-2xl font-bold text-white">95%</div>
                            <div className="text-xs text-blue-50">Satisfaction</div>
                        </div>
                    </div>
                </div>

                {/* Desktop */}
                <div className="hidden lg:block mt-20 max-w-lg">
                    <h1 className="text-5xl font-extrabold leading-tight mb-6 text-white">
                        Votre Coach<br />Fitness Personnel<br />Boosté par IA
                    </h1>
                    <p className="text-lg text-white mb-10 leading-relaxed">
                        Suivez vos progrès et atteignez vos objectifs<br />grâce à un coaching propulsé par l'IA.
                    </p>

                    <ul className="space-y-4 mb-16">
                        <li className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-md p-1">
                                <Check className="h-4 w-4 text-white" aria-hidden="true" />
                            </div>
                            <span className="text-white font-medium">Programmes personnalisés par l'IA</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-md p-1">
                                <Check className="h-4 w-4 text-white" aria-hidden="true" />
                            </div>
                            <span className="text-white font-medium">Suivi intelligent des objectifs & conseils</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-md p-1">
                                <Check className="h-4 w-4 text-white" aria-hidden="true" />
                            </div>
                            <span className="text-white font-medium">Statistiques de progression en temps réel</span>
                        </li>
                    </ul>

                    <div className="flex gap-6">
                        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md flex-1 border border-white/10 shadow-xl">
                            <div className="flex justify-center mb-2"><Users className="h-6 w-6 text-blue-50" /></div>
                            <div className="text-2xl font-bold text-center text-white">10K+</div>
                            <div className="text-xs text-center text-blue-50 font-medium mt-1">Utilisateurs actifs</div>
                        </div>
                        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md flex-1 border border-white/10 shadow-xl">
                            <div className="flex justify-center mb-2"><Activity className="h-6 w-6 text-blue-50" /></div>
                            <div className="text-2xl font-bold text-center text-white">500+</div>
                            <div className="text-xs text-center text-blue-50 font-medium mt-1">Entraînements</div>
                        </div>
                        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md flex-1 border border-white/10 shadow-xl">
                            <div className="flex justify-center mb-2"><Trophy className="h-6 w-6 text-blue-50" /></div>
                            <div className="text-2xl font-bold text-center text-white">95%</div>
                            <div className="text-xs text-center text-blue-50 font-medium mt-1">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FORMULAIRE ================= */}
            <section className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-16 relative z-10 -mt-8 sm:-mt-12 lg:mt-0">
                <div className="w-full max-w-md bg-transparent rounded-3xl lg:rounded-none shadow-xl lg:shadow-none p-8 sm:p-10 lg:p-0">
                    
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">Ravi de vous revoir !</h2>
                        <p className="text-slate-500 mt-2">Connectez-vous pour continuer votre aventure sportive.</p>
                    </div>

                    {globalError && (
                        <div 
                            role="alert" 
                            aria-live="assertive"
                            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium"
                        >
                            {globalError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                aria-invalid={errors.email ? "true" : "false"}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                                    errors.email 
                                    ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50' 
                                    : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 bg-slate-50/50 hover:bg-slate-50'
                                }`}
                                placeholder="alex@example.com"
                            />
                            {errors.email && (
                                <p id="email-error" className="mt-2 text-sm text-red-600 font-medium">
                                    {errors.email[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                aria-invalid={errors.password ? "true" : "false"}
                                aria-describedby={errors.password ? "password-error" : undefined}
                                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all tracking-widest ${
                                    errors.password 
                                    ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50' 
                                    : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 bg-slate-50/50 hover:bg-slate-50'
                                }`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p id="password-error" className="mt-2 text-sm text-red-600 font-medium">
                                    {errors.password[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded border-radius-lg cursor-pointer"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                                    Se souvenir de moi
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-500">
                                    Mot de passe oublié?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            aria-busy={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#7B3FF2] hover:bg-[#6830d1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B3FF2] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connexion en cours...
                                </span>
                            ) : (
                                "Se connecter"
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-medium">ou continuer avec</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors"
                            >
                                <img src="/google-icon.svg" alt="" aria-hidden="true" className="w-5 h-5" />
                                <span className="hidden sm:inline">Google</span>
                                <span className="sm:hidden">Google</span>
                            </button>

                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors"
                            >
                                <img src="/github-icon.svg" alt="" aria-hidden="true" className="w-5 h-5" />
                                <span className="hidden sm:inline">GitHub</span>
                                <span className="sm:hidden">GitHub</span>
                            </button>

                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors"
                            >
                                <img src="/apple-icon.svg" alt="" aria-hidden="true" className="w-5 h-5" />
                                <span className="hidden sm:inline">Apple</span>
                                <span className="sm:hidden">Apple</span>
                            </button>

                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors"
                            >
                                <img src="/microsoft-icon.svg" alt="" aria-hidden="true" className="w-5 h-5" />
                                <span className="hidden sm:inline">Microsoft</span>
                                <span className="sm:hidden">MS</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-slate-600 sm:text-center lg:text-left">
                        Tu as déjà un compte?{' '}
                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                            S'inscrire gratuitement
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}