-- Script alternatif si la table existe déjà
-- Vérifier la structure actuelle de la table

-- 1. Voir les colonnes existantes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- 2. Si la table a une structure différente, utiliser ALTER TABLE
-- Exemples d'ajustements possibles :

-- Ajouter une colonne manquante
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference TEXT;

-- Modifier le type d'une colonne
-- ALTER TABLE transactions ALTER COLUMN amount TYPE DECIMAL(15,2);

-- Ajouter une contrainte si elle n'existe pas
-- ALTER TABLE transactions ADD CONSTRAINT IF NOT EXISTS check_type
--   CHECK (type IN ('deposit', 'withdrawal', 'profit', 'subscription'));

-- 3. Créer les index s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- 4. Activer RLS et créer les politiques
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;

-- Recréer les politiques
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Créer la fonction et le trigger pour updated_at si nécessaire
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Créer la vue des statistiques si elle n'existe pas
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
  MAX(date) as last_transaction_date
FROM transactions
WHERE status = 'completed'
GROUP BY user_id;
