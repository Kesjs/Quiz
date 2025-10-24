-- Script SQL pour créer la table transactions dans Supabase
-- OPTION 3: Suppression et recréation complète (ATTENTION: détruit toutes les données!)

-- Supprimer la table existante
DROP TABLE IF EXISTS transactions CASCADE;

-- Création de la table transactions
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

-- Index pour améliorer les performances
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Politiques RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent créer leurs propres transactions
CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leurs propres transactions
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vue pour les statistiques des transactions par utilisateur
CREATE VIEW transaction_stats AS
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
