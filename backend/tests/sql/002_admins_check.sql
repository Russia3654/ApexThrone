-- Checks for 002_admins.sql.
-- Run in phpMyAdmin: select the database "apexthrone", open the SQL tab, paste, Go.
-- Test rows are rolled back at the end. Every row of the final table must say PASS.

DROP TEMPORARY TABLE IF EXISTS check_results;
CREATE TEMPORARY TABLE check_results (
  name   VARCHAR(80) NOT NULL,
  result VARCHAR(4)  NOT NULL
) ENGINE=MEMORY; -- not transactional, so ROLLBACK cannot erase the results

START TRANSACTION;

-- 1. An admin row is stamped with created_at by the database.
INSERT INTO admins (first_name, last_name, email, username, password)
VALUES ('Check', 'Admin', 'check@example.test', 'check_admin', 'not-a-real-hash');
SET @admin = LAST_INSERT_ID();
INSERT INTO check_results
SELECT 'admins.created_at is filled automatically',
       IF(created_at IS NOT NULL, 'PASS', 'FAIL')
FROM admins WHERE ID = @admin;

-- 2. updated_at moves by itself on UPDATE.
DO SLEEP(1);
UPDATE admins SET first_name = 'Check2' WHERE ID = @admin;
INSERT INTO check_results
SELECT 'admins.updated_at changes on UPDATE',
       IF(updated_at > created_at, 'PASS', 'FAIL')
FROM admins WHERE ID = @admin;

-- 3. A login attempt without attempted_at is stamped by the database.
INSERT INTO login_attempts (identifier, ip_address) VALUES ('nobody', '127.0.0.1');
SET @attempt = LAST_INSERT_ID();
INSERT INTO check_results
SELECT 'login_attempts.attempted_at is filled automatically',
       IF(attempted_at IS NOT NULL, 'PASS', 'FAIL')
FROM login_attempts WHERE ID = @attempt;

-- 4. An attempt for a username that does not exist is accepted (no foreign key).
INSERT INTO check_results
SELECT 'attempt for an unknown username is stored',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM login_attempts WHERE identifier = 'nobody' AND ID = @attempt;

ROLLBACK;

-- 5. Structure checks (read the catalog, change nothing).
INSERT INTO check_results
SELECT 'admins.email is unique',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'
  AND COLUMN_NAME = 'email' AND NON_UNIQUE = 0;

INSERT INTO check_results
SELECT 'admins.username is unique',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'
  AND COLUMN_NAME = 'username' AND NON_UNIQUE = 0;

INSERT INTO check_results
SELECT 'admins.password holds at least 255 characters',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'
  AND COLUMN_NAME = 'password' AND CHARACTER_MAXIMUM_LENGTH >= 255;

INSERT INTO check_results
SELECT 'login_attempts index is (identifier, attempted_at) in that order',
       IF(SUM(COLUMN_NAME = 'identifier' AND SEQ_IN_INDEX = 1) = 1
          AND SUM(COLUMN_NAME = 'attempted_at' AND SEQ_IN_INDEX = 2) = 1, 'PASS', 'FAIL')
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'login_attempts'
  AND INDEX_NAME = 'idx_login_attempts_lookup';

INSERT INTO check_results
SELECT 'login_attempts has no foreign key',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'login_attempts';

SELECT * FROM check_results;
