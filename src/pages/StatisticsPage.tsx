import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Flame, 
    TrendingUp, 
    Footprints, 
    Scale,
    HeartPulse,
    CalendarDays
} from 'lucide-react';
import axios from '../lib/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Enregistrement des éléments Chart.js nécessaires
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    Title, 
    Tooltip, 
    Legend, 
    Filler
);

interface HealthMetric {
    date: string;
    weight: number | null;
    steps_count: number | null;
    calories_burned: number | null;
    resting_bpm: number | null;
    avg_bpm: number | null;
}

export default function StatisticsPage() {
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    
    // Données pour les graphiques
    const [chartData, setChartData] = useState({
        labels: [] as string[],
        weights: [] as (number | null)[],
        steps: [] as number[],
        calories: [] as number[],
        restingBpm: [] as (number | null)[],
        avgBpm: [] as (number | null)[]
    });

    // Statistiques rapides sur 30 jours
    const [summary, setSummary] = useState({
        avgSteps: 0,
        totalCalories: 0,
        weightDiff: 0,
    });

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            setIsLoading(true);
            try {
                // 1. Calcul de la date d'il y a 30 jours
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // 30 jours (aujourd'hui inclus)
                const pastDateString = thirtyDaysAgo.toISOString().split('T')[0];

                // 2. Récupération des données
                const response = await axios.post('/api/health-metrics/search', {
                    search: {
                        filters: [
                            { field: 'user_id', operator: '=', value: user.id },
                            { field: 'date', operator: '>=', value: pastDateString }
                        ],
                        limit: 100 // S'assurer de tout récupérer
                    }
                });

                const data: HealthMetric[] = response.data?.data || response.data || [];

                // 3. Préparation d'un tableau chronologique des 30 derniers jours
                const last30Days = [...Array(30)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (29 - i));
                    return d.toISOString().split('T')[0];
                });

                // Noms des jours/mois pour l'axe X (ex: "15 Juin")
                const labels = last30Days.map(dateStr => {
                    const d = new Date(dateStr);
                    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                });

                // 4. Mapping des données sur les 30 jours (rempli avec null ou 0 si pas de bilan ce jour-là)
                const weights = last30Days.map(date => Number(data.find(x => x.date.startsWith(date))?.weight) || null);
                const steps = last30Days.map(date => Number(data.find(x => x.date.startsWith(date))?.steps_count) || 0);
                const calories = last30Days.map(date => Number(data.find(x => x.date.startsWith(date))?.calories_burned) || 0);
                const restingBpm = last30Days.map(date => Number(data.find(x => x.date.startsWith(date))?.resting_bpm) || null);
                const avgBpm = last30Days.map(date => Number(data.find(x => x.date.startsWith(date))?.avg_bpm) || null);

                setChartData({ labels, weights, steps, calories, restingBpm, avgBpm });

                // 5. Calcul du résumé
                const totalSteps = steps.reduce((a, b) => a + b, 0);
                const daysWithSteps = steps.filter(s => s > 0).length || 1; // Éviter division par 0
                
                // Différence de poids entre le premier poids enregistré des 30 jours et le dernier
                const validWeights = weights.filter(w => w !== null) as number[];
                const weightDiff = validWeights.length >= 2 
                    ? validWeights[validWeights.length - 1] - validWeights[0] 
                    : 0;

                setSummary({
                    avgSteps: Math.round(totalSteps / daysWithSteps),
                    totalCalories: calories.reduce((a, b) => a + b, 0),
                    weightDiff: Number(weightDiff.toFixed(1))
                });

            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    // ==========================================
    // CONFIGURATION DES GRAPHIQUES (CHART.JS)
    // ==========================================

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } } }
        },
        interaction: { mode: 'index' as const, intersect: false },
    };

    // 1. Graphique: Poids (Ligne)
    const weightChart = {
        labels: chartData.labels,
        datasets: [{
            label: 'Poids (kg)',
            data: chartData.weights,
            borderColor: '#10b981', // Emerald
            backgroundColor: '#10b981',
            borderWidth: 3,
            tension: 0.3,
            spanGaps: true, // Relie les points s'il manque des jours
            pointRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderWidth: 2,
        }]
    };

    // 2. Graphique: Pas (Barres)
    const stepsChart = {
        labels: chartData.labels,
        datasets: [{
            label: 'Nombre de pas',
            data: chartData.steps,
            backgroundColor: '#3b82f6', // Blue
            borderRadius: 4,
            borderSkipped: false,
        }]
    };

    // 3. Graphique: Calories (Zone)
    const caloriesChart = {
        labels: chartData.labels,
        datasets: [{
            label: 'Calories brûlées',
            data: chartData.calories,
            borderColor: '#f97316', // Orange
            backgroundColor: 'rgba(249, 115, 22, 0.15)', // Orange transparent
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
        }]
    };

    // 4. Graphique: Rythme Cardiaque (Multi-Lignes)
    const bpmChart = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'BPM Moyen',
                data: chartData.avgBpm,
                borderColor: '#f43f5e', // Rose
                borderWidth: 2,
                tension: 0.4,
                spanGaps: true,
                pointRadius: 0,
            },
            {
                label: 'BPM Repos',
                data: chartData.restingBpm,
                borderColor: '#94a3b8', // Slate
                borderDash: [5, 5], // Ligne pointillée
                borderWidth: 2,
                tension: 0.4,
                spanGaps: true,
                pointRadius: 0,
            }
        ]
    };

    if (isLoading) {
        return (
            <main className="max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-10 bg-slate-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-200 rounded-3xl"></div>
                    <div className="h-80 bg-slate-200 rounded-3xl"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-50 text-[#7B3FF2] rounded-lg">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Statistiques
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> Analyse de vos 30 derniers jours
                    </p>
                </div>

                <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="pr-4 border-r border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pas / jour</p>
                        <p className="text-xl font-extrabold text-blue-600">{summary.avgSteps.toLocaleString('fr-FR')}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Évolution Poids</p>
                        <p className={`text-xl font-extrabold ${summary.weightDiff <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {summary.weightDiff > 0 ? '+' : ''}{summary.weightDiff} kg
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                
                {/* 1. Évolution du Poids */}
                <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Scale className="h-5 w-5 text-emerald-500" />
                            Évolution du Poids
                        </h2>
                    </div>
                    <div className="relative h-64 w-full flex-1">
                        <Line data={weightChart} options={commonOptions} />
                    </div>
                </section>

                {/* 2. Activité des Pas */}
                <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Footprints className="h-5 w-5 text-blue-500" />
                            Activité (Pas)
                        </h2>
                    </div>
                    <div className="relative h-64 w-full flex-1">
                        <Bar data={stepsChart} options={commonOptions} />
                    </div>
                </section>

                {/* 3. Calories brûlées */}
                <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Dépense Énergétique
                        </h2>
                        <p className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                            {summary.totalCalories.toLocaleString('fr-FR')} kcal au total
                        </p>
                    </div>
                    <div className="relative h-64 w-full flex-1">
                        <Line data={caloriesChart} options={commonOptions} />
                    </div>
                </section>

                {/* 4. Rythme Cardiaque */}
                <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <HeartPulse className="h-5 w-5 text-rose-500" />
                            Rythme Cardiaque
                        </h2>
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="flex items-center gap-1 text-slate-600">
                                <span className="w-3 h-0.5 bg-rose-500"></span> Moyen
                            </span>
                            <span className="flex items-center gap-1 text-slate-600">
                                <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed"></span> Repos
                            </span>
                        </div>
                    </div>
                    <div className="relative h-64 w-full flex-1">
                        <Line data={bpmChart} options={commonOptions} />
                    </div>
                </section>

            </div>
        </main>
    );
}