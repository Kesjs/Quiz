-- SOLUTION TEMPORAIRE : Désactiver RLS pour test
-- ATTENTION: À utiliser seulement pour diagnostic !

-- Désactiver RLS temporairement
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Vérifier que c'est désactivé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'transactions';

-- Maintenant testez sur le site - vous devriez voir les 10 transactions

-- APRÈS TEST, RÉACTIVER RLS :
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
