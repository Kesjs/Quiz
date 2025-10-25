'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { DepositModal, WithdrawModal } from '@/components/ui'
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

  // Hook pour les plans mis en cache (doit être avant les calculs qui utilisent plans)
  const { plans, loading: plansLoading } = useCachedPlans()

  // Calculer les soldes
  const investedBalance = useMemo(() =>
    subscriptions
      .filter(s => s.status === 'active')
      .reduce((total, sub) => total + sub.amount, 0),
    [subscriptions]
  )

  const evolvingBalance = useMemo(() => {
    if (!plans || plans.length === 0) return 0;

    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((total, sub) => {
        const plan = plans.find(p => p.id === sub.plan_id)
        if (!plan) return total

        const startDate = new Date(sub.start_date)
        const now = new Date()
        const daysElapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

        if (daysElapsed > 0) {
          const earnings = daysElapsed * plan.daily_profit
          return total + earnings
        }
        return total
      }, 0)
  }, [subscriptions, plans])

  // Déterminer le montant minimum pour le retrait selon les packs actifs
  const getMinimumWithdrawal = useMemo(() => {
    if (!plans || plans.length === 0) return 0;

    const activePlans = subscriptions
      .filter(s => s.status === 'active')
      .map(s => plans.find(p => p.id === s.plan_id))
      .filter(Boolean)

    // Logique pour déterminer le minimum selon les packs actifs
    // Utilise l'option 1 (25%) par défaut comme demandé, arrondie
    const minAmounts = activePlans.map(plan => {
      if (!plan) return 0
      switch (plan.min_amount) {
        case 100: return 25 // Starter
        case 225: return 50 // Premium (arrondi de 56.25)
        case 999: return 200 // Elite (arrondi de 249.75)
        case 1999: return 400 // Élite (arrondi de 499.75)
        default: return 0
      }
    })

    return Math.max(...minAmounts, 0)
  }, [subscriptions, plans])

  const minimumWithdrawal = getMinimumWithdrawal
  const canWithdraw = evolvingBalance >= minimumWithdrawal

  // Ancienne position du hook useCachedPlans (maintenant déplacé plus haut)

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
      // Vérifier que le montant demandé respecte le minimum
      if (amount < minimumWithdrawal) {
        alert(`Le montant minimum de retrait est de $${minimumWithdrawal.toFixed(2)} pour vos packs actifs.`)
        return
      }

      // Vérifier que le montant demandé ne dépasse pas le solde évolutif disponible
      if (amount > evolvingBalance) {
        alert(`Le montant demandé dépasse votre solde évolutif disponible ($${evolvingBalance.toFixed(2)}).`)
        return
      }

      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      })
      if (res.ok) {
        alert(`Demande de retrait de $${amount} depuis votre solde évolutif enregistrée. Le traitement peut prendre quelques minutes.`)
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Solde Investi (Statique) */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 balance-card border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Solde Investi</h3>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">${investedBalance.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                Montant total investi dans vos packs actifs
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3" />
                  <span>Capital sécurisé</span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {subscriptions.filter(s => s.status === 'active').length} pack{subscriptions.filter(s => s.status === 'active').length > 1 ? 's' : ''} actif{subscriptions.filter(s => s.status === 'active').length > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Solde Évolutif (Gains) */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 balance-card border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Solde Évolutif</h3>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">${evolvingBalance.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                Gains générés par vos investissements actifs
              </p>
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum retrait: ${minimumWithdrawal.toFixed(2)}
                </div>
                <button
                  onClick={() => canWithdraw && setWithdrawModalOpen(true)}
                  disabled={!canWithdraw}
                  className={`w-full text-xs px-3 py-2 rounded-lg transition-all duration-200 ${
                    canWithdraw
                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white transform hover:scale-105 shadow-sm hover:shadow-md'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canWithdraw ? 'Retirer' : 'Montant insuffisant'}
                </button>
              </div>
            </div>

            {/* Souscriptions actives */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 subscriptions-active-card border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Souscriptions actives</h3>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Plans d&apos;investissement générant des revenus
              </p>
            </div>

            {/* Performance totale */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200 performance-card border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Performance totale</h3>
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                  <Lightbulb className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                ${(investedBalance + evolvingBalance).toFixed(2)}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Valeur totale de votre portefeuille
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
            maxAmount={evolvingBalance}
            minimumAmount={minimumWithdrawal}
          />
        </div>
      </div>
    </motion.div>
  )
}
