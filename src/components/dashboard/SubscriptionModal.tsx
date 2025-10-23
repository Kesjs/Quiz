import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Plan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  daily_profit: number;
  duration_days: number;
  features: string[];
  color: string;
  icon: React.ComponentType<any>;
}

interface SubscriptionModalProps {
  plan: Plan;
  balance: number;
  onConfirm: () => void;
  onClose: () => void;
}

export function SubscriptionModal({ plan, balance, onConfirm, onClose }: SubscriptionModalProps) {
  const totalEarnings = (plan.min_amount * plan.daily_profit * plan.duration_days) / 100;
  const finalAmount = plan.min_amount + totalEarnings;

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
            <CardTitle className="text-xl">Souscrire à {plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Détails du pack */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <CurrencyEuroIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Investissement</p>
                    <p className="font-semibold">{plan.min_amount.toLocaleString()} €</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Rendement/jour</p>
                    <p className="font-semibold text-green-600">{plan.daily_profit}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Durée</p>
                    <p className="font-semibold">{plan.duration_days} jours</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Gain total estimé</p>
                    <p className="font-semibold text-green-600">+{totalEarnings.toLocaleString()} €</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Montant final estimé :</span>
                  <span className="text-blue-600">{finalAmount.toLocaleString()} €</span>
                </div>
              </div>
            </div>

            {/* Solde actuel */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Votre solde actuel :</span>
                <span className="font-semibold text-blue-600">{balance.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Solde après souscription :</span>
                <span className={`font-semibold ${balance - plan.min_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(balance - plan.min_amount).toLocaleString()} €
                </span>
              </div>
            </div>

            {/* Avantages */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Avantages inclus :</h4>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={onConfirm}
                disabled={balance < plan.min_amount}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Confirmer la souscription
              </Button>
            </div>

            {balance < plan.min_amount && (
              <p className="text-sm text-red-600 text-center">
                Solde insuffisant. Veuillez effectuer un dépôt préalable.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
