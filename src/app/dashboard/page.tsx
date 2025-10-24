'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { DepositModal, WithdrawModal } from '@/components/ui'
import { useDashboardOnboarding } from '@/hooks/useDashboardOnboarding'
import { OnboardingModal } from '@/components/OnboardingModal'
import { useCachedPlans } from '@/hooks/useCachedPlans'
import {
  User,
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3,
  Lightbulb,
  Sparkles,
  Gem,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Profile {
  id: string
  email: string
  full_name: string
}

interface Subscription {
  id: number
  plan_id: number
  amount: number
  start_date: string
  status: string
}

interface Transaction {
  id: number
  type: string
  amount: number
  description?: string
  created_at: string
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [balance, setBalance] = useState(0)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsPage, setTransactionsPage] = useState(1)
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [error, setError] = useState('')
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const TRANSACTIONS_PER_PAGE = 20

  // Mémoriser les calculs coûteux
  const activeSubscriptionsCount = useMemo(() =>
    subscriptions.filter(s => s.status === 'active').length,
    [subscriptions]
  )

  const transactionStats = useMemo(() => ({
    total: transactions.length,
    hasMore: hasMoreTransactions
  }), [transactions.length, hasMoreTransactions])

  // Hook d'onboarding
  const {
    isActive: onboardingActive,
    isCompleted: onboardingCompleted,
    currentStep,
    steps,
    handleNext,
    handleComplete,
    handleSkip,
    resetOnboarding
  } = useDashboardOnboarding(subscriptions.length > 0)

  // Hook pour les plans mis en cache
  const { plans, loading: plansLoading } = useCachedPlans()

  // Charger le profil utilisateur
  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        setError('Erreur d\'authentification. Veuillez vous reconnecter.')
        router.push('/auth/signin')
        return
      }

      if (!user) {
        setError('Session expirée. Veuillez vous reconnecter.')
        router.push('/auth/signin')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
      } else {
        setProfile(profileData)
      }

      return user
    } catch (err) {
      setError('Erreur inattendue. Veuillez rafraîchir la page.')
      console.error('Profile fetch error:', err)
      return null
    }
  }, [router, supabase])

  // Charger les souscriptions
  const fetchSubscriptions = useCallback(async (userId: string) => {
    try {
      const { data: subs, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)

      if (subsError) {
        setError('Erreur lors du chargement des souscriptions.')
        console.error('Subscriptions error:', subsError)
      } else {
        setSubscriptions(subs || [])
      }
    } catch (err) {
      console.error('Subscriptions fetch error:', err)
    }
  }, [supabase])

  // Charger les transactions avec pagination
  const fetchTransactions = useCallback(async (userId: string, page: number = 1) => {
    try {
      setLoadingTransactions(true)
      const from = (page - 1) * TRANSACTIONS_PER_PAGE
      const to = from + TRANSACTIONS_PER_PAGE - 1

      const { data: trans, error: transError, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (transError) {
        setError('Erreur lors du chargement des transactions.')
        console.error('Transactions error:', transError)
      } else {
        if (page === 1) {
          setTransactions(trans || [])
        } else {
          setTransactions(prev => [...prev, ...(trans || [])])
        }
        setHasMoreTransactions(count ? (from + (trans?.length || 0)) < count : false)

        // Calculer le solde uniquement pour la première page
        if (page === 1) {
          const { data: allTrans } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
          const total = allTrans?.reduce((sum, t) => sum + t.amount, 0) || 0
          setBalance(total)
        }
      }
    } catch (err) {
      console.error('Transactions fetch error:', err)
    } finally {
      setLoadingTransactions(false)
    }
  }, [supabase])

  // Fonction principale de chargement des données
  const fetchData = useCallback(async () => {
    try {
      setError('')
      const user = await fetchProfile()
      if (user) {
        await Promise.all([
          fetchSubscriptions(user.id),
          fetchTransactions(user.id, 1)
        ])
      }
    } catch (err) {
      setError('Erreur inattendue. Veuillez rafraîchir la page.')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchProfile, fetchSubscriptions, fetchTransactions])

  // Déclencher le chargement des données au montage du composant
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const loadMoreTransactions = useCallback(async () => {
    if (!profile?.id || loadingTransactions || !hasMoreTransactions) return

    const nextPage = transactionsPage + 1
    setTransactionsPage(nextPage)
    await fetchTransactions(profile.id, nextPage)
  }, [profile?.id, loadingTransactions, hasMoreTransactions, transactionsPage, fetchTransactions])

  const handleSubscribe = async (planId: number, amount: number) => {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, amount }),
    })
    if (res.ok) {
      alert('Souscription réussie')
      fetchData()
    } else {
      alert('Erreur')
    }
  }

  const handleDeposit = async (amount: number, method: string) => {
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      })
      if (res.ok) {
        alert(`Demande de dépôt de $${amount} via ${method.toUpperCase()} enregistrée. Vous recevrez une confirmation par email.`)
        fetchData()
      } else {
        alert('Erreur lors du traitement du dépôt')
      }
    } catch (error) {
      alert('Erreur réseau. Veuillez réessayer.')
    }
  }

  const handleWithdraw = async (amount: number, method: string) => {
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      })
      if (res.ok) {
        alert(`Demande de retrait de $${amount} via ${method.toUpperCase()} enregistrée. Le traitement peut prendre quelques minutes.`)
        fetchData()
      } else {
        alert('Erreur lors du traitement du retrait')
      }
    } catch (error) {
      alert('Erreur réseau. Veuillez réessayer.')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>

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
    )
  }

  // Dashboard complet pour tous les utilisateurs
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-full w-full"
    >
      <div className="w-full max-w-none">
        <div className="space-y-6 md:space-y-8">
          <div className="mb-6 md:mb-8 dashboard-header">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 px-2 text-gray-900 dark:text-white">Tableau de bord - {profile?.full_name}</h1>
                <p className="text-gray-600 dark:text-gray-400 px-2 text-sm sm:text-base">
                  Gérez vos investissements dans le GNL et suivez vos performances en temps réel
                </p>
              </div>
              {/* Bouton de test pour réinitialiser l'onboarding */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={resetOnboarding}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  Reset Onboarding
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 balance-card group cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Solde disponible</h3>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">${balance.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                Montant disponible pour investir ou retirer
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDepositModalOpen(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md dark:shadow-gray-900/50"
                >
                  Dépôt
                </button>
                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  disabled={balance <= 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md dark:shadow-gray-900/50 disabled:transform-none"
                >
                  Retrait
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 subscriptions-active-card group cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Souscriptions actives</h3>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {activeSubscriptionsCount}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Plans d&apos;investissement en cours de génération de revenus
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 sm:col-span-2 lg:col-span-1 performance-card group cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Performance totale</h3>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">${balance.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Gains cumulés depuis le début de vos investissements
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow mb-6 md:mb-8 subscriptions-section">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-white">Mes Souscriptions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Liste de vos investissements actifs et leur statut actuel
              </p>
            </div>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune souscription active</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Commencez par choisir un plan d&apos;investissement ci-dessous</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subscriptions.map(sub => {
                    const plan = plans.find(p => p.id === sub.plan_id)
                    const startDate = new Date(sub.start_date)
                    const endDate = new Date(startDate)
                    endDate.setDate(startDate.getDate() + (plan?.duration_days || 30))

                    return (
                      <li key={sub.id} className="py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{plan?.name || `Plan ${sub.plan_id}`}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                sub.status === 'active'
                                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                                  : sub.status === 'inactive'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                              }`}>
                                {sub.status === 'active' ? '✓ Actif' : sub.status === 'inactive' ? '⏸ Inactif' : '✓ Terminé'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-medium">Investissement:</span>
                                <p className="text-green-600 dark:text-green-400 font-semibold">${sub.amount}</p>
                              </div>
                              <div>
                                <span className="font-medium">Début:</span>
                                <p>{startDate.toLocaleDateString('fr-FR')}</p>
                              </div>
                              <div>
                                <span className="font-medium">Fin prévue:</span>
                                <p>{endDate.toLocaleDateString('fr-FR')}</p>
                              </div>
                            </div>
                            {plan && (
                              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Profit quotidien estimé:</span> ${plan.daily_profit} •
                                <span className="ml-2 font-medium">Durée:</span> {plan.duration_days} jours
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow mb-6 md:mb-8 transactions-section">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-white">Historique des Transactions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suivez toutes vos transactions : investissements, gains et retraits
              </p>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune transaction</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Vos transactions apparaîtront ici après votre premier investissement</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map(transaction => {
                    const date = new Date(transaction.created_at)
                    const getTransactionIcon = (type: string) => {
                      switch (type) {
                        case 'deposit': return <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                        case 'subscription': return <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        case 'earnings': return <Gem className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        case 'withdrawal': return <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                        default: return <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      }
                    }
                    const getTransactionLabel = (type: string) => {
                      switch (type) {
                        case 'deposit': return 'Dépôt'
                        case 'subscription': return 'Souscription'
                        case 'earnings': return 'Gains'
                        case 'withdrawal': return 'Retrait'
                        default: return 'Transaction'
                      }
                    }
                    const getAmountColor = (type: string, amount: number) => {
                      if (type === 'withdrawal' || type === 'subscription') return 'text-red-600 dark:text-red-400'
                      return 'text-green-600 dark:text-green-400'
                    }

                    return (
                      <li key={transaction.id} className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{getTransactionLabel(transaction.type)}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getAmountColor(transaction.type, transaction.amount)}`}>
                              {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                            </p>
                            {transaction.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.description}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                {hasMoreTransactions && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={loadMoreTransactions}
                      disabled={loadingTransactions}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {loadingTransactions ? 'Chargement...' : 'Charger plus'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modales d'onboarding */}
          {onboardingActive && (
            <OnboardingModal
              steps={steps}
              onComplete={handleComplete}
              currentStep={currentStep}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}

          {/* Modals de paiement */}
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            onDeposit={handleDeposit}
          />

          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            onWithdraw={handleWithdraw}
            maxAmount={balance}
          />
        </div>
      </div>
    </motion.div>
  )
}
