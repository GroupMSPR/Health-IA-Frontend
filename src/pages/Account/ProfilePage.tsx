/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
    Crown,
    Flame,
    Dumbbell,
    Footprints,
    Zap,
    Clock,
    Target,
    Award,
    Lock,
    Bell,
    CalendarClock,
    CalendarCheck,
    ClipboardList,
    AlertTriangle,
    Activity,
    LogOut,
    Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';

type ProfileUser = {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    created_at?: string;
    favorite_exercise_category?: string;
    physical_activity_level?: string;
};

const activityLevelLabels: Record<string, string> = {
    sedentary: 'Sédentaire',
    moderate: 'Modéré',
    active: 'Actif',
    sedentaire: 'Sédentaire',
    modere: 'Modéré',
    actif: 'Actif',
};

function capitalize(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function formatCompact(value: number): string {
    if (value >= 1000) {
        const k = value / 1000;
        return `${k >= 100 ? Math.round(k).toString() : k.toFixed(1).replace(/\.0$/, '').replace('.', ',')} k`;
    }
    return value.toLocaleString('fr-FR');
}

function computeStreak(metrics: { date?: string }[]): number {
    const days = Array.from(
        new Set(metrics.map((m) => (m.date ?? '').slice(0, 10)).filter(Boolean))
    )
        .sort()
        .reverse();
    if (!days.length) return 0;

    const ONE_DAY = 86_400_000;
    const toLocal = (ymd: string) => {
        const [y, m, d] = ymd.split('-').map(Number);
        return new Date(y, m - 1, d).getTime();
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Math.round((today.getTime() - toLocal(days[0])) / ONE_DAY) > 1) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
        if (Math.round((toLocal(days[i - 1]) - toLocal(days[i])) / ONE_DAY) === 1) streak++;
        else break;
    }
    return streak;
}

const settingRows = [
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'reminders', label: 'Rappels hebdomadaires', icon: CalendarClock },
    { key: 'tracking', label: "Suivi d'activité", icon: Activity },
] as const;

type SettingKey = (typeof settingRows)[number]['key'];

