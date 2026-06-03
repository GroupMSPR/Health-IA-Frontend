import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import { isAxiosError } from 'axios';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">Mot de passe oublié ?</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {statusMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
                        {statusMessage}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                            placeholder="john.doe@example.com"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || statusMessage !== ''}
                            className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}