-- Script pour trouver l'UUID d'un utilisateur existant
-- Exécutez ceci pour voir les utilisateurs disponibles

-- Voir tous les utilisateurs
SELECT
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Ou juste voir les IDs pour copier-coller
SELECT
    id as user_uuid,
    email,
    'Copiez cet UUID: ' || id as instruction
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
