import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../lib/axios';
import { isAxiosError } from 'axios';
import { Activity } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setStatusMessage('');

        try {
            await axios.get('/sanctum/csrf-cookie');
            
            const response = await axios.post('/api/forgot-password', { email });
            
            setStatusMessage(response.data.message);
            setEmail('');
            
        } catch (err) {
            if (isAxiosError(err) && err.response?.status === 422) {
                setError(err.response.data.errors.email[0]);
            } else if (isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Une erreur est survenue. Veuillez réessayer plus tard.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
                
                <div className="flex justify-center mb-6">
                    <div className="bg-[#7B3FF2] p-3.5 rounded-2xl shadow-lg">
                        <Activity className="h-7 w-7 text-white" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mot de passe oublié ?</h2>
                    <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {statusMessage && (
                    <div role="status" aria-live="polite" className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm font-medium">
                        {statusMessage}
                    </div>
                )}

                {error && (
                    <div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={error ? "email-error" : undefined}
                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                                error 
                                ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50' 
                                : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 bg-slate-50/50 hover:bg-slate-50'
                            }`}
                            placeholder="alex@example.com"
                        />
                        {error && (
                            <p id="email-error" className="mt-2 text-sm text-red-600 font-medium">
                                {error}
                            </p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || statusMessage !== ''}
                            aria-busy={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#7B3FF2] hover:bg-[#6830d1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B3FF2] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Envoi en cours...
                                </span>
                            ) : (
                                'Envoyer le lien'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-[#7B3FF2] transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </main>
    );
}