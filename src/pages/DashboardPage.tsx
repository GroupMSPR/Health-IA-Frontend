import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Ajout de Footprints et Scale pour les nouvelles icônes dynamiques
import { Activity, Flame, Dumbbell, TrendingUp, Clock, Zap, Camera, Apple, ChevronRight, Sparkles, ArrowRight, Footprints, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface HealthMetric {
    id: string;
    date: string;
    weight: number | null;
    steps_count: number | null;
    sleep_time: string | null;
    calories_burned: number | null;
    active_minute: number | null;
}

export default function DashboardPage() {
    const { user } = useAuth();

    // --- ÉTATS DYNAMIQUES ---
    const [hasTodayMetric, setHasTodayMetric] = useState(true);
    const [weeklyData, setWeeklyData] = useState({
        totalMinutes: 0,
        totalCalories: 0,
        totalSteps: 0,
        latestWeight: null as number | null,
        minChange: { text: '--', type: 'neutral' },
        calChange: { text: '--', type: 'neutral' },
        stepChange: { text: '--', type: 'neutral' },
        weightChange: { text: '--', type: 'neutral' },
        chartLabels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        chartCalories: [0, 0, 0, 0, 0, 0, 0],
        chartSteps: [0, 0, 0, 0, 0, 0, 0]
    });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // 1. Calcul de la fenêtre des 7 derniers jours
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const pastDateString = sevenDaysAgo.toISOString().split('T')[0];

                // 2. Requête API
                const response = await axios.post('/api/health-metrics/search', {
                    search: {
                        filters: [
                            { field: 'user_id', operator: '=', value: user.id },
                            { field: 'date', operator: '>=', value: pastDateString }
                        ],
                        sorts: [
                            { field: 'date', direction: 'desc' }
                        ]
                    }
                });

                const data: HealthMetric[] = response.data?.data || response.data || [];

                // 3. Vérifier si on a un bilan pour aujourd'hui (pour la Card Prompt)
                const todayString = new Date().toISOString().split('T')[0];
                const todayMetricExists = data.some(m => m.date.startsWith(todayString));
                setHasTodayMetric(todayMetricExists);

                // 4. Préparer les tableaux pour les 7 derniers jours (du plus ancien au plus récent)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().split('T')[0];
                });
                
                // Noms des jours pour le graphique
                const dayNames = last7Days.map(dateStr => new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short' }));

                // Remplissage des données jour par jour
                const calData = last7Days.map(date => {
                    const m = data.find(x => x.date.startsWith(date));
                    return m?.calories_burned ? Number(m.calories_burned) : 0;
                });
                const stpData = last7Days.map(date => {
                    const m = data.find(x => x.date.startsWith(date));
                    return m?.steps_count ? Number(m.steps_count) : 0;
                });
                const minData = last7Days.map(date => {
                    const m = data.find(x => x.date.startsWith(date));
                    return m?.active_minute ? Number(m.active_minute) : 0;
                });

                // 5. Calcul des totaux
                const totalCal = calData.reduce((a, b) => a + b, 0);
                const totalMin = minData.reduce((a, b) => a + b, 0);
                const totalStp = stpData.reduce((a, b) => a + b, 0);
                
                const latestWeight = data.find(m => m.weight !== null)?.weight || user.weight || null;
                const previousWeight = data.filter(m => m.weight !== null).length > 1 
                    ? data.filter(m => m.weight !== null)[1].weight 
                    : null;

                // 6. Calcul des tendances (Aujourd'hui vs Hier)
                const getChange = (today: number, yesterday: number) => {
                    if (!yesterday && !today) return { text: '--', type: 'neutral' };
                    if (!yesterday) return { text: '+100%', type: 'positive' };
                    const diff = Math.round(((today - yesterday) / yesterday) * 100);
                    return {
                        text: diff > 0 ? `+${diff}%` : `${diff}%`,
                        type: diff > 0 ? 'positive' : (diff < 0 ? 'negative' : 'neutral')
                    };
                };

                let weightChange = { text: '--', type: 'neutral' };
                if (latestWeight && previousWeight && latestWeight !== previousWeight) {
                    const diff = (latestWeight - previousWeight).toFixed(1);
                    // Pour le poids, une baisse est "positive" en général dans une app fitness
                    weightChange = {
                        text: Number(diff) > 0 ? `+${diff}kg` : `${diff}kg`,
                        type: Number(diff) > 0 ? 'negative' : 'positive' 
                    };
                }

                // 7. Mise à jour de l'état global
                setWeeklyData({
                    totalMinutes: totalMin,
                    totalCalories: totalCal,
                    totalSteps: totalStp,
                    latestWeight: latestWeight,
                    minChange: getChange(minData[6], minData[5]),
                    calChange: getChange(calData[6], calData[5]),
                    stepChange: getChange(stpData[6], stpData[5]),
                    weightChange: weightChange,
                    chartLabels: dayNames,
                    chartCalories: calData,
                    chartSteps: stpData
                });

            } catch (error) {
                console.error("Erreur récupération données dashboard:", error);
                setHasTodayMetric(true); // Fallback silencieux
            }
        };

        fetchData();
    }, [user]);

    // --- CONSTRUCTION DES STATS DYNAMIQUES ---
    const stats = [
        { id: 1, name: 'Minutes actives (7j)', value: weeklyData.totalMinutes.toString(), change: weeklyData.minChange.text, changeType: weeklyData.minChange.type, icon: Activity, color: 'text-blue-700', bgColor: 'bg-blue-50' },
        { id: 2, name: 'Calories brûlées (7j)', value: weeklyData.totalCalories.toLocaleString('fr-FR'), change: weeklyData.calChange.text, changeType: weeklyData.calChange.type, icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 3, name: 'Pas cumulés (7j)', value: weeklyData.totalSteps.toLocaleString('fr-FR'), change: weeklyData.stepChange.text, changeType: weeklyData.stepChange.type, icon: Footprints, color: 'text-purple-700', bgColor: 'bg-purple-50' },
        { id: 4, name: 'Poids actuel', value: weeklyData.latestWeight ? `${weeklyData.latestWeight}` : '--', change: weeklyData.weightChange.text, changeType: weeklyData.weightChange.type, icon: Scale, color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    ];

    const workouts = [
        { id: 1, title: 'Cardio HIIT Extrême', duration: '30 min', intensity: 'Élevée', image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=600&h=400' },
        { id: 2, title: 'Renforcement Musculaire', duration: '45 min', intensity: 'Moyenne', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600&h=400' },
        { id: 3, title: 'Endurance Rameur', duration: '25 min', intensity: 'Moyenne', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600&h=400' },
    ];

    // --- GRAPH DYNAMIQUE ---
    const chartData = {
        labels: weeklyData.chartLabels, // Jours dynamiques
        datasets: [
            {
                label: 'Calories',
                data: weeklyData.chartCalories, // Données réelles
                borderColor: '#7B3FF2',
                backgroundColor: 'rgba(123, 63, 242, 0.05)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#7B3FF2',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Pas',
                data: weeklyData.chartSteps, // Données réelles
                borderColor: '#3b82f6',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 0,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { 
                display: true, 
                border: { display: false },
                grid: { color: '#f1f5f9' },
                ticks: { color: '#64748b', font: { size: 11 } }
            },
            x: { 
                border: { display: false },
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11 } }
            }
        },
        interaction: { mode: 'index' as const, intersect: false },
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            
            <header>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
                    Bonjour, {user?.first_name || 'Alex'} !
                </h1>
                <p className="mt-2 text-slate-600 font-medium">
                    Voici ton résumé fitness du jour.
                </p>
            </header>

            {/* --- LA CARD PROMPT : Apparaît si aucun bilan trouvé pour la date du jour --- */}
            {!hasTodayMetric && (
                <section className="bg-gradient-to-br from-[#7B3FF2] to-[#5a24c5] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#7B3FF2]/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transform transition-all hover:scale-[1.01]">
                    <div className="absolute -right-6 -top-10 opacity-10 pointer-events-none">
                        <Activity className="h-64 w-64" />
                    </div>
                    
                    <div className="relative z-10 flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                            Action Quotidienne
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold mb-2 leading-tight">
                            Comment te sens-tu aujourd'hui ?
                        </h2>
                        <p className="text-purple-100 font-medium text-sm sm:text-base max-w-xl mx-auto md:mx-0">
                            Prends 1 minute pour enregistrer tes données (sommeil, poids, pas). Ces informations sont cruciales pour permettre à l'IA d'adapter ton programme.
                        </p>
                    </div>

                    <Link 
                        to="/health-metric/create" 
                        className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#7B3FF2] rounded-xl font-extrabold transition-all hover:bg-slate-50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7B3FF2] w-full md:w-auto hover:scale-[1.01]"
                    >
                        <span>Créer mon bilan du jour</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            )}

            <section aria-labelledby="stats-heading">
                <h2 id="stats-heading" className="sr-only">Tes statistiques de la journée</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat) => (
                        <div key={stat.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                                </div>
                                {/* Changement dynamique de la couleur de la progression */}
                                <span className={`text-sm font-bold ${
                                    stat.changeType === 'positive' ? 'text-emerald-600' : 
                                    stat.changeType === 'negative' ? 'text-red-500' : 
                                    'text-slate-400'
                                }`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-600 mb-1">{stat.name}</h3>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section aria-labelledby="workout-heading">
                <div className="flex items-center justify-between mb-4">
                    <h2 id="workout-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-blue-600" aria-hidden="true" />
                        Ton programme du jour
                    </h2>
                    <Link to="/exercises-recommendations" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                        Voir tout <ChevronRight className="h-4 w-4 ml-0.5" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-4 sm:gap-6 pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar">
                    {workouts.map((workout) => (
                        <article 
                            key={workout.id} 
                            className="relative flex-none w-[85vw] sm:w-[320px] lg:w-auto h-48 sm:h-56 rounded-3xl overflow-hidden group snap-center cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-slate-900"
                        >
                            <img src={workout.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" aria-hidden="true" />
                            
                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                                <h3 className="text-lg sm:text-xl font-bold mb-3 tracking-tight">{workout.title}</h3>
                                <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {workout.duration}</span>
                                    <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> {workout.intensity}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                
                {/* --- GRAPH CHART.JS DYNAMIQUE --- */}
                <section className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col" aria-labelledby="chart-heading">
                    <div className="flex items-center justify-between mb-8">
                        <h2 id="chart-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            Évolution de la semaine
                        </h2>
                        <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="flex items-center gap-1.5 text-slate-700">
                                <span className="h-3 w-3 rounded-full bg-[#7B3FF2]" aria-hidden="true"></span> Calories
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-700">
                                <span className="h-3 w-3 rounded-full bg-blue-500" aria-hidden="true"></span> Pas
                            </span>
                        </div>
                    </div>

                    <div className="relative h-64 w-full flex-1">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* --- ACTIONS RAPIDES --- */}
                <section className="space-y-4 sm:space-y-6 flex flex-col justify-between" aria-labelledby="actions-heading">
                    <h2 id="actions-heading" className="sr-only">Actions rapides</h2>

                    <Link to="/exercises" className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                        <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                            <Dumbbell className="h-7 w-7" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">Bibliothèque d'exercices</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-medium">Gérer le catalogue</p>
                        </div>
                    </Link>

                    <Link to="/foods" className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                            <Apple className="h-7 w-7" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">Bibliothèque d'aliments</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-medium">Gérer les macros</p>
                        </div>
                    </Link>

                    <Link to="/food-scan" className="flex-1 bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all group relative overflow-hidden flex items-center gap-4">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white group-hover:scale-110 transition-transform relative z-10">
                            <Camera className="h-7 w-7" strokeWidth={2} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg text-white">Scanner un repas</h3>
                            <p className="text-sm text-blue-100 mt-0.5 font-medium">Analyse par IA</p>
                        </div>
                    </Link>
                </section>
            </div>
        </div>
    );
}