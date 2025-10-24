-- Script complet pour réinitialiser la table transactions
-- À exécuter en une seule fois dans Supabase SQL Editor

-- ===========================================
-- OPTION 3: RECRÉATION COMPLÈTE DE LA TABLE
-- ===========================================

-- 1. Supprimer la table existante (ATTENTION: détruit toutes les données!)
DROP TABLE IF EXISTS transactions CASCADE;

-- 2. Créer la nouvelle table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'profit', 'subscription')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les index
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

-- 4. Activer RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques de sécurité
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Créer la fonction et le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Créer la vue des statistiques
CREATE OR REPLACE VIEW transaction_stats AS
SELECT
  user_id,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE type = 'deposit') as deposit_count,
  COUNT(*) FILTER (WHERE type = 'withdrawal') as withdrawal_count,
  COUNT(*) FILTER (WHERE type = 'profit') as profit_count,
  COUNT(*) FILTER (WHERE type = 'subscription') as subscription_count,
  SUM(amount) FILTER (WHERE amount > 0) as total_credits,
  SUM(ABS(amount)) FILTER (WHERE amount < 0) as total_debits,
  SUM(amount) as balance,
  MAX(created_at) as last_transaction_date
FROM transactions
WHERE status = 'completed'
GROUP BY user_id;

-- 8. Insérer des données de test (OPTIONNEL)
-- Remplacez les gen_random_uuid() par de vrais UUID d'utilisateurs
-- INSERT INTO transactions (user_id, type, amount, description, date, status, reference) VALUES
-- (gen_random_uuid(), 'deposit', 5000.00, 'Dépôt bancaire initial', '2023-11-15T14:30:00Z', 'completed', NULL),
-- (gen_random_uuid(), 'profit', 75.50, 'Gains quotidiens - Premium Pack', '2023-11-15T09:00:00Z', 'completed', 'premium-001');
-- ... autres insertions de test

-- 9. Vérification finale
SELECT 'Table transactions créée avec succès !' as status;
SELECT COUNT(*) as total_transactions FROM transactions;
