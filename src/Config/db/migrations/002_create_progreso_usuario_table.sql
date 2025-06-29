CREATE TABLE progreso_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    leccion_id VARCHAR(255) NOT NULL,
    porcentaje_avance INTEGER NOT NULL CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    fecha_ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, leccion_id)
);

CREATE INDEX idx_progreso_usuario_id ON progreso_usuario(usuario_id);
CREATE INDEX idx_progreso_leccion_id ON progreso_usuario(leccion_id);
CREATE INDEX idx_progreso_fecha_actividad ON progreso_usuario(fecha_ultima_actividad);