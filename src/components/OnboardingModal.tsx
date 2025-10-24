'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ChevronRight, Sparkles, Target } from 'lucide-react'

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
}: OnboardingModalProps): JSX.Element | null {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const step = steps[currentStep]

  const updateTargetPosition = useCallback(() => {
    if (!step?.targetSelector) return

    const targetElement = document.querySelector(step.targetSelector)
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      setTargetRect(rect)
    }
  }, [step])

  // Enhanced scroll to target with better detection
  const scrollToTarget = useCallback(() => {
    if (!step?.targetSelector) return

    const targetElement = document.querySelector(step.targetSelector)
    if (!targetElement) {
      console.warn(`Onboarding: Element with selector "${step.targetSelector}" not found`)
      // Try to find a fallback element or skip to next step
      setTimeout(() => {
        onNext()
      }, 1000)
      return
    }

    // Get element position and dimensions
    const elementRect = targetElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const scrollPadding = 120 // More padding to ensure element is clearly visible

    // Check if element is already visible enough
    const elementTop = elementRect.top
    const elementBottom = elementRect.bottom
    const isElementVisible = elementTop >= scrollPadding &&
                           elementBottom <= viewportHeight - scrollPadding &&
                           elementRect.left >= 0 &&
                           elementRect.right <= window.innerWidth

    if (!isElementVisible) {
      // Calculate optimal scroll position
      const elementCenter = elementTop + (elementRect.height / 2)
      const viewportCenter = viewportHeight / 2
      const scrollTop = window.pageYOffset + elementCenter - viewportCenter

      // Smooth scroll to element
      window.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      })

      // Wait for scroll to complete before showing modal
      setTimeout(() => {
        updateTargetPosition()
        setIsVisible(true)
      }, 800) // Increased delay for smoother experience
    } else {
      updateTargetPosition()
      setIsVisible(true)
    }
  }, [step, updateTargetPosition, setIsVisible, onNext]) // Added missing dependency array

  useEffect(() => {
    if (step) {
      setIsVisible(false)
      setHasScrolled(false)

      // Small delay to allow for step change animation
      const timer = setTimeout(() => {
        scrollToTarget()
      }, 400) // Increased delay

      return () => clearTimeout(timer)
    }
  }, [step, currentStep, scrollToTarget])

  // Update position more frequently during scroll
  useEffect(() => {
    const handleUpdate = () => {
      updateTargetPosition()
    }

    // Use passive listeners for better performance
    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [updateTargetPosition])

  // Auto-advance to next step after a delay
  useEffect(() => {
    if (isVisible && currentStep < steps.length - 1) {
      const autoAdvanceTimer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onNext()
        }, 500)
      }, 6000) // Auto-advance after 6 seconds to read content

      return () => clearTimeout(autoAdvanceTimer)
    }
  }, [isVisible, currentStep, steps.length, onNext])

  const handleManualNext = () => {
    setIsVisible(false)
    setTimeout(() => {
      onNext()
    }, 300)
  }

  const handleSkip = () => {
    setIsVisible(false)
    setTimeout(() => {
      onSkip()
    }, 300)
  }

  // Calculate dialogue bubble position and pointer
  const calculateBubblePosition = useCallback(() => {
    if (!targetRect) return { top: 0, left: 0, pointer: {} }

    const isMobile = window.innerWidth < 768
    const bubbleWidth = isMobile ? Math.min(window.innerWidth * 0.85, 320) : 340
    const bubbleHeight = isMobile ? 200 : 220
    const margin = isMobile ? 20 : 30

    let top = 0
    let left = 0
    let pointerStyle = {}

    // Calculate optimal position for dialogue bubble
    const centerX = targetRect.left + (targetRect.width / 2)
    const centerY = targetRect.top + (targetRect.height / 2)

    // Try positions in order of preference
    const positions = [
      // Above target
      {
        top: targetRect.top - bubbleHeight - margin,
        left: centerX - bubbleWidth / 2,
        pointer: {
          bottom: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '12px solid rgba(255, 255, 255, 0.95)'
        }
      },
      // Below target
      {
        top: targetRect.bottom + margin,
        left: centerX - bubbleWidth / 2,
        pointer: {
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderBottom: '12px solid rgba(255, 255, 255, 0.95)'
        }
      },
      // Right of target
      {
        top: centerY - bubbleHeight / 2,
        left: targetRect.right + margin,
        pointer: {
          left: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '12px solid transparent',
          borderBottom: '12px solid transparent',
          borderRight: '12px solid rgba(255, 255, 255, 0.95)'
        }
      },
      // Left of target
      {
        top: centerY - bubbleHeight / 2,
        left: targetRect.left - bubbleWidth - margin,
        pointer: {
          right: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '12px solid transparent',
          borderBottom: '12px solid transparent',
          borderLeft: '12px solid rgba(255, 255, 255, 0.95)'
        }
      }
    ]

    // Find the best position that fits in viewport
    for (const pos of positions) {
      if (pos.left >= margin &&
          pos.left + bubbleWidth <= window.innerWidth - margin &&
          pos.top >= margin &&
          pos.top + bubbleHeight <= window.innerHeight - margin) {
        top = pos.top
        left = pos.left
        pointerStyle = pos.pointer
        break
      }
    }

    // Fallback to center if no good position found
    if (top === 0 && left === 0) {
      top = (window.innerHeight - bubbleHeight) / 2
      left = (window.innerWidth - bubbleWidth) / 2
      pointerStyle = {}
    }

    return { top, left, width: bubbleWidth, height: bubbleHeight, pointer: pointerStyle }
  }, [targetRect])

  const bubblePosition = calculateBubblePosition()

  if (!step || !targetRect) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Enhanced overlay with radial gradient from target */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            style={{
              background: `radial-gradient(circle at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent 0%, transparent ${Math.max(targetRect.width, targetRect.height) * 0.7}px, rgba(0,0,0,0.65) ${Math.max(targetRect.width, targetRect.height) * 1.3}px)`
            }}
          />

          {/* Enhanced highlight with better coverage */}
          {step.highlight && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="fixed z-45 pointer-events-none"
              style={{
                top: targetRect.top - 16,
                left: targetRect.left - 16,
                width: targetRect.width + 32,
                height: targetRect.height + 32,
              }}
            >
              {/* Main animated border */}
              <motion.div
                className="absolute inset-0 border-4 border-blue-500 rounded-3xl"
                animate={{
                  borderColor: ['#3b82f6', '#06b6d4', '#8b5cf6', '#3b82f6'],
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.9)',
                    '0 0 0 16px rgba(59, 130, 246, 0)',
                    '0 0 0 0 rgba(59, 130, 246, 0)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Inner pulsing layer */}
              <motion.div
                className="absolute inset-2 bg-blue-500/25 rounded-2xl blur-sm"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Sparkle effects at corners */}
              {[
                { top: -6, left: -6, delay: 0 },
                { top: -6, right: -6, delay: 0.5 },
                { bottom: -6, left: -6, delay: 1 },
                { bottom: -6, right: -6, delay: 1.5 }
              ].map((position, index) => (
                <motion.div
                  key={index}
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                  style={position}
                  animate={{
                    scale: [0.7, 1.3, 0.7],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: position.delay
                  }}
                />
              ))}

              {/* Central pulsing indicator */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Dialogue bubble modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="fixed z-50"
            style={{
              top: bubblePosition.top,
              left: bubblePosition.left,
              width: bubblePosition.width,
              height: bubblePosition.height
            }}
          >
            {/* Dialogue bubble container */}
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              {/* Pointer */}
              <div
                className="absolute w-0 h-0 z-10"
                style={bubblePosition.pointer}
              />

              {/* Header with character-like avatar */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 p-5 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{step.title}</h3>
                      <p className="text-blue-100 text-sm opacity-90">
                        Étape {currentStep + 1} sur {steps.length}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleSkip}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                {/* Progress bar */}
                <div className="relative mt-4 bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Content area */}
              <div className="p-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-base leading-relaxed font-medium">
                    {step.description}
                  </p>

                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 shadow-sm"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                        animate={{
                          rotate: [0, 8, -8, 0],
                          scale: [1, 1.08, 1]
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      >
                        💡
                      </motion.div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Footer with auto-progression */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={handleSkip}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 hover:underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Passer l&apos;onboarding
                  </motion.button>

                  <div className="flex items-center gap-4">
                    {/* Step indicators */}
                    <div className="flex gap-1.5">
                      {steps.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            index === currentStep
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125'
                              : index < currentStep
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          animate={index === currentStep ? {
                            boxShadow: [
                              '0 0 0 0 rgba(59, 130, 246, 0.8)',
                              '0 0 0 5px rgba(59, 130, 246, 0)',
                              '0 0 0 0 rgba(59, 130, 246, 0)'
                            ]
                          } : {}}
                          transition={{ duration: 1.8, repeat: index === currentStep ? Infinity : 0 }}
                        />
                      ))}
                    </div>

                    {currentStep < steps.length - 1 ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                        <span>Auto-progression dans</span>
                        <motion.div
                          className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="text-white text-xs font-bold">6</span>
                        </motion.div>
                      </div>
                    ) : (
                      <motion.button
                        onClick={handleManualNext}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-sm"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Terminer
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}