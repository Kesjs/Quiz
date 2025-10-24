'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal';
import { DepositModal } from '@/components/dashboard/DepositModal';
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
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rediriger si non connecté
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

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
        const total = trans?.reduce((sum, t) => sum + t.amount, 0) || 0;
        setBalance(total);
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
  }, [user, fetchData]);

  const handleSubscribe = (plan: Plan) => {
    if (balance < plan.min_amount) {
      setShowDepositModal(true);
      return;
    }
    setSelectedPlan(plan);
    setShowSubscriptionModal(true);
  };

  const confirmSubscription = () => {
    if (!selectedPlan) return;

    // Ici, on ferait l'appel API pour créer l'abonnement
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      plan_id: selectedPlan.id,
      amount: selectedPlan.min_amount,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + selectedPlan.duration_days * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      progress: 0
    };

    setActiveSubscriptions([...activeSubscriptions, newSubscription]);
    fetchData(); // Refresh balance from DB
    setShowSubscriptionModal(false);
    setSelectedPlan(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mes Packs d&apos;Investissement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos investissements et découvrez de nouvelles opportunités
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Solde disponible</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {balance.toFixed(2)}€
            </p>
          </div>
          <Button onClick={() => setShowDepositModal(true)} className="bg-green-600 hover:bg-green-700">
            <CurrencyEuroIcon className="h-4 w-4 mr-2" />
            Déposer
          </Button>
        </div>
      </div>

      <div className="space-y-6">
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
                const canAfford = balance >= plan.min_amount;

                return (
                  <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
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

                    <CardContent className="space-y-4">
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

                    <CardFooter>
                      <Button
                        onClick={() => handleSubscribe(plan)}
                        disabled={isSubscribed || !canAfford}
                        className="w-full"
                        variant={isSubscribed ? "secondary" : canAfford ? "default" : "outline"}
                      >
                        {isSubscribed ? 'Déjà souscrit' : canAfford ? 'Souscrire maintenant' : 'Solde insuffisant'}
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
      </div>

      {/* Modales */}
      {showSubscriptionModal && selectedPlan && (
        <SubscriptionModal
          plan={selectedPlan}
          balance={balance}
          onConfirm={confirmSubscription}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {showDepositModal && (
        <DepositModal
          onConfirm={(amount) => {
            fetchData(); // Refresh balance from DB
            setShowDepositModal(false);
          }}
          onClose={() => setShowDepositModal(false)}
        />
      )}

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
