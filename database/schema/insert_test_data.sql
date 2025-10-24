-- Script d'insertion de données de test pour l'utilisateur kenkenbabatounde@gmail.com
-- UUID RÉEL dans Supabase: c1191565-1929-4b47-9ff3-3fcc24bf567b

DO $$
DECLARE
    user_uuid UUID := 'c1191565-1929-4b47-9ff3-3fcc24bf567b';
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_uuid) THEN
        RAISE EXCEPTION 'Utilisateur UUID % n''existe pas dans auth.users', user_uuid;
    END IF;

    -- Supprimer les anciennes données de test pour cet utilisateur
    DELETE FROM transactions WHERE user_id = user_uuid;

    -- Insérer des données de test
    INSERT INTO transactions (user_id, type, amount, description, created_at, status, reference) VALUES
    -- Dépôts
    (user_uuid, 'deposit', 5000.00, 'Dépôt bancaire initial', '2024-10-20T10:00:00Z', 'completed', NULL),
    (user_uuid, 'deposit', 2500.00, 'Dépôt complémentaire', '2024-10-18T14:30:00Z', 'completed', NULL),

    -- Souscriptions (négatives)
    (user_uuid, 'subscription', -10000.00, 'Souscription Premium Pack', '2024-10-19T09:15:00Z', 'completed', 'premium-001'),
    (user_uuid, 'subscription', -5000.00, 'Souscription Starter Pack', '2024-10-15T11:45:00Z', 'completed', 'starter-001'),

    -- Gains quotidiens (positives)
    (user_uuid, 'profit', 75.50, 'Gains quotidiens - Premium Pack', '2024-10-20T06:00:00Z', 'completed', 'premium-001'),
    (user_uuid, 'profit', 45.25, 'Gains quotidiens - Starter Pack', '2024-10-19T06:00:00Z', 'completed', 'starter-001'),
    (user_uuid, 'profit', 62.80, 'Gains quotidiens - Premium Pack', '2024-10-18T06:00:00Z', 'completed', 'premium-001'),
    (user_uuid, 'profit', 25.00, 'Gains quotidiens - Starter Pack', '2024-10-17T06:00:00Z', 'completed', 'starter-001'),

    -- Retraits (négatives)
    (user_uuid, 'withdrawal', -1500.00, 'Retrait vers compte bancaire', '2024-10-16T16:20:00Z', 'completed', NULL),
    (user_uuid, 'withdrawal', -800.00, 'Retrait partiel', '2024-10-14T15:45:00Z', 'pending', NULL);

    RAISE NOTICE 'Données de test insérées avec succès pour l''utilisateur %', user_uuid;
END $$;

-- Vérifier que les données ont été insérées
SELECT
  type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b'
GROUP BY type
ORDER BY type;

-- Voir toutes les transactions de l'utilisateur
SELECT
  created_at,
  type,
  amount,
  description,
  status,
  reference
FROM transactions
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b'
ORDER BY created_at DESC;
