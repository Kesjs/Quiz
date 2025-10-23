'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: user?.email || 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la Paix, 75001 Paris',
    bio: 'Investisseur passionné par l\'énergie renouvelable et le secteur du GNL.'
  });

  // Rediriger si non connecté
  useState(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, on ferait l'appel API pour mettre à jour le profil
    setIsEditing(false);
    // Simulation de succès
    console.log('Profil mis à jour:', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? 'Annuler' : 'Modifier le profil'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations générales */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Vos informations de base et coordonnées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative mt-1">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative mt-1">
                    <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Vos dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Souscription Premium Pack
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Il y a 2 jours
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CurrencyEuroIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Dépôt de 5000€
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Il y a 5 jours
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec stats */}
        <div className="space-y-6">
          {/* Avatar et statut */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {formData.firstName[0]}{formData.lastName[0]}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Investisseur Premium
                </p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total investi</span>
                <span className="font-semibold text-green-600">15,000 €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Gains totaux</span>
                <span className="font-semibold text-green-600">+2,450 €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Packs actifs</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Membre depuis</span>
                <span className="font-semibold text-sm">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Déc 2023
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Changer le mot de passe
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Activer 2FA
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Supprimer le compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
