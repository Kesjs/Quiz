import { motion } from 'framer-motion'
import { Shield, Loader2, CheckCircle, XCircle } from 'lucide-react'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'error'

interface AuthLoaderProps {
  status: AuthStatus
  progress: number
  title?: string
  description?: string
}

export function AuthLoader({
  status,
  progress,
  title,
  description
}: AuthLoaderProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />,
          defaultTitle: 'Vérification en cours',
          defaultDescription: 'Nous vérifions votre authentification...',
          bgColor: 'from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-500/30'
        }
      case 'authenticated':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          defaultTitle: 'Authentification réussie',
          defaultDescription: 'Accès autorisé',
          bgColor: 'from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/30'
        }
      case 'unauthenticated':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          defaultTitle: 'Authentification requise',
          defaultDescription: 'Redirection vers la page de connexion...',
          bgColor: 'from-red-500/20 to-pink-500/20',
          borderColor: 'border-red-500/30'
        }
      case 'error':
        return {
          icon: <XCircle className="w-12 h-12 text-orange-500" />,
          defaultTitle: 'Erreur d\'authentification',
          defaultDescription: 'Une erreur est survenue',
          bgColor: 'from-orange-500/20 to-red-500/20',
          borderColor: 'border-orange-500/30'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const displayTitle = title || statusConfig.defaultTitle
  const displayDescription = description || statusConfig.defaultDescription

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-gray-800/50 backdrop-blur-xl rounded-2xl border-2 ${statusConfig.borderColor} p-8 max-w-sm w-full text-center shadow-2xl shadow-black/50`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.bgColor} rounded-2xl opacity-50 blur-xl`} />

      <div className="relative z-10">
        {/* Security shield background */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Main content */}
        <div className="mt-8">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {statusConfig.icon}

            <h2 className="text-xl font-bold text-white mt-4 mb-2">
              {displayTitle}
            </h2>

            <p className="text-gray-300 text-sm mb-6">
              {displayDescription}
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Progress percentage */}
          <div className="text-xs text-gray-400">
            {progress}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}
