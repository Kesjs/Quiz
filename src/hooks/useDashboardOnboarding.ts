'use client'

import { useState, useEffect } from 'react'
import { OnboardingModal } from '@/components/OnboardingModal'

interface OnboardingStep {
  id: string
  title: string
  description: string
  content: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
  highlight?: boolean
}

export function useDashboardOnboarding(hasSubscriptions: boolean = false) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Étapes d'onboarding adaptées selon le contexte utilisateur
  const getSteps = () => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Bienvenue sur votre Dashboard !',
        description: 'Découvrez votre espace de gestion d\'investissements',
        content: 'Cet espace centralise toutes vos informations financières : solde, investissements actifs, et historique des transactions.',
        targetSelector: '.dashboard-header',
        position: 'bottom',
        highlight: true
      },
      {
        id: 'balance',
        title: 'Votre Solde Disponible',
        description: 'Comprenez votre solde actuel',
        content: 'Ce montant représente les fonds disponibles pour investir ou retirer. Il s\'actualise automatiquement avec vos gains quotidiens.',
        targetSelector: '.balance-card',
        position: 'bottom',
        highlight: true
      },
      {
        id: 'active-subscriptions',
        title: 'Souscriptions Actives',
        description: 'Suivez vos investissements en cours',
        content: 'Ce compteur indique le nombre de plans d\'investissement actifs. Chaque plan génère des revenus quotidiens selon ses conditions.',
        targetSelector: '.subscriptions-active-card',
        position: 'bottom',
        highlight: true
      },
      {
        id: 'performance',
        title: 'Performance Totale',
        description: 'Vos gains cumulés',
        content: 'Ce montant représente l\'ensemble de vos gains depuis le début de vos investissements, incluant tous les plans actifs.',
        targetSelector: '.performance-card',
        position: 'bottom',
        highlight: true
      }
    ]

    // Étapes supplémentaires pour utilisateurs existants
    if (hasSubscriptions) {
      baseSteps.push(
        {
          id: 'subscriptions-list',
          title: 'Détails de vos Souscriptions',
          description: 'Informations complètes sur vos investissements',
          content: 'Consultez les dates de début/fin, montants investis, et profits quotidiens estimés pour chaque plan actif.',
          targetSelector: '.subscriptions-section',
          position: 'top',
          highlight: true
        },
        {
          id: 'transactions',
          title: 'Historique des Transactions',
          description: 'Suivez toutes vos opérations financières',
          content: 'Retrouvez vos dépôts, souscriptions, gains quotidiens et retraits. Chaque transaction est horodatée et détaillée.',
          targetSelector: '.transactions-section',
          position: 'top',
          highlight: true
        }
      )
    } else {
      // Étapes pour nouveaux utilisateurs (section d'accueil)
      baseSteps.push(
        {
          id: 'investment-plans',
          title: 'Plans d\'Investissement Disponibles',
          description: 'Découvrez les opportunités d\'investissement',
          content: 'Explorez les différents plans GNL disponibles. Chaque plan propose des conditions spécifiques avec ROI calculé automatiquement.',
          targetSelector: '#plans',
          position: 'top',
          highlight: true
        }
      )
    }

    return baseSteps
  }

  const steps = getSteps()

  useEffect(() => {
    // Vérifier si l'onboarding a déjà été complété
    const onboardingCompleted = localStorage.getItem('dashboard-onboarding-completed')
    if (!onboardingCompleted) {
      // Attendre que le DOM soit chargé avant de démarrer
      const timer = setTimeout(() => {
        setIsActive(true)
      }, 1500) // Délai pour laisser le dashboard se charger

      return () => clearTimeout(timer)
    } else {
      setIsCompleted(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsActive(false)
    setIsCompleted(true)
    localStorage.setItem('dashboard-onboarding-completed', 'true')
  }

  const handleSkip = () => {
    setIsActive(false)
    setIsCompleted(true)
    localStorage.setItem('dashboard-onboarding-completed', 'true')
  }

  const resetOnboarding = () => {
    setCurrentStep(0)
    setIsActive(true)
    setIsCompleted(false)
    localStorage.removeItem('dashboard-onboarding-completed')
  }

  return {
    isActive,
    isCompleted,
    currentStep,
    steps,
    handleNext,
    handleComplete,
    handleSkip,
    resetOnboarding
  }
}
