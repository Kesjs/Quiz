-- Test rapide avec votre UUID utilisateur
-- kenkenbabatounde@gmail.com
-- UUID RÉEL dans Supabase: c1191565-1929-4b47-9ff3-3fcc24bf567b

SELECT COUNT(*) as user_transaction_count
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b';

-- Voir les transactions de cet utilisateur
SELECT id, type, amount, description, created_at, status
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b'
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier si la table transactions existe
SELECT table_name FROM information_schema.tables
WHERE table_name = 'transactions';

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'transactions';
