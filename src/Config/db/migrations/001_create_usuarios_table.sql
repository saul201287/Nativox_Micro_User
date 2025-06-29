CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    idioma_preferido VARCHAR(2) NOT NULL CHECK (idioma_preferido IN ('es', 'en', 'fr', 'pt', 'it')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_fecha_registro ON usuarios(fecha_registro);