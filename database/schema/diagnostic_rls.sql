-- DIAGNOSTIC COMPLET DES POLITIQUES RLS
-- Exécutez ceci pour voir exactement ce qui bloque

-- 1. État actuel des politiques RLS pour transactions
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'transactions'
ORDER BY policyname;

-- 2. Vérifier si RLS est activé sur la table
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    rowsecurity as rls_status
FROM pg_tables
WHERE tablename = 'transactions';

-- 3. Test direct avec votre UUID (devrait retourner 10)
SELECT COUNT(*) as total_transactions_in_db
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b';

-- 4. Vérifier la fonction auth.uid() (peut être NULL si pas authentifié)
SELECT
    auth.uid() as current_user_id,
    CASE
        WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ'
        ELSE 'NON AUTHENTIFIÉ'
    END as auth_status;

-- 5. Test de la politique RLS (simule ce que fait Supabase)
SELECT
    t.id,
    t.user_id,
    t.type,
    t.amount,
    t.description,
    CASE
        WHEN auth.uid() = t.user_id THEN 'ACCESSIBLE'
        WHEN auth.uid() IS NULL THEN 'NON_AUTH'
        ELSE 'BLOQUÉ'
    END as access_status
FROM transactions t
WHERE t.user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b'
ORDER BY t.created_at DESC
LIMIT 5;

-- 6. Désactiver temporairement RLS pour test (ATTENTION: dangereux en prod!)
-- NE PAS exécuter en production, seulement pour diagnostic
-- ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
-- Puis re-tester la requête
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY; -- Réactiver après
