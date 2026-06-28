/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId, useState, useEffect } from 'react';
import {
    User,
    Bell,
    Palette,
    Dumbbell,
    Apple,
    Shield,
    Link2,
    Database,
    HelpCircle,
    ChevronRight,
    ChevronDown,
    Camera,
    Mail,
    Lock,
    Smartphone,
    Star,
    Gift,
    LogOut,
    Activity,
    Target,
    MessageCircle,
    Sun,
    Moon,
    Monitor,
    Globe,
    Scale,
    Ruler,
    Check,
    CalendarDays,
    HeartPulse,
    AlertTriangle,
    Droplet,
    FileText,
    Download,
    Footprints,
    Watch,
    Trash2,
    Cloud,
    Headphones,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';

function capitalize(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

type Option = { value: string; label: string };

type SectionDef = {
    id: string;
    label: string;
    icon: LucideIcon;
    iconClassName: string;
    title: string;
    subtitle: string;
};

const SECTIONS: SectionDef[] = [
    { id: 'account', label: 'Compte', icon: User, iconClassName: 'text-blue-600', title: 'Compte', subtitle: 'Gérez les préférences de votre compte' },
    { id: 'notifications', label: 'Notifications', icon: Bell, iconClassName: 'text-purple-600', title: 'Notifications', subtitle: 'Gérez vos préférences de notifications' },
    { id: 'appearance', label: 'Apparence', icon: Palette, iconClassName: 'text-pink-600', title: 'Apparence', subtitle: "Gérez vos préférences d'apparence" },
    { id: 'fitness', label: 'Entraînement', icon: Dumbbell, iconClassName: 'text-orange-600', title: 'Entraînement', subtitle: "Gérez vos préférences d'entraînement" },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, iconClassName: 'text-emerald-600', title: 'Nutrition', subtitle: 'Gérez vos préférences nutritionnelles' },
    { id: 'privacy', label: 'Confidentialité', icon: Shield, iconClassName: 'text-teal-600', title: 'Confidentialité', subtitle: 'Gérez vos préférences de confidentialité' },
    { id: 'integrations', label: 'Intégrations', icon: Link2, iconClassName: 'text-indigo-600', title: 'Intégrations', subtitle: 'Gérez vos applications et services connectés' },
    { id: 'data', label: 'Données et stockage', icon: Database, iconClassName: 'text-slate-600', title: 'Données et stockage', subtitle: 'Gérez vos données et votre stockage' },
    { id: 'help', label: 'Aide et support', icon: HelpCircle, iconClassName: 'text-amber-600', title: 'Aide et support', subtitle: 'Obtenez de l’aide et des informations sur l’application' },
];

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function ToggleSwitch({ checked, onChange, labelId }: { checked: boolean; onChange: () => void; labelId: string }) {
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

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white border border-slate-100 shadow-sm rounded-2xl ${className}`}>{children}</div>;
}

function GroupLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{children}</p>
    );
}

function Rows({ children }: { children: React.ReactNode }) {
    return <div className="divide-y divide-slate-100">{children}</div>;
}

function RowIcon({ icon: Icon, className }: { icon: LucideIcon; className: string }) {
    return (
        <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${className}`}>
            <Icon className="h-4 w-4" />
        </span>
    );
}

