-- Script d'insertion de données de test pour la table transactions
-- À exécuter APRÈS avoir créé la table

-- IMPORTANT: Remplacez 'YOUR_USER_UUID_HERE' par l'UUID réel de votre utilisateur
-- Vous pouvez le trouver dans Supabase Auth -> Users

-- Définir l'UUID de l'utilisateur (À MODIFIER !)
-- Remplacez cette valeur par votre UUID d'utilisateur réel
-- SELECT id FROM auth.users LIMIT 1; -- Pour voir un UUID existant

DO $$
DECLARE
    user_uuid UUID := 'YOUR_USER_UUID_HERE'; -- REMPLACEZ CETTE VALEUR !
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_uuid) THEN
        RAISE EXCEPTION 'Utilisateur UUID % n''existe pas dans auth.users. Remplacez YOUR_USER_UUID_HERE par un UUID valide.', user_uuid;
    END IF;

    -- Insérer des données de test
    INSERT INTO transactions (user_id, type, amount, description, created_at, status, reference) VALUES
    -- Dépôts
    (user_uuid, 'deposit', 5000.00, 'Dépôt bancaire initial', '2023-11-15T14:30:00Z', 'completed', NULL),
    (user_uuid, 'deposit', 2500.00, 'Dépôt complémentaire', '2023-11-12T13:15:00Z', 'completed', NULL),
    (user_uuid, 'deposit', 10000.00, 'Dépôt initial', '2023-11-09T12:00:00Z', 'completed', NULL),

    -- Profits/Gains
    (user_uuid, 'profit', 75.50, 'Gains quotidiens - Premium Pack', '2023-11-15T09:00:00Z', 'completed', 'premium-001'),
    (user_uuid, 'profit', 45.25, 'Gains quotidiens - Starter Pack', '2023-11-14T09:00:00Z', 'completed', 'starter-001'),
    (user_uuid, 'profit', 62.80, 'Gains quotidiens - Premium Pack', '2023-11-13T09:00:00Z', 'completed', 'premium-001'),
    (user_uuid, 'profit', 50.75, 'Gains quotidiens - Premium Pack', '2023-11-11T09:00:00Z', 'completed', 'premium-001'),
    (user_uuid, 'profit', 25.00, 'Gains quotidiens - Starter Pack', '2023-11-12T09:00:00Z', 'completed', 'starter-001'),

    -- Souscriptions (montants négatifs)
    (user_uuid, 'subscription', -10000.00, 'Souscription Premium Pack', '2023-11-14T16:45:00Z', 'completed', 'premium-001'),
    (user_uuid, 'subscription', -5000.00, 'Souscription Starter Pack', '2023-11-10T10:30:00Z', 'completed', 'starter-001'),

    -- Retraits
    (user_uuid, 'withdrawal', -1500.00, 'Retrait vers compte bancaire', '2023-11-13T11:20:00Z', 'completed', NULL),
    (user_uuid, 'withdrawal', -800.00, 'Retrait partiel', '2023-11-11T15:45:00Z', 'pending', NULL);

    RAISE NOTICE 'Données de test insérées avec succès pour l''utilisateur %', user_uuid;
END $$;

-- Vérifier que les données ont été insérées
SELECT
  type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM transactions
WHERE user_id = 'YOUR_USER_UUID_HERE' -- REMPLACEZ AUSSI ICI
GROUP BY type
ORDER BY type;
