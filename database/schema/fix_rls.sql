-- Script pour vérifier et corriger les politiques RLS
-- Exécutez ceci dans Supabase SQL Editor

-- 1. Vérifier les politiques actuelles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'transactions';

-- 2. Supprimer les politiques existantes (si elles existent)
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;

-- 3. Recréer les politiques correctement
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'transactions';

-- 5. Test avec votre utilisateur
SELECT COUNT(*) as user_transaction_count
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b';

-- 6. Vérifier les utilisateurs disponibles
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