function LinkRow({
    icon,
    iconClassName,
    label,
    sublabel,
    danger = false,
    onClick,
}: {
    icon: LucideIcon;
    iconClassName: string;
    label: string;
    sublabel?: string;
    danger?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7B3FF2]"
        >
            <RowIcon icon={icon} className={iconClassName} />
            <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${danger ? 'text-red-600' : 'text-slate-800'}`}>{label}</span>
                {sublabel && <span className="mt-0.5 block truncate text-xs text-slate-500">{sublabel}</span>}
            </span>
            <ChevronRight
                className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
            />
        </button>
    );
}

function ToggleRow({
    icon,
    iconClassName,
    label,
    sublabel,
    checked,
    onChange,
}: {
    icon: LucideIcon;
    iconClassName: string;
    label: string;
    sublabel?: string;
    checked: boolean;
    onChange: () => void;
}) {
    const labelId = useId();
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <RowIcon icon={icon} className={iconClassName} />
            <span className="min-w-0 flex-1">
                <span id={labelId} className="block text-sm font-semibold text-slate-800">
                    {label}
                </span>
                {sublabel && <span className="mt-0.5 block text-xs text-slate-500">{sublabel}</span>}
            </span>
            <ToggleSwitch checked={checked} onChange={onChange} labelId={labelId} />
        </div>
    );
}

function SelectRow({
    icon,
    iconClassName,
    label,
    value,
    onChange,
    options,
}: {
    icon: LucideIcon;
    iconClassName: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
}) {
    const id = useId();
    return (
        <div className="flex items-center gap-3 px-5 py-3.5">
            <RowIcon icon={icon} className={iconClassName} />
            <label htmlFor={id} className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
                {label}
            </label>
            <div className="relative shrink-0">
                <select
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2]"
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function AccountSection({
    user,
    logout,
    planBadge,
    subscriptionSublabel,
}: {
    user: { first_name?: string; last_name?: string; email?: string } | null;
    logout: () => Promise<void>;
    planBadge: string | null;
    subscriptionSublabel: string;
}) {
    const initials =
        (user ? `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`.toUpperCase() : '') || 'U';
    const fullName = (user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '') || 'Utilisateur';

    return (
        <div className="space-y-4">
            <Card className="p-5">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div
                            aria-hidden="true"
                            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-lg font-extrabold text-white shadow-sm"
                        >
                            {initials}
                        </div>
                        <button
                            type="button"
                            aria-label="Changer la photo de profil"
                            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#7B3FF2] text-white ring-2 ring-white transition-colors hover:bg-[#6830d1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2"
                        >
                            <Camera className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{fullName}</p>
                        <p className="truncate text-sm text-slate-500">{user?.email}</p>
                        {planBadge && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-[#7B3FF2] px-2.5 py-0.5 text-xs font-bold text-white">
                                {planBadge}
                            </span>
                        )}
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <Rows>
                    <LinkRow icon={User} iconClassName="bg-blue-50 text-blue-600" label="Modifier le profil" sublabel="Nom, bio, photo" />
                    <LinkRow icon={Mail} iconClassName="bg-blue-50 text-blue-600" label="Adresse e-mail" sublabel={user?.email ?? '—'} />
                    <LinkRow icon={Lock} iconClassName="bg-amber-50 text-amber-600" label="Modifier le mot de passe" sublabel="Modifié il y a 3 mois" />
                    <LinkRow icon={Smartphone} iconClassName="bg-emerald-50 text-emerald-600" label="Authentification à deux facteurs" sublabel="Non activée" />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <Rows>
                    <LinkRow icon={Star} iconClassName="bg-amber-50 text-amber-600" label="Abonnement" sublabel={subscriptionSublabel} />
                    <LinkRow icon={Gift} iconClassName="bg-purple-50 text-[#7B3FF2]" label="Programme de parrainage" sublabel="Invitez des amis, gagnez des mois gratuits" />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <LinkRow icon={LogOut} iconClassName="bg-red-50 text-red-600" label="Se déconnecter" danger onClick={logout} />
            </Card>
        </div>
    );
}

function NotificationsSection() {
    const [push, setPush] = useState({ workout: true, meal: true, goals: true, ai: false });
    const [email, setEmail] = useState({ summary: true, tips: false });

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <GroupLabel>Notifications push</GroupLabel>
                <Rows>
                    <ToggleRow icon={Activity} iconClassName="bg-blue-50 text-blue-600" label="Rappels d’entraînement" sublabel="Tous les jours à 7h00" checked={push.workout} onChange={() => setPush((p) => ({ ...p, workout: !p.workout }))} />
                    <ToggleRow icon={Apple} iconClassName="bg-emerald-50 text-emerald-600" label="Rappels de repas" sublabel="3 fois par jour" checked={push.meal} onChange={() => setPush((p) => ({ ...p, meal: !p.meal }))} />
                    <ToggleRow icon={Target} iconClassName="bg-purple-50 text-[#7B3FF2]" label="Jalons d’objectifs" sublabel="Célébrez vos réussites" checked={push.goals} onChange={() => setPush((p) => ({ ...p, goals: !p.goals }))} />
                    <ToggleRow icon={MessageCircle} iconClassName="bg-pink-50 text-pink-600" label="Messages du coach IA" sublabel="Conseils et suivis" checked={push.ai} onChange={() => setPush((p) => ({ ...p, ai: !p.ai }))} />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <GroupLabel>E-mail</GroupLabel>
                <Rows>
                    <ToggleRow icon={Mail} iconClassName="bg-orange-50 text-orange-600" label="Résumé hebdomadaire" sublabel="Rapport de progression chaque lundi" checked={email.summary} onChange={() => setEmail((p) => ({ ...p, summary: !p.summary }))} />
                    <ToggleRow icon={Bell} iconClassName="bg-rose-50 text-rose-600" label="Conseils et articles" sublabel="Contenu fitness et nutrition" checked={email.tips} onChange={() => setEmail((p) => ({ ...p, tips: !p.tips }))} />
                </Rows>
            </Card>
        </div>
    );
}

function AppearanceSection() {
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('fr');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [distanceUnit, setDistanceUnit] = useState('km');

    const themes = [
        { value: 'light', label: 'Clair', icon: Sun },
        { value: 'dark', label: 'Sombre', icon: Moon },
        { value: 'system', label: 'Système', icon: Monitor },
    ];

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <GroupLabel>Thème</GroupLabel>
                <div className="px-5 pb-4">
                    <div role="radiogroup" aria-label="Thème de l’interface" className="grid grid-cols-3 gap-3">
                        {themes.map((opt) => {
                            const Icon = opt.icon;
                            const selected = theme === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => setTheme(opt.value)}
                                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] ${
                                        selected
                                            ? 'border-[#7B3FF2] bg-purple-50/50 text-[#7B3FF2]'
                                            : 'border-slate-100 text-slate-600 hover:border-slate-200'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                    <span className="text-sm font-semibold">{opt.label}</span>
                                    {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="border-t border-slate-100">
                    <SelectRow
                        icon={Globe}
                        iconClassName="bg-blue-50 text-blue-600"
                        label="Langue"
                        value={language}
                        onChange={setLanguage}
                        options={[
                            { value: 'fr', label: 'Français' },
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Español' },
                        ]}
                    />
                </div>
            </Card>

            <Card className="overflow-hidden">
                <GroupLabel>Unités</GroupLabel>
                <Rows>
                    <SelectRow icon={Scale} iconClassName="bg-orange-50 text-orange-600" label="Poids" value={weightUnit} onChange={setWeightUnit} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
                    <SelectRow icon={Ruler} iconClassName="bg-blue-50 text-blue-600" label="Distance" value={distanceUnit} onChange={setDistanceUnit} options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]} />
                </Rows>
            </Card>
        </div>
    );
}

function FitnessSection() {
    const [level, setLevel] = useState('intermediate');
    const [target, setTarget] = useState('4');
    const [restDay, setRestDay] = useState('sunday');

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <GroupLabel>Préférences d’entraînement</GroupLabel>
                <Rows>
                    <SelectRow
                        icon={Dumbbell}
                        iconClassName="bg-orange-50 text-orange-600"
                        label="Niveau"
                        value={level}
                        onChange={setLevel}
                        options={[
                            { value: 'beginner', label: 'Débutant' },
                            { value: 'intermediate', label: 'Intermédiaire' },
                            { value: 'advanced', label: 'Avancé' },
                        ]}
                    />
                    <SelectRow
                        icon={Target}
                        iconClassName="bg-purple-50 text-[#7B3FF2]"
                        label="Objectif de séances / semaine"
                        value={target}
                        onChange={setTarget}
                        options={['1', '2', '3', '4', '5', '6', '7'].map((n) => ({ value: n, label: n }))}
                    />
                    <SelectRow
                        icon={CalendarDays}
                        iconClassName="bg-blue-50 text-blue-600"
                        label="Jour de repos par défaut"
                        value={restDay}
                        onChange={setRestDay}
                        options={[
                            { value: 'monday', label: 'Lundi' },
                            { value: 'tuesday', label: 'Mardi' },
                            { value: 'wednesday', label: 'Mercredi' },
                            { value: 'thursday', label: 'Jeudi' },
                            { value: 'friday', label: 'Vendredi' },
                            { value: 'saturday', label: 'Samedi' },
                            { value: 'sunday', label: 'Dimanche' },
                        ]}
                    />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <GroupLabel>Données de santé</GroupLabel>
                <Rows>
                    <LinkRow icon={HeartPulse} iconClassName="bg-red-50 text-red-600" label="Zones de fréquence cardiaque" sublabel="Définir des zones personnalisées" />
                    <LinkRow icon={Activity} iconClassName="bg-blue-50 text-blue-600" label="Fréquence cardiaque max" sublabel="185 bpm (calculée automatiquement)" />
                    <LinkRow icon={Dumbbell} iconClassName="bg-orange-50 text-orange-600" label="Estimations 1RM" sublabel="Utilisées pour les recommandations de force" />
                </Rows>
            </Card>
        </div>
    );
}

function MacroInput({
    label,
    value,
    onChange,
    barClassName,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    barClassName: string;
}) {
    const id = useId();
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-center text-xs font-semibold text-slate-600">
                {label}
            </label>
            <input
                id={id}
                inputMode="numeric"
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-center text-sm font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2]"
            />
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${Math.min(Number(value) || 0, 100)}%` }} />
            </div>
        </div>
    );
}

