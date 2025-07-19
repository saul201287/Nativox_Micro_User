-- Migración para agregar campos de autenticación de Firebase
-- Fecha: 2024-01-XX

-- Agregar campos para autenticación de Firebase
ALTER TABLE usuarios 
ADD COLUMN firebase_uid VARCHAR(255) UNIQUE,
ADD COLUMN firebase_display_name VARCHAR(255),
ADD COLUMN firebase_phone_number VARCHAR(20),
ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE,
ADD COLUMN ultimo_login TIMESTAMP,
ADD COLUMN tipo_autenticacion VARCHAR(20) DEFAULT 'local';

-- Hacer la contraseña opcional para usuarios de Firebase
ALTER TABLE usuarios 
ALTER COLUMN contrasena_hash DROP NOT NULL;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_firebase_uid ON usuarios(firebase_uid);
CREATE INDEX idx_usuarios_tipo_autenticacion ON usuarios(tipo_autenticacion);
CREATE INDEX idx_usuarios_ultimo_login ON usuarios(ultimo_login);

-- Comentarios sobre los nuevos campos
COMMENT ON COLUMN usuarios.firebase_uid IS 'UID único de Firebase Auth';
COMMENT ON COLUMN usuarios.firebase_display_name IS 'Nombre mostrado en Firebase';
COMMENT ON COLUMN usuarios.firebase_phone_number IS 'Número de teléfono de Firebase';
COMMENT ON COLUMN usuarios.email_verificado IS 'Indica si el email está verificado en Firebase';
COMMENT ON COLUMN usuarios.ultimo_login IS 'Fecha y hora del último inicio de sesión';
COMMENT ON COLUMN usuarios.tipo_autenticacion IS 'Tipo de autenticación: local, firebase, google, facebook'; 