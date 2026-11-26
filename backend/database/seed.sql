-- Admin record
INSERT INTO admins (first_name, last_name, email, username, password)
VALUES ('russia', '3654', 'Russia@example.test', 'admin', '$2y$10$qwPov1..X.folnSWjJy4ReRWsDEfmgNqe.QD64UwpwtIIVJprhq3O');

-- Core pages record
INSERT INTO pages (menu_name, slug, `position`, visible, status)
VALUES 
    ('Rules & FAQ', 'rules', 1, 1, 'published'),
    ('About', 'about', 2, 1, 'published'),
    ('Contact Us', 'contact', 3, 1, 'published');
