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

    const [formData, setFormData] = useState({
        email: emailFromUrl || '',
        password: '',
        password_confirmation: '',
    });

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
            if (isAxiosError(err) && err.response?.status === 422) {
                setErrors(err.response.data.errors);
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
                            className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg p-2.5 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nouveau mot de passe</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                            onChange={handleChange}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmer le mot de passe</label>
                        <input
                            name="password_confirmation"
                            type="password"
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}