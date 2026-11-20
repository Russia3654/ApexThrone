DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS admins;

CREATE TABLE admins(
    ID 	INT UNSIGNED NOT null AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT null,
    last_name VARCHAR(50) NOT null,
    email VARCHAR(255) NOT null UNIQUE,
    username VARCHAR(50) NOT null UNIQUE,
    password VARCHAR(255) NOT null,
    created_at TIMESTAMP NOT null DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4;

CREATE TABLE login_attempts (
    ID INT UNSIGNED NOT null AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(50) NOT null,
    ip_address VARCHAR(45) NOT null,
    attempted_at TIMESTAMP NOT null DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_login_attempts_lookup (identifier, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
