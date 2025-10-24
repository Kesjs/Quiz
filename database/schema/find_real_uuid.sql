-- Trouver le VRAI UUID de l'utilisateur connecté
-- Utilisez cet email pour identifier le bon compte

SELECT
    id as real_user_uuid,
    email,
    created_at,
    last_sign_in_at,
    'UUID à utiliser: ' || id as copy_this_uuid
FROM auth.users
WHERE email = 'kenkenbabatounde@gmail.com'
ORDER BY created_at DESC;

-- Alternative: voir tous les utilisateurs récents
SELECT
    id,
    email,
    created_at,
    'Copiez cet ID si c''est votre compte: ' || id as instruction
FROM auth.users
ORDER BY created_at DESC
LIMIT 3;
