# Gestion des Champs dans les Tables avec Supabase

Ce guide explique comment gérer les données dans les tableaux en utilisant Supabase au lieu de données mockées.

## 🚀 Structure Générale

### 1. **États Nécessaires**
```typescript
const [data, setData] = useState<Entity[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### 2. **Fonction de Récupération**
```typescript
const fetchData = useCallback(async () => {
  try {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setData(data || []);
  } catch (err) {
    setError('Erreur de chargement');
    toast.error('Erreur de chargement');
  } finally {
    setIsLoading(false);
  }
}, [user, supabase]);
```

### 3. **Opérations CRUD**

#### **Create (Créer)**
```typescript
const createItem = useCallback(async (itemData) => {
  const { data, error } = await supabase
    .from('table_name')
    .insert([{ user_id: user!.id, ...itemData }])
    .select()
    .single();

  if (error) throw error;
  setData(prev => [data, ...prev]);
}, [user, supabase]);
```

#### **Read (Lire)**
```typescript
const fetchItems = useCallback(async () => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', user!.id);

## 📋 Tables Implémentées

### **✅ Transactions**
- **Statut**: ✅ Implémenté et fonctionnel
- **Champs**: id, user_id, type, amount, description, status, reference, created_at, updated_at
- **Utilisation**: Affichage automatique des vraies transactions (achats, gains, dépôts, retraits)
- **Fonctions**: `transaction-utils.ts` pour créer automatiquement des transactions

### **❌ Rapports** (À implémenter)
- **Champs**: id, user_id, title, description, type, date, size, status, file_url
- **Utilisation**: Génération automatique lors des exports/rapports

### **❌ Parrainages** (À implémenter)
- **Champs**: id, user_id, referral_code, referred_user_id, status, earnings, created_at
- **Utilisation**: Suivi automatique des parrainages et gains

### **❌ Packs** (À implémenter)
- **Champs**: id, user_id, pack_id, status, start_date, end_date, investment_amount
- **Utilisation**: Gestion automatique des investissements actifs

## 🔄 Création Automatique des Transactions

Les transactions sont créées automatiquement via `transaction-utils.ts` :

```typescript
import { createPackPurchaseTransaction } from '@/lib/supabase/transaction-utils';

// Lors de l'achat d'un pack
await createPackPurchaseTransaction(userId, 'Premium Pack', 10000, 'pack-123');
```

### **Types de transactions automatiques :**
- **subscription**: Achats de packs (montant négatif)
- **profit**: Gains quotidiens (montant positif)
- **deposit**: Dépôts bancaires (montant positif)
- **withdrawal**: Retraits (montant négatif)

## 🛠️ Processus d'Implémentation

### 1. **Créer le Schéma SQL**
```sql
CREATE TABLE table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Autres champs...
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Activer RLS**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

### 3. **Créer les Utilitaires**
```typescript
// Dans src/lib/supabase/table-utils.ts
export const createRecord = async (userId, data) => {
  const { data: result, error } = await supabase
    .from('table_name')
    .insert([{ user_id: userId, ...data }])
    .select()
    .single();

  if (error) throw error;
  return result;
};
```

### 4. **Intégrer dans l'Interface**
```typescript
const MyComponent = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Logique de récupération
  }, [user]);

  // ...
};
```

## 🔒 Sécurité

- **RLS activé** sur toutes les tables
- **user_id obligatoire** dans toutes les requêtes
- **Politiques strictes** : chaque utilisateur ne voit que ses données
- **Clés étrangères** pour maintenir l'intégrité

## 📊 Vues et Statistiques

```sql
-- Vue pour les statistiques
CREATE VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) as total_transactions,
  SUM(amount) as balance,
  MAX(created_at) as last_activity
FROM transactions
WHERE status = 'completed'
GROUP BY user_id;
```

## 🎯 Bonnes Pratiques

1. **Création automatique** : Les transactions se créent seules lors des actions
2. **Pas d'ajout manuel** : L'utilisateur ne peut pas inventer des transactions
3. **Filtrage par user_id** : Sécurité maximale
4. **Tri par created_at DESC** : Les plus récentes en premier
5. **Gestion d'erreurs** : Toujours try/catch avec feedback utilisateur

## 🚀 Prochaines Étapes

1. **Implémenter** les transactions automatiques dans les packs
2. **Créer** le système de gains quotidiens avec transactions
3. **Ajouter** les vues rapports et parrainages
4. **Développer** les statistiques utilisateur
