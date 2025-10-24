-- Test rapide après correction RLS
-- Votre UUID: c1191565-1929-4b47-9ff3-3fcc24bf567b

-- 1. Vérifier les politiques actuelles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'transactions';

-- 2. Tester l'accès aux données (devrait retourner 10)
SELECT COUNT(*) as accessible_transactions
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b';

-- 3. Voir quelques transactions
SELECT created_at, type, amount, description, status
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b'
ORDER BY created_at DESC
LIMIT 3;
