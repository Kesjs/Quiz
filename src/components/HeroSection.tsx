'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BarChart2, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Arrière-plan avec dégradé et effet de particules */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-black"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <span className="text-blue-400 text-sm font-medium">
              {/* Plateforme d&apos;investissement nouvelle génération */}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
    className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">         
          Investissez dans l&apos;<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">énergie du futur</span>

           
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          >
            Découvrez une nouvelle façon d&apos;investir dans les actifs numériques avec des rendements compétitifs et une sécurité maximale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link 
              href="/auth/signup" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity flex items-center group"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#how-it-works" 
              className="px-8 py-4 bg-transparent text-white border border-gray-700 rounded-full font-medium text-sm hover:bg-gray-800/50 transition-colors"
            >
              En savoir plus
            </Link>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              {
                icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
                title: "Rendements élevés",
                description: "Des opportunités d'investissement à fort potentiel"
              },
              {
                icon: <Shield className="w-6 h-6 text-green-400" />,
                title: "Sécurisé",
                description: "Protection avancée des actifs"
              },
              {
                icon: <Zap className="w-6 h-6 text-yellow-400" />,
                title: "Rapide",
                description: "Transactions instantanées"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Animation de fond */}
      <div className="absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
    </section>
  )
}
