import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowUp
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export default function GlassFooter() {
  const router = useRouter()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateTo = (href: string) => {
    if (href.startsWith('#')) {
      // Pour les ancres, scroll vers l'élément
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Pour les pages, utiliser router.push pour navigation rapide
      router.push(href)
    }
  }

  return (
    <footer className="relative bg-gray-900 from-gray-900 via-black to-gray-900 border-t border-gray-800/50 mt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-purple-900/10"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {/* Company Info */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <h3 className="text-white font-bold text-xl">Gazoduc Invest</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Investissez dans l&apos;énergie de demain avec le Gaz Naturel Liquéfié.
              Des rendements sécurisés pour votre avenir financier.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm">contact@gazoducinvest.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-sm">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Paris, France</span>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></div>
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil', icon: '🏠' },
                { href: '#about', label: 'À propos', icon: 'ℹ️' },
                { href: '#plans', label: 'Nos offres', icon: '📊' },
                { href: '/dashboard', label: 'Dashboard', icon: '📈' }
              ].map((item, index) => (
                <motion.li
                  key={item.href}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => navigateTo(item.href)}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group w-full text-left"
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="group-hover:text-blue-400 transition-colors duration-200">
                      {item.label}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/support', label: 'Centre d\'aide', icon: '🆘' },
                { href: '/faq', label: 'FAQ', icon: '❓' },
                { href: '/contact', label: 'Contact', icon: '📞' },
                { href: '/politique-confidentialite', label: 'Confidentialité', icon: '🔒' }
              ].map((item, index) => (
                <motion.li
                  key={item.href}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => navigateTo(item.href)}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group w-full text-left"
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="group-hover:text-green-400 transition-colors duration-200">
                      {item.label}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social & Newsletter */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
              Suivez-nous
            </h4>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4 mb-6">
              {[
                { href: 'https://facebook.com/gazoducinvest', icon: Facebook, label: 'Facebook', color: 'hover:text-blue-400' },
                { href: 'https://twitter.com/gazoducinvest', icon: Twitter, label: 'Twitter', color: 'hover:text-sky-400' },
                { href: 'https://linkedin.com/company/gazoducinvest', icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-500' },
                { href: 'https://instagram.com/gazoducinvest', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400' }
              ].map((social, index) => (
                <motion.a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-all duration-300 p-2 rounded-lg hover:bg-white/10 group`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-t border-gray-800/50 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© 2025 Gazoduc Invest.</span>
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.div>
              <span>in Paris</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <button
                onClick={() => navigateTo('/terms')}
                className="hover:text-white transition-colors duration-200"
              >
                Conditions
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => navigateTo('/privacy')}
                className="hover:text-white transition-colors duration-200"
              >
                Vie privée
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => navigateTo('/cookies')}
                className="hover:text-white transition-colors duration-200"
              >
                Cookies
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
