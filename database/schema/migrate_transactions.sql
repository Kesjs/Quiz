-- Migration des transactions vers le bon utilisateur
-- De l'ancien UUID vers le nouveau

DO $$
DECLARE
    old_user_uuid UUID := 'c1191565-1929-4b47-9ff3-3fcc24bf567b';
    new_user_uuid UUID := 'c1191565-1929-4b47-9ff3-3fcc24bf567b';
BEGIN
    -- Vérifier que l'ancien utilisateur a des transactions
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE user_id = old_user_uuid) THEN
        RAISE EXCEPTION 'Aucune transaction trouvée pour l''ancien utilisateur %', old_user_uuid;
    END IF;

    -- Vérifier que le nouvel utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = new_user_uuid) THEN
        RAISE EXCEPTION 'Le nouvel utilisateur % n''existe pas dans auth.users', new_user_uuid;
    END IF;

    -- Migrer les transactions
    UPDATE transactions
    SET user_id = new_user_uuid
    WHERE user_id = old_user_uuid;

    RAISE NOTICE 'Migration terminée : % transactions migrées de % vers %',
        (SELECT COUNT(*) FROM transactions WHERE user_id = new_user_uuid),
        old_user_uuid,
        new_user_uuid;
END $$;

-- Vérifier la migration
SELECT
    user_id,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b'
GROUP BY user_id;

-- Voir les transactions migrées
SELECT created_at, type, amount, description, status
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b'
ORDER BY created_at DESC;
