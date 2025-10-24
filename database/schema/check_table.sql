-- Script pour vérifier la structure de la table transactions
-- Exécutez ceci dans Supabase SQL Editor

-- Voir toutes les colonnes de la table transactions
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Voir quelques exemples de données (si elles existent)
SELECT * FROM transactions LIMIT 5;

-- Vérifier que la table existe
SELECT table_name FROM information_schema.tables
WHERE table_name = 'transactions';
