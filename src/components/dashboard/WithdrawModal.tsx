import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XMarkIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';

interface WithdrawModalProps {
  balance: number;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

export function WithdrawModal({ balance, onConfirm, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const maxWithdrawable = Math.max(0, balance - 100); // Garder au moins 100€

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      alert('Veuillez saisir un montant valide');
      return;
    }

    if (numAmount > maxWithdrawable) {
      alert(`Le montant maximum de retrait est de ${maxWithdrawable.toLocaleString()} €`);
      return;
    }

    if (numAmount < 50) {
      alert('Le montant minimum de retrait est de 50 €');
      return;
    }

    setLoading(true);

    // Simuler un appel API et traitement
    await new Promise(resolve => setTimeout(resolve, 1500));

    onConfirm(numAmount);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <CardTitle className="text-xl flex items-center">
              <ArrowDownCircleIcon className="h-6 w-6 mr-2 text-red-500" />
              Effectuer un retrait
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Solde disponible */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Solde disponible :</span>
                  <span className="font-semibold">{balance.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Montant max. de retrait :</span>
                  <span className="font-semibold text-blue-600">{maxWithdrawable.toLocaleString()} €</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Un minimum de 100 € doit être maintenu sur votre compte.
                </p>
              </div>

              {/* Montant du retrait */}
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Montant du retrait (€) :
                </label>
                <input
                  id="amount"
                  type="number"
                  min="50"
                  max={maxWithdrawable}
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Entrez le montant"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  required
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Minimum : 50 €</span>
                  <span>Maximum : {maxWithdrawable.toLocaleString()} €</span>
                </div>
              </div>

              {/* Aperçu */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Solde après retrait :</span>
                    <span className={`font-semibold ${balance - parseFloat(amount) >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {(balance - parseFloat(amount)).toLocaleString()} €
                    </span>
                  </div>
                  {balance - parseFloat(amount) < 100 && (
                    <p className="text-xs text-red-600 mt-2">
                      ⚠️ Attention : Votre solde sera inférieur au minimum requis de 100 €.
                    </p>
                  )}
                </div>
              )}

              {/* Informations importantes */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Informations importantes
                    </p>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                      <li>• Les retraits sont traités sous 24-48h</li>
                      <li>• Frais de traitement : 2.5€ (gratuit au-dessus de 500€)</li>
                      <li>• Vérification d&apos;identité requise pour les gros montants</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !amount || parseFloat(amount) < 50 || parseFloat(amount) > maxWithdrawable}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Traitement...' : 'Retirer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