function NutritionSection() {
    const calId = useId();
    const [calories, setCalories] = useState('2200');
    const [protein, setProtein] = useState('35');
    const [carbs, setCarbs] = useState('40');
    const [fats, setFats] = useState('25');
    const [diet, setDiet] = useState('none');

    const total = (Number(protein) || 0) + (Number(carbs) || 0) + (Number(fats) || 0);

    return (
        <div className="space-y-4">
            <Card className="space-y-5 p-5">
                <div>
                    <label htmlFor={calId} className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Objectif calorique quotidien
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                id={calId}
                                inputMode="numeric"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-14 text-lg font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2]"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">kcal</span>
                        </div>
                        <span className="whitespace-nowrap text-xs font-medium text-slate-500">Déficit : ~300 kcal</span>
                    </div>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Répartition des macros (%)</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${total === 100 ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {total === 100 && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            {total}%
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <MacroInput label="Protéines" value={protein} onChange={setProtein} barClassName="bg-blue-600" />
                        <MacroInput label="Glucides" value={carbs} onChange={setCarbs} barClassName="bg-orange-500" />
                        <MacroInput label="Lipides" value={fats} onChange={setFats} barClassName="bg-amber-400" />
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <Rows>
                    <SelectRow
                        icon={Apple}
                        iconClassName="bg-emerald-50 text-emerald-600"
                        label="Préférence alimentaire"
                        value={diet}
                        onChange={setDiet}
                        options={[
                            { value: 'none', label: 'Aucune' },
                            { value: 'vegetarian', label: 'Végétarien' },
                            { value: 'vegan', label: 'Végan' },
                            { value: 'pescatarian', label: 'Pescétarien' },
                            { value: 'keto', label: 'Kéto' },
                        ]}
                    />
                    <LinkRow icon={AlertTriangle} iconClassName="bg-orange-50 text-orange-600" label="Allergies et intolérances" sublabel="Lactose, fruits à coque, gluten..." />
                    <LinkRow icon={Droplet} iconClassName="bg-blue-50 text-blue-600" label="Objectif d’hydratation" sublabel="2,5 L / jour" />
                </Rows>
            </Card>
        </div>
    );
}

function PrivacySection() {
    const [visibility, setVisibility] = useState({ public: false, share: true });
    const [usage, setUsage] = useState({ analytics: true, ads: false });

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <GroupLabel>Visibilité du profil</GroupLabel>
                <Rows>
                    <ToggleRow icon={User} iconClassName="bg-blue-50 text-blue-600" label="Profil public" sublabel="Permettre aux autres de vous trouver" checked={visibility.public} onChange={() => setVisibility((p) => ({ ...p, public: !p.public }))} />
                    <ToggleRow icon={Activity} iconClassName="bg-purple-50 text-[#7B3FF2]" label="Partager les séances" sublabel="Visible par vos abonnés" checked={visibility.share} onChange={() => setVisibility((p) => ({ ...p, share: !p.share }))} />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <GroupLabel>Utilisation des données</GroupLabel>
                <Rows>
                    <ToggleRow icon={Database} iconClassName="bg-emerald-50 text-emerald-600" label="Statistiques d’utilisation" sublabel="Aidez à améliorer l’application" checked={usage.analytics} onChange={() => setUsage((p) => ({ ...p, analytics: !p.analytics }))} />
                    <ToggleRow icon={Target} iconClassName="bg-pink-50 text-pink-600" label="Publicités personnalisées" sublabel="Basées sur vos données d’activité" checked={usage.ads} onChange={() => setUsage((p) => ({ ...p, ads: !p.ads }))} />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <Rows>
                    <LinkRow icon={Shield} iconClassName="bg-teal-50 text-teal-600" label="Politique de confidentialité" />
                    <LinkRow icon={FileText} iconClassName="bg-slate-100 text-slate-600" label="Conditions d’utilisation" />
                    <LinkRow icon={Download} iconClassName="bg-blue-50 text-blue-600" label="Télécharger mes données" sublabel="Export RGPD" />
                </Rows>
            </Card>
        </div>
    );
}

