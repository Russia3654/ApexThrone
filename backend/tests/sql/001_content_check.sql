-- Checks for 001_content.sql.
-- Run in phpMyAdmin: select the database "apexthrone", open the SQL tab, paste, Go.
-- Test rows are rolled back at the end. Every row of the final table must say PASS.

DROP TEMPORARY TABLE IF EXISTS check_results;
CREATE TEMPORARY TABLE check_results (
  name   VARCHAR(80) NOT NULL,
  result VARCHAR(4)  NOT NULL
) ENGINE=MEMORY; -- not transactional, so ROLLBACK cannot erase the results

START TRANSACTION;

-- 1. A page with only the required fields gets the right defaults.
INSERT INTO pages (menu_name, slug) VALUES ('Check page', 'check-page');
SET @page = LAST_INSERT_ID();
INSERT INTO check_results
SELECT 'pages defaults: position 1, visible 0, draft, max_element 10',
       IF(`position` = 1 AND visible = 0 AND `status` = 'draft' AND max_element = 10, 'PASS', 'FAIL')
FROM pages WHERE ID = @page;

-- 2. updated_at moves by itself on UPDATE.
DO SLEEP(1);
UPDATE pages SET menu_name = 'Check page 2' WHERE ID = @page;
INSERT INTO check_results
SELECT 'pages.updated_at changes on UPDATE',
       IF(updated_at > created_at, 'PASS', 'FAIL')
FROM pages WHERE ID = @page;

-- 3. A subject can exist without an image and gets the right defaults.
INSERT INTO subjects (page_ID, menu_name, content) VALUES (@page, 'Check subject', 'text');
SET @subject = LAST_INSERT_ID();
INSERT INTO check_results
SELECT 'subjects defaults: image_ID NULL, visible 0, draft',
       IF(image_ID IS NULL AND visible = 0 AND `status` = 'draft', 'PASS', 'FAIL')
FROM subjects WHERE ID = @subject;

-- 4. Deleting an image keeps the subject and sets image_ID to NULL.
INSERT INTO images (stored_name, mime_type, size_bytes) VALUES ('check-image.png', 'image/png', 1);
SET @image = LAST_INSERT_ID();
UPDATE subjects SET image_ID = @image WHERE ID = @subject;
DELETE FROM images WHERE ID = @image;
INSERT INTO check_results
SELECT 'deleting an image keeps the subject and clears image_ID',
       IF(COUNT(*) = 1 AND MAX(image_ID) IS NULL, 'PASS', 'FAIL')
FROM subjects WHERE ID = @subject;

-- 5. Deleting a page deletes its subjects.
DELETE FROM pages WHERE ID = @page;
INSERT INTO check_results
SELECT 'deleting a page deletes its subjects',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM subjects WHERE page_ID = @page;

ROLLBACK;

-- 6. Structure checks (read the catalog, change nothing).
INSERT INTO check_results
SELECT 'fk_subjects_page is ON DELETE CASCADE',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND CONSTRAINT_NAME = 'fk_subjects_page' AND DELETE_RULE = 'CASCADE';

INSERT INTO check_results
SELECT 'fk_subjects_image is ON DELETE SET NULL',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND CONSTRAINT_NAME = 'fk_subjects_image' AND DELETE_RULE = 'SET NULL';

INSERT INTO check_results
SELECT 'pages.slug is unique',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pages'
  AND COLUMN_NAME = 'slug' AND NON_UNIQUE = 0;

INSERT INTO check_results
SELECT 'images.stored_name is unique',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'images'
  AND COLUMN_NAME = 'stored_name' AND NON_UNIQUE = 0;

INSERT INTO check_results
SELECT 'subjects.page_ID has the same type as pages.ID',
       IF(COUNT(*) = 2 AND COUNT(DISTINCT COLUMN_TYPE) = 1, 'PASS', 'FAIL')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ((TABLE_NAME = 'pages' AND COLUMN_NAME = 'ID')
    OR (TABLE_NAME = 'subjects' AND COLUMN_NAME = 'page_ID'));

INSERT INTO check_results
SELECT 'subjects.image_ID has the same type as images.ID',
       IF(COUNT(*) = 2 AND COUNT(DISTINCT COLUMN_TYPE) = 1, 'PASS', 'FAIL')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ((TABLE_NAME = 'images' AND COLUMN_NAME = 'ID')
    OR (TABLE_NAME = 'subjects' AND COLUMN_NAME = 'image_ID'));

INSERT INTO check_results
SELECT 'subjects.image_ID allows NULL, page_ID does not',
       IF(SUM(COLUMN_NAME = 'image_ID' AND IS_NULLABLE = 'YES') = 1
          AND SUM(COLUMN_NAME = 'page_ID' AND IS_NULLABLE = 'NO') = 1, 'PASS', 'FAIL')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subjects';

SELECT * FROM check_results;
