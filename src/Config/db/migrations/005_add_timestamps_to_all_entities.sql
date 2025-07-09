-- Agregar timestamps a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Agregar timestamps a la tabla progreso_usuario
ALTER TABLE progreso_usuario 
ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Agregar timestamps a la tabla notificaciones
ALTER TABLE notificaciones 
ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Crear índices para optimizar consultas por fechas
CREATE INDEX idx_usuarios_fecha_actualizacion ON usuarios(fecha_actualizacion);
CREATE INDEX idx_progreso_fecha_actualizacion ON progreso_usuario(fecha_actualizacion);
CREATE INDEX idx_notificaciones_fecha_actualizacion ON notificaciones(fecha_actualizacion); 