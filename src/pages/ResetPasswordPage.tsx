import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../lib/axios';
import { isAxiosError } from 'axios';

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-slate-100 text-center space-y-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                            Redirection vers la page de connexion dans <span className="text-blue-600 text-lg font-bold mx-1">{countdown}</span> secondes...
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-3 px-4 rounded-xl text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                        Aller au login maintenant
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">Nouveau mot de passe</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Veuillez choisir un nouveau mot de passe sécurisé.
                    </p>
                </div>

                {globalError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                        {globalError}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg p-2.5 cursor-not-allowed outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nouveau mot de passe</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            onChange={handleChange}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmer le mot de passe</label>
                        <input
                            name="password_confirmation"
                            type="password"
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Sauvegarde en cours...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}