function IntegrationsSection() {
    const [connections, setConnections] = useState({ apple: true, google: false, strava: true, fitbit: false });
    const statusLabel = (connected: boolean) => (connected ? 'Connecté' : 'Non connecté');

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <GroupLabel>Appareils et services</GroupLabel>
                <Rows>
                    <ToggleRow icon={HeartPulse} iconClassName="bg-red-50 text-red-600" label="Apple Santé" sublabel={statusLabel(connections.apple)} checked={connections.apple} onChange={() => setConnections((p) => ({ ...p, apple: !p.apple }))} />
                    <ToggleRow icon={Activity} iconClassName="bg-emerald-50 text-emerald-600" label="Google Fit" sublabel={statusLabel(connections.google)} checked={connections.google} onChange={() => setConnections((p) => ({ ...p, google: !p.google }))} />
                    <ToggleRow icon={Footprints} iconClassName="bg-orange-50 text-orange-600" label="Strava" sublabel={statusLabel(connections.strava)} checked={connections.strava} onChange={() => setConnections((p) => ({ ...p, strava: !p.strava }))} />
                    <ToggleRow icon={Watch} iconClassName="bg-blue-50 text-blue-600" label="Fitbit" sublabel={statusLabel(connections.fitbit)} checked={connections.fitbit} onChange={() => setConnections((p) => ({ ...p, fitbit: !p.fitbit }))} />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <Rows>
                    <LinkRow icon={Link2} iconClassName="bg-indigo-50 text-indigo-600" label="Accès API" sublabel="Jetons et webhooks pour les développeurs" />
                </Rows>
            </Card>
        </div>
    );
}

