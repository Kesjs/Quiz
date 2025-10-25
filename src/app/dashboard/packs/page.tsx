'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
import { Progress } from '@/components/ui/progress';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  BoltIcon,
  LightBulbIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  daily_profit: number;
  duration_days: number;
  features: string[];
  color: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
  badge?: string;
  gradient: string;
  hoverBg: string;
  iconColor: string;
}

interface Subscription {
  id: string;
  plan_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: (i: number) => ({
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    })
  }
};

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter GNL',
    description: 'Parfait pour débuter',
    min_amount: 100,
    daily_profit: 1.5,
    duration_days: 90,
    badge: 'Parfait pour débuter',
    icon: BoltIcon,
    color: 'bg-blue-500',
    iconColor: 'text-blue-400',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-400/10',
    hoverBg: 'hover:bg-blue-500/10',
    features: [
      'Retour sur investissement garanti',
      'Support prioritaire',
      'Accès à la plateforme',
      'Rapports mensuels'
    ]
  },
  {
    id: 'premium',
    name: 'Premium GNL',
    description: 'Investissement équilibré',
    min_amount: 225,
    daily_profit: 2.0,
    duration_days: 120,
    badge: 'Investissement équilibré',
    icon: ChartBarIcon,
    color: 'bg-emerald-500',
    popular: true,
    iconColor: 'text-emerald-400',
    gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-400/10',
    hoverBg: 'hover:bg-emerald-500/10',
    features: [
      'Tout dans Starter, plus:',
      'Retour sur investissement supérieur',
      'Support 24/7',
      'Analyse personnalisée',
      'Rapports hebdomadaires'
    ]
  },
  {
    id: 'elite',
    name: 'Elite GNL',
    description: 'Investisseur avancé',
    min_amount: 999,
    daily_profit: 2.5,
    duration_days: 180,
    badge: 'Investisseur avancé',
    icon: CubeIcon,
    color: 'bg-purple-500',
    iconColor: 'text-purple-400',
    gradient: 'bg-gradient-to-br from-purple-600/20 to-indigo-500/10',
    hoverBg: 'hover:bg-purple-500/10',
    features: [
      'Tout dans Premium, plus:',
      'Gestion de portefeuille personnalisée',
      'Rencontres trimestrielles',
      'Accès anticipé aux opportunités',
      'Rapports détaillés',
      'Assistance VIP dédiée'
    ]
  },
  {
    id: 'ultimate',
    name: 'Élite GNL',
    description: 'Investisseur professionnel',
    min_amount: 1999,
    daily_profit: 3.0,
    duration_days: 365,
    badge: 'Investisseur professionnel',
    icon: SparklesIcon,
    color: 'bg-orange-500',
    iconColor: 'text-orange-400',
    gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10',
    hoverBg: 'hover:bg-orange-500/10',
    features: [
      'Tout dans Elite, plus:',
      'Stratégie d\'investissement sur mesure',
      'Rencontres mensuelles',
      'Accès exclusif aux opportunités',
      'Rapports personnalisés',
      'Conseiller personnel dédié',
      'Invitations aux événements VIP'
    ]
  }
];

