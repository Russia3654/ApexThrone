-- Checks for 003_page_parents.sql and the core pages in seed.sql.
-- Run in phpMyAdmin: select the database "apexthrone", open the SQL tab, paste, Go.
-- Test rows are rolled back at the end. Every row of the final table must say PASS.
-- The two IGNORE statements are meant to be refused by the database: warnings are expected.

DROP TEMPORARY TABLE IF EXISTS check_results;
CREATE TEMPORARY TABLE check_results (
  name   VARCHAR(80) NOT NULL,
  result VARCHAR(4)  NOT NULL
) ENGINE=MEMORY; -- not transactional, so ROLLBACK cannot erase the results

START TRANSACTION;

-- 1. A page created without a parent is a core page.
INSERT INTO pages (menu_name, slug) VALUES ('Check parent', 'check-parent');
SET @parent = LAST_INSERT_ID();
INSERT INTO check_results
SELECT 'a page without a parent gets parent_ID NULL',
       IF(parent_ID IS NULL, 'PASS', 'FAIL')
FROM pages WHERE ID = @parent;

-- 2. A page can be placed under another page.
INSERT INTO pages (parent_ID, menu_name, slug) VALUES (@parent, 'Check child', 'check-child');
SET @child = LAST_INSERT_ID();
INSERT INTO check_results
SELECT 'a subpage keeps its parent_ID',
       IF(parent_ID = @parent, 'PASS', 'FAIL')
FROM pages WHERE ID = @child;

-- 3. A parent that does not exist is refused.
INSERT IGNORE INTO pages (parent_ID, menu_name, slug) VALUES (4294967295, 'Check orphan', 'check-orphan');
INSERT INTO check_results
SELECT 'a parent that does not exist is refused',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM pages WHERE slug = 'check-orphan';

-- 4. A page that still has subpages cannot be deleted.
DELETE IGNORE FROM pages WHERE ID = @parent;
INSERT INTO check_results
SELECT 'a page with subpages cannot be deleted',
       IF((SELECT COUNT(*) FROM pages WHERE ID IN (@parent, @child)) = 2, 'PASS', 'FAIL');

-- 5. Once the subpage is gone, the parent can be deleted.
DELETE FROM pages WHERE ID = @child;
DELETE FROM pages WHERE ID = @parent;
INSERT INTO check_results
SELECT 'child first, then parent, can be deleted',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM pages WHERE ID IN (@parent, @child);

ROLLBACK;

-- 6. Structure checks (read the catalog, change nothing).
INSERT INTO check_results
SELECT 'parent_ID has the same type as ID',
       IF(COUNT(*) = 2 AND COUNT(DISTINCT COLUMN_TYPE) = 1, 'PASS', 'FAIL')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pages'
  AND COLUMN_NAME IN ('ID', 'parent_ID');

INSERT INTO check_results
SELECT 'fk_pages_parent points from parent_ID to pages.ID',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pages'
  AND CONSTRAINT_NAME = 'fk_pages_parent' AND COLUMN_NAME = 'parent_ID'
  AND REFERENCED_TABLE_NAME = 'pages' AND REFERENCED_COLUMN_NAME = 'ID';

-- 7. The core pages from seed.sql.
INSERT INTO check_results
SELECT 'core pages rules, about, contact: no parent, visible, published',
       IF(COUNT(*) = 3, 'PASS', 'FAIL')
FROM pages
WHERE slug IN ('rules', 'about', 'contact')
  AND parent_ID IS NULL AND visible = 1 AND `status` = 'published';

INSERT INTO check_results
SELECT 'every core page name fits in 20 characters',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM pages
WHERE parent_ID IS NULL AND CHAR_LENGTH(menu_name) > 20;

SELECT * FROM check_results;