function SettingToggle({
    checked,
    onChange,
    labelId,
}: {
    checked: boolean;
    onChange: () => void;
    labelId: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={labelId}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 ${
                checked ? 'bg-[#7B3FF2]' : 'bg-slate-300'
            }`}
        >
            <span
                aria-hidden="true"
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const profileUser = user as ProfileUser | null;

    const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
        notifications: true,
        reminders: true,
        tracking: true,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [goals, setGoals] = useState<string[]>([]);
    const [constraints, setConstraints] = useState<string[]>([]);
    const [planLabel, setPlanLabel] = useState<string | null>(null);
    const [metricStats, setMetricStats] = useState({
        bilans: 0,
        streak: 0,
        calories: 0,
        activeHours: 0,
        maxSteps: 0,
    });

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const [userRes, metricsRes, countRes] = await Promise.all([
                    axios.post('/api/users/search', {
                        search: {
                            filters: [{ field: 'id', operator: '=', value: user.id }],
                            includes: [
                                { relation: 'goals' },
                                { relation: 'constraints' },
                                { relation: 'subscriptions' },
                            ],
                        },
                    }),
                    axios.post('/api/health-metrics/search', {
                        search: {
                            filters: [{ field: 'user_id', operator: '=', value: user.id }],
                            sorts: [{ field: 'date', direction: 'desc' }],
                            limit: 50,
                        },
                    }),
                    axios.get('/api/health-metrics/count'),
                ]);

                if (cancelled) return;

                const profile = userRes.data?.data?.[0] ?? userRes.data?.[0] ?? null;
                const metrics: any[] = metricsRes.data?.data ?? metricsRes.data ?? [];
                const bilansTotal =
                    typeof countRes.data === 'number' ? countRes.data : metrics.length;

                setGoals((profile?.goals ?? []).map((g: any) => g.goal).filter(Boolean));
                setConstraints((profile?.constraints ?? []).map((c: any) => c.name).filter(Boolean));

                const subscriptions: any[] = profile?.subscriptions ?? [];
                if (subscriptions.length) {
                    const premium = subscriptions.find((s) =>
                        /premium/i.test(s.subscription_type ?? '')
                    );
                    setPlanLabel(
                        premium
                            ? 'Membre Premium'
                            : capitalize(subscriptions[0].subscription_type ?? '')
                    );
                } else {
                    setPlanLabel(null);
                }

                const calories = metrics.reduce((sum, m) => sum + (Number(m.calories_burned) || 0), 0);
                const activeMinutes = metrics.reduce((sum, m) => sum + (Number(m.active_minute) || 0), 0);
                const maxSteps = metrics.reduce((max, m) => Math.max(max, Number(m.steps_count) || 0), 0);

                setMetricStats({
                    bilans: bilansTotal,
                    streak: computeStreak(metrics),
                    calories: Math.round(calories),
                    activeHours: Math.round(activeMinutes / 60),
                    maxSteps,
                });
            } catch (error) {
                console.error('Erreur lors du chargement du profil :', error);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchProfile();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const fullName =
        (user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '') || 'Utilisateur';
    const initials =
        (user
            ? `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`.toUpperCase()
            : '') || 'U';

    const memberSince = profileUser?.created_at
        ? capitalize(
              new Date(profileUser.created_at).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
              })
          )
        : null;

    const profileTags: { label: string; icon: LucideIcon; className: string }[] = [];
    if (profileUser?.favorite_exercise_category) {
        profileTags.push({
            label: capitalize(profileUser.favorite_exercise_category),
            icon: Dumbbell,
            className: 'bg-blue-50 text-blue-700',
        });
    }
    if (profileUser?.physical_activity_level) {
        const key = profileUser.physical_activity_level.toLowerCase();
        profileTags.push({
            label: activityLevelLabels[key] ?? capitalize(profileUser.physical_activity_level),
            icon: Activity,
            className: 'bg-orange-50 text-orange-700',
        });
    }

    const statCards = [
        { label: 'Bilans', value: metricStats.bilans.toLocaleString('fr-FR'), icon: ClipboardList, className: 'bg-blue-50 text-blue-600' },
        { label: 'Série', value: `${metricStats.streak}`, icon: Flame, className: 'bg-orange-50 text-orange-600' },
        { label: 'Calories', value: formatCompact(metricStats.calories), icon: Zap, className: 'bg-purple-50 text-[#7B3FF2]' },
        { label: 'Actif', value: `${metricStats.activeHours}h`, icon: Clock, className: 'bg-emerald-50 text-emerald-600' },
    ];

    const achievements = [
        { name: 'Premier bilan', icon: ClipboardList, unlocked: metricStats.bilans >= 1, className: 'bg-blue-100 text-blue-600' },
        { name: 'En feu', icon: Flame, unlocked: metricStats.streak >= 3, className: 'bg-orange-100 text-orange-600' },
        { name: '10 000 pas', icon: Footprints, unlocked: metricStats.maxSteps >= 10000, className: 'bg-emerald-100 text-emerald-600' },
        { name: 'Assidu', icon: CalendarCheck, unlocked: metricStats.bilans >= 30, className: 'bg-purple-100 text-[#7B3FF2]' },
        { name: 'Brûleur', icon: Zap, unlocked: metricStats.calories >= 5000, className: 'bg-amber-100 text-amber-600' },
        { name: 'Objectifs fixés', icon: Target, unlocked: goals.length >= 1, className: 'bg-pink-100 text-pink-600' },
    ];
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    const cardClassName = 'bg-white border border-slate-100 shadow-sm rounded-3xl';

    if (user && isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 mb-12 animate-pulse">
                <div className="h-9 w-48 rounded bg-slate-200" />
                <div className="h-32 rounded-3xl bg-slate-200" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-28 rounded-3xl bg-slate-200" />
                    ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="h-52 rounded-3xl bg-slate-200" />
                    <div className="h-52 rounded-3xl bg-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            <header>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Mon profil
                </h1>
                <p className="mt-2 text-slate-600 font-medium">
                    Suivez votre progression, vos objectifs et vos préférences.
                </p>
            </header>

            {/* IDENTITÉ */}
            <section aria-labelledby="identity-heading" className={`${cardClassName} p-6 sm:p-8`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                    <div
                        aria-hidden="true"
                        className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-md"
                    >
                        {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2
                            id="identity-heading"
                            className="text-2xl font-extrabold text-slate-900 tracking-tight"
                        >
                            {fullName}
                        </h2>
                        <p className="mt-0.5 text-slate-500 font-medium truncate">{user?.email}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                            {planLabel && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7B3FF2] text-white text-xs font-bold">
                                    <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                                    {planLabel}
                                </span>
                            )}
                            {memberSince && (
                                <span className="text-sm text-slate-500 font-medium">
                                    Membre depuis {memberSince}
                                </span>
                            )}
                        </div>

                        {profileTags.length > 0 && (
                            <ul className="mt-4 hidden sm:flex flex-wrap gap-2">
                                {profileTags.map((tag) => {
                                    const Icon = tag.icon;
                                    return (
                                        <li
                                            key={tag.label}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${tag.className}`}
                                        >
                                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                            {tag.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </section>

            {/* STATISTIQUES */}
            <section aria-labelledby="stats-heading">
                <h2 id="stats-heading" className="sr-only">
                    Statistiques du profil
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className={`${cardClassName} p-4 sm:p-6 flex flex-col items-center sm:items-start text-center sm:text-left transition-shadow hover:shadow-md`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`flex items-center justify-center h-10 w-10 rounded-2xl mb-3 sm:mb-4 ${stat.className}`}
                                >
                                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                                </span>
                                <p className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                                    {stat.value}
                                </p>
                                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-600">
                                    {stat.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {/* OBJECTIFS ACTIFS */}
                <section
                    aria-labelledby="goals-heading"
                    className={`${cardClassName} p-6 sm:p-8 xl:col-start-1 xl:row-start-1`}
                >
                    <h2
                        id="goals-heading"
                        className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6"
                    >
                        <Target className="h-5 w-5 text-[#7B3FF2]" aria-hidden="true" />
                        Mes objectifs
                    </h2>

                    {goals.length === 0 && constraints.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucun objectif défini pour le moment.</p>
                    ) : (
                        <div className="space-y-6">
                            {goals.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Objectifs
                                    </h3>
                                    <ul className="flex flex-wrap gap-2">
                                        {goals.map((goal) => (
                                            <li
                                                key={goal}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-sm font-semibold text-[#7B3FF2]"
                                            >
                                                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                                                {capitalize(goal)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {constraints.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Contraintes
                                    </h3>
                                    <ul className="flex flex-wrap gap-2">
                                        {constraints.map((constraint) => (
                                            <li
                                                key={constraint}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700"
                                            >
                                                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                                                {capitalize(constraint)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* RÉCOMPENSES */}
                <section
                    aria-labelledby="achievements-heading"
                    className={`${cardClassName} p-6 sm:p-8 xl:col-start-2 xl:row-start-1`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2
                            id="achievements-heading"
                            className="flex items-center gap-2 text-lg font-bold text-slate-900"
                        >
                            <Award className="h-5 w-5 text-[#7B3FF2]" aria-hidden="true" />
                            Récompenses
                        </h2>
                        <span className="text-sm font-bold text-slate-500 tabular-nums">
                            {unlockedCount}/{achievements.length}
                        </span>
                    </div>

                    <ul className="grid grid-cols-3 gap-3">
                        {achievements.map((achievement) => {
                            const Icon = achievement.icon;
                            return (
                                <li key={achievement.name}>
                                    <div
                                        className={`relative flex flex-col items-center text-center gap-2 p-3 sm:p-4 rounded-2xl border ${
                                            achievement.unlocked
                                                ? 'bg-blue-50/60 border-blue-100'
                                                : 'bg-white border-slate-100'
                                        }`}
                                    >
                                        {!achievement.unlocked && (
                                            <Lock
                                                className="absolute top-2 right-2 h-3.5 w-3.5 text-slate-400"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span
                                            aria-hidden="true"
                                            className={`flex items-center justify-center h-11 w-11 rounded-xl ${
                                                achievement.unlocked
                                                    ? achievement.className
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" strokeWidth={2.2} />
                                        </span>
                                        <span
                                            className={`text-xs font-bold ${
                                                achievement.unlocked ? 'text-slate-800' : 'text-slate-500'
                                            }`}
                                        >
                                            {achievement.name}
                                        </span>
                                        <span className="sr-only">
                                            {achievement.unlocked ? 'Débloqué' : 'Verrouillé'}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                {/* PARAMÈTRES */}
                <section
                    aria-labelledby="settings-heading"
                    className={`${cardClassName} p-6 sm:p-8 xl:col-start-1 xl:row-start-2`}
                >
                    <h2
                        id="settings-heading"
                        className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6"
                    >
                        <Settings className="h-5 w-5 text-[#7B3FF2]" aria-hidden="true" />
                        Paramètres
                    </h2>

                    <ul className="space-y-4">
                        {settingRows.map((row) => {
                            const Icon = row.icon;
                            const labelId = `setting-${row.key}`;
                            return (
                                <li key={row.key} className="flex items-center justify-between gap-4">
                                    <span className="flex items-center gap-3 min-w-0">
                                        <span
                                            aria-hidden="true"
                                            className="flex items-center justify-center h-9 w-9 shrink-0 rounded-xl bg-slate-100 text-slate-600"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span
                                            id={labelId}
                                            className="text-sm font-semibold text-slate-700 truncate"
                                        >
                                            {row.label}
                                        </span>
                                    </span>
                                    <SettingToggle
                                        checked={settings[row.key]}
                                        onChange={() =>
                                            setSettings((prev) => ({
                                                ...prev,
                                                [row.key]: !prev[row.key],
                                            }))
                                        }
                                        labelId={labelId}
                                    />
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={logout}
                            className="inline-flex items-center gap-3 text-sm font-bold text-red-600 hover:text-red-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                            <span
                                aria-hidden="true"
                                className="flex items-center justify-center h-9 w-9 rounded-xl bg-red-50 text-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                            </span>
                            Se déconnecter
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}