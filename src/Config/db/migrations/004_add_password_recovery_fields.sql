-- Agregar campos para recuperación de contraseña
ALTER TABLE usuarios 
ADD COLUMN token_recuperacion VARCHAR(255),
ADD COLUMN fecha_expiracion_token TIMESTAMP;

-- Crear índice para búsquedas por token
CREATE INDEX idx_usuarios_token_recuperacion ON usuarios(token_recuperacion); 