function DataStorageSection() {
    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <GroupLabel>Stockage</GroupLabel>
                <div className="px-5 pb-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">Données de l’application</span>
                        <span className="text-sm font-bold text-slate-900 tabular-nums">48 Mo / 1 Go</span>
                    </div>
                    <div
                        role="img"
                        aria-label="Répartition du stockage utilisé : Séances 12 Mo, Nutrition 8 Mo, Autre 28 Mo, sur 48 Mo au total"
                        className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100"
                    >
                        <div className="h-full bg-[#7B3FF2]" style={{ width: '25%' }} />
                        <div className="h-full bg-blue-500" style={{ width: '17%' }} />
                        <div className="h-full bg-slate-300" style={{ width: '58%' }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#7B3FF2]" aria-hidden="true" />
                            Séances 12 Mo
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                            Nutrition 8 Mo
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden="true" />
                            Autre 28 Mo
                        </span>
                    </div>
                </div>
                <div className="border-t border-slate-100">
                    <LinkRow icon={Trash2} iconClassName="bg-slate-100 text-slate-600" label="Vider le cache" sublabel="Libérer 28 Mo" />
                </div>
            </Card>

            <Card className="overflow-hidden">
                <GroupLabel>Export et sauvegarde</GroupLabel>
                <Rows>
                    <LinkRow icon={Download} iconClassName="bg-blue-50 text-blue-600" label="Exporter toutes les données" sublabel="Format CSV / JSON" />
                    <LinkRow icon={Cloud} iconClassName="bg-emerald-50 text-emerald-600" label="Sauvegarde dans le cloud" sublabel="Dernière sauvegarde : il y a 2 jours" />
                </Rows>
            </Card>

            <Card className="overflow-hidden">
                <LinkRow icon={Trash2} iconClassName="bg-red-50 text-red-600" label="Supprimer le compte" sublabel="Supprimer définitivement toutes les données" danger />
            </Card>
        </div>
    );
}

