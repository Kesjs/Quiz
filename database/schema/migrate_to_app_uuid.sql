-- Migrer les transactions vers l'UUID utilisé par l'application
-- De l'ancien UUID vers celui que l'app utilise actuellement

UPDATE transactions
SET user_id = '6ed056f5-43db-48b2-bda1-750a594ac7a9'
WHERE user_id = 'c1191565-1929-4b47-9ff3-3fcc24bf567b';

-- Vérifier la migration
SELECT COUNT(*) as transactions_migrated
FROM transactions
WHERE user_id = '6ed056f5-43db-48b2-bda1-750a594ac7a9';