export default function PacksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [investedBalance, setInvestedBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  // Nouvel état pour gérer les pages
  const [currentPage, setCurrentPage] = useState<'packs' | 'security' | 'payment'>('packs');
  // État pour les conditions
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleDeposit = async (amount: number, method: string) => {
    // Si un plan est sélectionné, c'est une souscription
    if (selectedPlan) {
      // Vérifier que le montant correspond au minimum du plan
      if (amount !== selectedPlan.min_amount) {
        alert(`Pour souscrire au pack ${selectedPlan.name}, le montant doit être exactement de ${selectedPlan.min_amount}€.`);
        return;
      }

      // Créer la souscription
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.min_amount
        }),
      });

      if (res.ok) {
        alert(`Souscription au pack ${selectedPlan.name} réussie ! Votre investissement de ${selectedPlan.min_amount}€ provenant de fonds externes a été ajouté à votre solde investi.`);
        // Rafraîchir les données depuis la base de données
        await fetchData();
        // Fermer la modale
        setShowDepositModal(false);
        setSelectedPlan(null);
        // Rediriger vers le dashboard principal pour voir les changements
        router.push('/dashboard');
      } else {
        alert('Erreur lors de la souscription. Veuillez réessayer.');
      }
    }
  };

  // Rediriger si non connecté
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [router]); // Removed user from dependencies

  // Détecter les paramètres d'URL pour navigation automatique
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const planParam = searchParams.get('plan');

    if (fromParam === 'landing' && !loading && balance >= 0) {
      // Trouver le plan correspondant au prix passé en paramètre
      if (planParam) {
        const price = parseInt(planParam);
        const plan = plans.find(p => p.min_amount === price);
        if (plan) {
          setSelectedPlan(plan);
          setCurrentPage('security');
          // Nettoyer l'URL
          router.replace('/dashboard/packs', undefined);
        }
      }
    }
  }, [searchParams, loading, balance, router]);

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError('Erreur d\'authentification. Veuillez vous reconnecter.');
        router.push('/auth/signin');
        return;
      }

      if (!currentUser) {
        setError('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/signin');
        return;
      }

      // Fetch transactions for balance
      const { data: trans, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (transError) {
        setError('Erreur lors du chargement du solde.');
        console.error('Transactions error:', transError);
      } else {
        const total = trans?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
        setBalance(total);
      }

      // Fetch active subscriptions
      const { data: subs, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'active');

      if (subsError) {
        console.error('Subscriptions error:', subsError);
      } else {
        // Convertir les données de la DB au format attendu par le composant
        const formattedSubs: Subscription[] = (subs || []).map((sub: any) => ({
          id: sub.id.toString(),
          plan_id: sub.plan_id,
          amount: sub.amount,
          start_date: sub.start_date,
          end_date: sub.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fallback
          status: sub.status as 'active' | 'completed' | 'cancelled',
          progress: 0 // Calculé dynamiquement plus tard
        }));
        setActiveSubscriptions(formattedSubs);

        // Calculer le solde investi (somme des souscriptions actives)
        const totalInvested = formattedSubs.reduce((total, sub) => total + sub.amount, 0);
        setInvestedBalance(totalInvested);
      }

    } catch (err) {
      setError('Erreur inattendue. Veuillez rafraîchir la page.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData]); // Removed user from dependencies

  const handleSubscribe = (plan: Plan) => {
    // Naviguer vers la page de sécurité avec le plan sélectionné
    setSelectedPlan(plan);
    setCurrentPage('security');
  };

  const handleBackToPacks = () => {
    setCurrentPage('packs');
    setSelectedPlan(null);
  };

  const handleProceedToPayment = () => {
    setCurrentPage('payment');
  };

  const handleBackToSecurity = () => {
    setCurrentPage('security');
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2">Erreur</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Rafraîchir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Affichage conditionnel selon la page actuelle */}
      {currentPage === 'packs' && (
        <>
          {/* Header avec soldes */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mes Packs d&apos;Investissement
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez vos investissements et découvrez de nouvelles opportunités
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Solde disponible</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{balance.toFixed(2)}€</p>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Solde investi</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{investedBalance.toFixed(2)}€</p>
              </div>
            </div>
          </div>

          {/* Sélecteur d'onglets personnalisé */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('available')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Packs Disponibles
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Mes Packs Actifs ({activeSubscriptions.length})
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'available' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const IconComponent = plan.icon;
                  const isSubscribed = activeSubscriptions.some(sub => sub.plan_id === plan.id);
                  // Plus de vérification de solde disponible
                  const canAfford = true;

                  // Déterminer la couleur du bouton selon le pack
                  const getButtonColor = (planId: string) => {
                    switch (planId) {
                      case 'starter': return 'bg-blue-600 hover:bg-blue-700';
                      case 'premium': return 'bg-emerald-600 hover:bg-emerald-700';
                      case 'elite': return 'bg-purple-600 hover:bg-purple-700';
                      case 'ultimate': return 'bg-orange-600 hover:bg-orange-700';
                      default: return 'bg-blue-600 hover:bg-blue-700';
                    }
                  };

                  return (
                    <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${plan.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          {plan.id === 'elite' && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-grow">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <CurrencyEuroIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Min. investissement</p>
                              <p className="font-semibold">{plan.min_amount.toLocaleString()} €</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ChartBarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Rendement/jour</p>
                              <p className="font-semibold text-green-600">{plan.daily_profit}%</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Durée</p>
                              <p className="font-semibold">{plan.duration_days} jours</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Gain estimé</p>
                              <p className="font-semibold text-blue-600">
                                +{((plan.min_amount * plan.daily_profit * plan.duration_days) / 100).toLocaleString()} €
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Avantages inclus :</h4>
                          <ul className="space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>

                      <CardFooter className="mt-auto">
                        <Button
                          onClick={() => handleSubscribe(plan)}
                          disabled={isSubscribed}
                          className={`w-full text-white ${getButtonColor(plan.id)}`}
                          variant={isSubscribed ? "secondary" : "default"}
                        >
                          {isSubscribed ? 'Déjà souscrit' : 'Souscrire maintenant'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Onglet packs actifs */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {activeSubscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <ChartBarIcon />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Aucun pack actif
                  </h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Souscrivez à un pack pour commencer à investir dans le GNL.
                  </p>
                  <Button
                    onClick={() => setActiveTab('available')}
                    className="mt-4"
                  >
                    Voir les packs disponibles
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSubscriptions.map((subscription) => {
                    const plan = plans.find(p => p.id === subscription.plan_id);
                    if (!plan) return null;

                    const IconComponent = plan.icon;
                    const endDate = new Date(subscription.end_date);
                    const now = new Date();
                    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const progress = Math.min(100, Math.max(0, ((plan.duration_days - daysRemaining) / plan.duration_days) * 100));

                    return (
                      <Card key={subscription.id} className="overflow-hidden border border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${plan.color}`}>
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>
                                  Investissement: {subscription.amount.toLocaleString()} €
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Actif
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Début</p>
                              <p className="font-medium">
                                {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Fin</p>
                              <p className="font-medium">
                                {endDate.toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Jours restants</p>
                              <p className="font-medium text-blue-600">{daysRemaining}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Gain estimé total</p>
                              <p className="font-medium text-green-600">
                                +{((subscription.amount * plan.daily_profit * plan.duration_days) / 100).toLocaleString()} €
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progression</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2 border border-gray-200 dark:border-gray-700" />
                          </div>
                        </CardContent>

                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm">
                            Voir détails
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Résilier
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Page de sécurité */}
      {currentPage === 'security' && selectedPlan && (
        <div className="space-y-6">
          {/* Header avec bouton retour */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToPacks}
                className="flex items-center"
              >
                ← Retour aux packs
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Souscription - {selectedPlan.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Vérifiez les détails et confirmez votre investissement
                </p>
              </div>
            </div>
          </div>

          {/* Contenu simplifié */}
          <div className="max-w-4xl mx-auto">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardTitle className="flex items-center">
                  <div className={`p-3 rounded-xl ${selectedPlan.color} mr-4`}>
                    <selectedPlan.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Récapitulatif de votre investissement</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Pack {selectedPlan.name} - {selectedPlan.min_amount}€
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Métriques principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CurrencyEuroIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.min_amount}€</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Investissement</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.daily_profit}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Par jour</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.duration_days}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Jours</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      +{((selectedPlan.min_amount * selectedPlan.daily_profit * selectedPlan.duration_days) / 100).toFixed(0)}€
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gain estimé</div>
                  </div>
                </div>

                {/* Avantages */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avantages inclus</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations de sécurité discrètes */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <div className="w-4 h-4 bg-gray-600 rounded-full mr-2"></div>
                      Sécurité de votre investissement
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Votre paiement est sécurisé par chiffrement SSL 256-bit et traité selon les normes PCI DSS.
                      Vos données bancaires ne sont jamais stockées sur nos serveurs et sont immédiatement supprimées après traitement.
                      Authentification 2FA disponible pour sécuriser davantage votre compte.
                    </p>
                  </div>
                </div>

                {/* Conditions générales */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          J&apos;accepte les{' '}
                          <button
                            type="button"
                            onClick={() => setShowTerms(!showTerms)}
                            className="text-gray-600 hover:text-gray-600 underline font-medium transition-colors"
                          >
                            conditions générales d&apos;utilisation
                          </button>
                          {' '}et la politique de confidentialité
                        </label>
                      </div>
                    </div>

                    {/* Contenu des conditions (dépliable) */}
                    {showTerms && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Conditions Générales d&apos;Utilisation</h5>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed max-h-40 overflow-y-auto">
                          <p>
                            <strong>1. Objet :</strong> Ces conditions régissent l&apos;utilisation de la plateforme d&apos;investissement Gazoduc Invest.
                          </p>
                          <p>
                            <strong>2. Services :</strong> La plateforme permet d&apos;investir dans des packs d&apos;investissement basés sur le GNL avec rendements garantis.
                          </p>
                          <p>
                            <strong>3. Souscription :</strong> L&apos;investissement minimum requis doit être respecté. Les fonds sont crédités immédiatement après paiement.
                          </p>
                          <p>
                            <strong>4. Sécurité :</strong> Tous les paiements sont sécurisés par chiffrement SSL et respectent les normes PCI DSS.
                          </p>
                          <p>
                            <strong>5. Responsabilités :</strong> L&apos;utilisateur est responsable de la sécurité de ses accès. Gazoduc Invest n&apos;est pas responsable des pertes dues à des accès non autorisés.
                          </p>
                          <p>
                            <strong>6. Confidentialité :</strong> Les données personnelles sont traitées conformément au RGPD. Aucune donnée bancaire n&apos;est stockée.
                          </p>
                          <p>
                            <strong>7. Résiliation :</strong> L&apos;utilisateur peut résilier son pack à tout moment, sous réserve des conditions spécifiques de chaque pack.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton de confirmation */}
                <div className="pt-6">
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!acceptTerms}
                    size="lg"
                    className={`w-full py-4 text-lg font-semibold text-white transition-opacity duration-200 ${
                      acceptTerms ? 'opacity-90 hover:opacity-100' : 'opacity-60'
                    } ${
                      selectedPlan.id === 'starter' ? 'bg-blue-600 hover:bg-blue-700' :
                      selectedPlan.id === 'premium' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      selectedPlan.id === 'elite' ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    Confirmer et procéder au paiement - {selectedPlan.min_amount}€
                  </Button>
                  {!acceptTerms && (
                    <p className="text-xs text-center text-red-500 mt-2">
                      Veuillez accepter les conditions générales pour continuer
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Page de paiement */}
      {currentPage === 'payment' && selectedPlan && (
        <div className="space-y-6">
          {/* Header avec bouton retour */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSecurity}
                className="flex items-center"
              >
                ← Retour à la sécurité
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Paiement - {selectedPlan.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Finalisez votre investissement en toute sécurité
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="max-w-2xl mx-auto">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardTitle className="flex items-center">
                  <div className={`p-3 rounded-xl ${selectedPlan.color} mr-4`}>
                    <selectedPlan.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Finaliser votre paiement</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Montant : {selectedPlan.min_amount}€ - Pack {selectedPlan.name}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Montant total à payer :</span>
                    <span className="text-2xl font-bold text-blue-600">{selectedPlan.min_amount}€</span>
                  </div>
                </div>

                {/* Méthodes de paiement */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choisissez votre méthode de paiement</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <button className="flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">💳</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Carte bancaire</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard, American Express</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      </div>
                    </button>

                    <button className="flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                      <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">P</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">PayPal</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Paiement rapide et sécurisé</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      </div>
                    </button>

                    <button className="flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">₿</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Cryptomonnaies</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Bitcoin, Ethereum, autres</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Bouton de paiement */}
                <div className="pt-6">
                  <Button
                    onClick={() => handleDeposit(selectedPlan.min_amount, 'card')}
                    size="lg"
                    className={`w-full py-4 text-lg font-semibold ${selectedPlan.id === 'starter' ? 'bg-blue-600 hover:bg-blue-700' :
                      selectedPlan.id === 'premium' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      selectedPlan.id === 'elite' ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-orange-600 hover:bg-orange-700'}`}
                  >
                    Payer {selectedPlan.min_amount}€ et activer mon pack {selectedPlan.name}
                  </Button>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    En procédant au paiement, vous acceptez nos conditions générales d&apos;utilisation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modales (conservés pour les retraits) */}
      {showWithdrawModal && (
        <WithdrawModal
          balance={balance}
          onConfirm={(amount: number) => {
            fetchData(); // Refresh balance from DB
            setShowWithdrawModal(false);
          }}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
}
