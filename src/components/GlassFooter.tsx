import Link from 'next/link'

export default function GlassFooter() {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Gazoduc Invest</h3>
            <p className="text-white/80">
              Investissez dans l&apos;énergie de demain avec le Gaz Naturel Liquéfié.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-white/80 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="#about" className="text-white/80 hover:text-white transition-colors">À propos</Link></li>
              <li><Link href="#plans" className="text-white/80 hover:text-white transition-colors">Plans</Link></li>
              <li><Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/support" className="text-white/80 hover:text-white transition-colors">Centre d&#39;Aide</Link></li>
              <li><Link href="/faq" className="text-white/80 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/support" className="text-white/80 hover:text-white transition-colors">Support</Link></li>
              <li><Link href="/politique-confidentialite" className="text-white/80 hover:text-white transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com/gazoducinvest" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Facebook</a>
              <a href="https://twitter.com/gazoducinvest" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Twitter</a>
              <a href="https://linkedin.com/company/gazoducinvest" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">LinkedIn</a>
              <a href="https://instagram.com/gazoducinvest" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/80">
            © 2025 Gazoduc Invest. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
