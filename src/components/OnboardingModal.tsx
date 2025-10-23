'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ArrowRight, ChevronRight } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  content: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
  highlight?: boolean
}

interface OnboardingModalProps {
  steps: OnboardingStep[]
  onComplete: () => void
  currentStep: number
  onNext: () => void
  onSkip: () => void
}

export function OnboardingModal({
  steps,
  onComplete,
  currentStep,
  onNext,
  onSkip
}: OnboardingModalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const step = steps[currentStep]

  useEffect(() => {
    if (step) {
      calculatePosition()
      setIsVisible(true)
    }
  }, [step, currentStep])

  const calculatePosition = () => {
    if (!step) return

    const targetElement = document.querySelector(step.targetSelector)
    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    const modalWidth = 320
    const modalHeight = 200
    const margin = 20

    let top = 0
    let left = 0
    let arrowTop = 0
    let arrowLeft = 0

    switch (step.position) {
      case 'top':
        top = rect.top - modalHeight - margin
        left = rect.left + (rect.width / 2) - (modalWidth / 2)
        arrowTop = modalHeight - 10
        arrowLeft = modalWidth / 2 - 10
        break
      case 'bottom':
        top = rect.bottom + margin
        left = rect.left + (rect.width / 2) - (modalWidth / 2)
        arrowTop = -10
        arrowLeft = modalWidth / 2 - 10
        break
      case 'left':
        top = rect.top + (rect.height / 2) - (modalHeight / 2)
        left = rect.left - modalWidth - margin
        arrowTop = modalHeight / 2 - 10
        arrowLeft = modalWidth - 10
        break
      case 'right':
        top = rect.top + (rect.height / 2) - (modalHeight / 2)
        left = rect.right + margin
        arrowTop = modalHeight / 2 - 10
        arrowLeft = -10
        break
    }

    // Ajustements pour rester dans la viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (left < margin) left = margin
    if (left + modalWidth > viewportWidth - margin) left = viewportWidth - modalWidth - margin
    if (top < margin) top = margin
    if (top + modalHeight > viewportHeight - margin) top = viewportHeight - modalHeight - margin

    setPosition({ top, left })
    setArrowPosition({ top: arrowTop, left: arrowLeft })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsVisible(false)
      setTimeout(() => {
        onNext()
      }, 300)
    } else {
      onComplete()
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onSkip()
    }, 300)
  }

  if (!step) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      {/* Highlight target element */}
      {step.highlight && (
        <div
          className="fixed z-45 pointer-events-none border-2 border-blue-500 rounded-lg shadow-lg"
          style={{
            top: document.querySelector(step.targetSelector)?.getBoundingClientRect().top || 0,
            left: document.querySelector(step.targetSelector)?.getBoundingClientRect().left || 0,
            width: document.querySelector(step.targetSelector)?.getBoundingClientRect().width || 0,
            height: document.querySelector(step.targetSelector)?.getBoundingClientRect().height || 0,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      <div
        ref={modalRef}
        className={`fixed z-50 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{
          top: position.top,
          left: position.left,
          width: 340,
          maxWidth: '90vw'
        }}
      >
    {/* Flèche avec animation */}
    <div
      className="absolute w-5 h-5 bg-white border-2 border-blue-100 transform rotate-45 transition-all duration-300"
      style={{
        top: arrowPosition.top,
        left: arrowPosition.left,
        borderTop: step.position === 'bottom' ? '2px solid #dbeafe' : 'none',
        borderLeft: step.position === 'right' ? '2px solid #dbeafe' : 'none',
        borderBottom: step.position === 'top' ? '2px solid #dbeafe' : 'none',
        borderRight: step.position === 'left' ? '2px solid #dbeafe' : 'none',
        animation: isVisible ? 'bounce 0.6s ease-out' : 'none'
      }}
    />

    {/* Header avec gradient */}
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-lg">{currentStep + 1}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{step.title}</h3>
            <p className="text-blue-100 text-sm">
              Étape {currentStep + 1} sur {steps.length}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Barre de progression animée */}
      <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>

    {/* Content avec padding amélioré */}
    <div className="p-6">
      <p className="text-gray-700 mb-4 text-base leading-relaxed">{step.description}</p>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs">💡</span>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">{step.content}</p>
        </div>
      </div>
    </div>

    {/* Footer avec boutons améliorés */}
    <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
      <button
        onClick={handleClose}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
      >
        Passer l&apos;onboarding
      </button>
      <div className="flex items-center gap-3">
        {/* Indicateurs de progression */}
        <div className="flex gap-2 mr-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-blue-500 scale-125 shadow-md'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
        >
          {currentStep < steps.length - 1 ? (
            <>
              Suivant
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Terminer
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
    </>
  )
}
