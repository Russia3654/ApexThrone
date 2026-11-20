DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS images;

CREATE TABLE images(
	ID INT UNSIGNED NOT null AUTO_INCREMENT PRIMARY KEY,
    stored_name VARCHAR(255) NOT null UNIQUE,
    alt_text VARCHAR(255) NOT null DEFAULT '',
    mime_type VARCHAR(50) NOT null,
    size_bytes INT UNSIGNED  NOT null,
    created_at 	TIMESTAMP NOT null DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pages` (
  ID INT UNSIGNED NOT null AUTO_INCREMENT PRIMARY KEY,
  menu_name VARCHAR(100) NOT null,
  slug VARCHAR(100) NOT null UNIQUE,
  `position` int NOT NULL DEFAULT '1',
  visible TINYINT NOT null DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  max_element INT NOT null DEFAULT 10,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subjects (
	ID INT UNSIGNED NOT null AUTO_INCREMENT PRIMARY KEY,
    page_ID INT UNSIGNED NOT null,
    menu_name VARCHAR(100) NOT null,
    position INT  NOT null DEFAULT 1,
    visible TINYINT NOT null DEFAULT 0,
    content TEXT NOT null,
    status VARCHAR(20) NOT null DEFAULT 'draft',
    image_ID INT UNSIGNED,
    created_at TIMESTAMP NOT null DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_subjects_page_position (page_ID, position),
    CONSTRAINT fk_subjects_page
    	FOREIGN KEY (page_ID) REFERENCES pages(ID) ON DELETE CASCADE,
    CONSTRAINT fk_subjects_image
    	FOREIGN KEY (image_ID) REFERENCES images(ID) ON DELETE SET null
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;