function HelpSupportSection() {
    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <Rows>
                    <LinkRow icon={HelpCircle} iconClassName="bg-blue-50 text-blue-600" label="Centre d’aide" sublabel="FAQ et guides" />
                    <LinkRow icon={Headphones} iconClassName="bg-purple-50 text-[#7B3FF2]" label="Contacter le support" sublabel="Obtenez de l’aide de notre équipe" />
                    <LinkRow icon={Star} iconClassName="bg-amber-50 text-amber-600" label="Noter l’application" sublabel="Partagez votre avis" />
                    <LinkRow icon={Sparkles} iconClassName="bg-pink-50 text-pink-600" label="Nouveautés" sublabel="Version 3.2.1 — juin 2026" />
                </Rows>
            </Card>

            <Card className="p-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div
                        aria-hidden="true"
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-white shadow-sm"
                    >
                        <Activity className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-slate-900">Health AI Coach</p>
                    <p className="text-xs text-slate-500">Version 3.2.1 (build 412)</p>
                    <p className="text-xs text-slate-500">© 2026 Health AI Inc.</p>
                </div>
            </Card>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [activeId, setActiveId] = useState('account');
    const [expandedId, setExpandedId] = useState<string | null>('account');
    const [subscription, setSubscription] = useState<{ type: string | null; isPremium: boolean; renewal: string | null }>({
        type: null,
        isPremium: false,
        renewal: null,
    });

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        const fetchSubscription = async () => {
            try {
                const res = await axios.post('/api/users/search', {
                    search: {
                        filters: [{ field: 'id', operator: '=', value: user.id }],
                        includes: [{ relation: 'subscriptions' }],
                    },
                });
                if (cancelled) return;

                const profile = res.data?.data?.[0] ?? res.data?.[0] ?? null;
                const subs: any[] = profile?.subscriptions ?? [];
                if (subs.length) {
                    const premium = subs.find((s) => /premium/i.test(s.subscription_type ?? ''));
                    const chosen = premium ?? subs[0];
                    const endedAt = chosen.ended_at ?? chosen.pivot?.ended_at ?? null;
                    setSubscription({
                        type: chosen.subscription_type ?? null,
                        isPremium: Boolean(premium),
                        renewal: endedAt
                            ? new Date(endedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                            : null,
                    });
                } else {
                    setSubscription({ type: null, isPremium: false, renewal: null });
                }
            } catch (error) {
                console.error('Erreur lors du chargement de l’abonnement :', error);
            }
        };

        fetchSubscription();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const planBadge = subscription.isPremium
        ? 'Membre Premium'
        : subscription.type
          ? `Membre ${capitalize(subscription.type)}`
          : null;
    const planShort = subscription.type ? capitalize(subscription.type) : 'Membre';
    const subscriptionSublabel = subscription.type
        ? `${capitalize(subscription.type)}${subscription.renewal ? ` — renouvellement en ${subscription.renewal}` : ''}`
        : 'Aucun abonnement actif';

    const renderContent = (id: string) => {
        switch (id) {
            case 'account':
                return (
                    <AccountSection
                        user={user}
                        logout={logout}
                        planBadge={planBadge}
                        subscriptionSublabel={subscriptionSublabel}
                    />
                );
            case 'notifications':
                return <NotificationsSection />;
            case 'appearance':
                return <AppearanceSection />;
            case 'fitness':
                return <FitnessSection />;
            case 'nutrition':
                return <NutritionSection />;
            case 'privacy':
                return <PrivacySection />;
            case 'integrations':
                return <IntegrationsSection />;
            case 'data':
                return <DataStorageSection />;
            case 'help':
                return <HelpSupportSection />;
            default:
                return null;
        }
    };

    const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

    const initials =
        (user ? `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`.toUpperCase() : '') || 'U';
    const fullName = (user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '') || 'Utilisateur';

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 mb-12">
            <h1 className="mb-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Paramètres</h1>

            {/* DESKTOP & TABLETTE : sous-navigation + contenu */}
            <div className="hidden md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-start md:gap-8">
                <aside aria-label="Sections des paramètres" className="md:sticky md:top-8">
                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                        <div
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-sm font-bold text-white"
                        >
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{fullName}</p>
                            <p className="text-xs text-slate-500">{planShort}</p>
                        </div>
                    </div>

                    <nav>
                        <ul className="space-y-1">
                            {SECTIONS.map((s) => {
                                const Icon = s.icon;
                                const isActive = s.id === activeId;
                                return (
                                    <li key={s.id}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveId(s.id)}
                                            aria-current={isActive ? 'true' : undefined}
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] ${
                                                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-700' : s.iconClassName}`} aria-hidden="true" />
                                            <span className="truncate">{s.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </aside>

                <div className="min-w-0">
                    <div className="max-w-2xl">
                        <header className="mb-5">
                            <h2 className="text-xl font-bold text-slate-900">{active.title}</h2>
                            <p className="mt-0.5 text-sm text-slate-500">{active.subtitle}</p>
                        </header>
                        {renderContent(active.id)}
                    </div>
                </div>
            </div>

            {/* MOBILE : accordéon */}
            <div className="space-y-3 md:hidden">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div
                        aria-hidden="true"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-base font-bold text-white"
                    >
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-900">{fullName}</p>
                        <p className="truncate text-sm text-slate-500">{user?.email}</p>
                    </div>
                    {subscription.type && (
                        <span className="shrink-0 rounded-full bg-[#7B3FF2] px-2.5 py-0.5 text-xs font-bold text-white">{planShort}</span>
                    )}
                </div>

                {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const isOpen = expandedId === s.id;
                    const panelId = `settings-panel-${s.id}`;
                    return (
                        <div key={s.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <h2>
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isOpen ? null : s.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7B3FF2]"
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className={`h-5 w-5 shrink-0 ${s.iconClassName}`} aria-hidden="true" />
                                        <span className="font-bold text-slate-900">{s.label}</span>
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>
                            </h2>
                            {isOpen && (
                                <div id={panelId} className="border-t border-slate-100 bg-slate-50/50 p-4">
                                    <p className="mb-3 text-sm text-slate-500">{s.subtitle}</p>
                                    {renderContent(s.id)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}