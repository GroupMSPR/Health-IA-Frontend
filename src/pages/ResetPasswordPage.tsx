import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../lib/axios';
import { isAxiosError } from 'axios';
import { Activity } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const token = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [globalError, setGlobalError] = useState('');

    const [isExpired, setIsExpired] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const [formData, setFormData] = useState({
        email: emailFromUrl || '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (isExpired) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            const redirect = setTimeout(() => {
                navigate('/login');
            }, 5000);

            return () => {
                clearInterval(timer);
                clearTimeout(redirect);
            };
        }
    }, [isExpired, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            
            await axios.post('/api/reset-password', {
                token,
                ...formData
            });

            navigate('/login', { 
                state: { message: "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter." } 
            });
            
        } catch (err) {
            if (isAxiosError(err) && (err.response?.status === 422 || err.response?.status === 400)) {
                
                if (err.response.status === 400) {
                    setIsExpired(true);
                } else {
                    setErrors(err.response.data.errors || {});
                }

            } else if (isAxiosError(err) && err.response?.data?.message) {
                setGlobalError(err.response.data.message);
            } else {
                setGlobalError('Une erreur est survenue lors de la réinitialisation.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) return null;

    if (isExpired) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
                <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-red-50 text-red-500 shadow-sm">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Lien expiré</h2>
                        <p className="text-slate-500">
                            Vous ne pouvez plus réinitialiser votre mot de passe via ce lien.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-slate-700">
                            Redirection vers la page de connexion dans <span className="text-[#7B3FF2] text-lg font-bold mx-1">{countdown}</span> secondes...
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-3.5 px-4 rounded-xl text-[#7B3FF2] font-bold bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                        Aller au login maintenant
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
                
                {/* Icône / Logo */}
                <div className="flex justify-center mb-6">
                    <div className="bg-[#7B3FF2] p-3.5 rounded-2xl shadow-lg">
                        <Activity className="h-7 w-7 text-white" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nouveau mot de passe</h2>
                    <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                        Veuillez choisir un nouveau mot de passe sécurisé.
                    </p>
                </div>

                {globalError && (
                    <div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
                        {globalError}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            aria-invalid={errors.password ? "true" : "false"}
                            aria-describedby={errors.password ? "password-error" : undefined}
                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                                errors.password 
                                ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50' 
                                : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50'
                            }`}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <p id="password-error" className="text-red-600 text-xs mt-1 font-medium">{errors.password[0]}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le mot de passe</label>
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:border-slate-300 focus:ring-2 focus:ring-slate-200 hover:bg-slate-50"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#7B3FF2] hover:bg-[#6830d1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B3FF2] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sauvegarde en cours...
                                </span>
                            ) : (
                                'Enregistrer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}