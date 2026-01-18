CREATE TABLE productos (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen VARCHAR(255)
);