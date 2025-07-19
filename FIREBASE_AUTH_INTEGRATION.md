# Integración de Firebase Authentication

## Descripción

Esta implementación permite manejar usuarios que se registran tanto con el sistema local como con Firebase Authentication, manteniendo una única entidad de usuario en la base de datos.

## Arquitectura

### Estrategia Implementada

Se optó por **extender la entidad actual** en lugar de crear una nueva entidad separada. Esto proporciona:

- **Consistencia**: Un solo modelo de usuario para toda la aplicación
- **Flexibilidad**: Soporte para múltiples proveedores de autenticación
- **Simplicidad**: No duplicación de lógica de negocio
- **Escalabilidad**: Fácil agregar más proveedores en el futuro

### Campos Agregados

```sql
-- Campos para autenticación de Firebase
firebase_uid VARCHAR(255) UNIQUE,
firebase_display_name VARCHAR(255),
firebase_phone_number VARCHAR(20),
email_verificado BOOLEAN DEFAULT FALSE,
ultimo_login TIMESTAMP,
tipo_autenticacion VARCHAR(20) DEFAULT 'local'
```

## Endpoints Disponibles

### 1. Registro con Firebase

**POST** `/api_user/firebase/registrar`

```json
{
  "email": "usuario@gmail.com",
  "displayName": "Juan Pérez",
  "phoneNumber": "+1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "idiomaPreferido": "español",
  "fcmToken": "dsdsdfsfdsdf234242",
  "firebaseUid": "firebase_user_id_123",
  "emailVerified": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente con Firebase",
  "data": {
    "id": "uuid-del-usuario",
    "email": "usuario@gmail.com",
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

### 2. Login con Firebase

**POST** `/api_user/firebase/login`

```json
{
  "idToken": "firebase_id_token_here",
  "fcmToken": "dsdsdfsfdsdf234242"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso con Firebase",
  "data": {
    "token": "jwt_token_para_la_app",
    "expiresAt": "2024-01-XXTXX:XX:XX.XXXZ",
    "user": {
      "uid": "firebase_user_id_123",
      "email": "usuario@gmail.com",
      "displayName": "Juan Pérez",
      "phoneNumber": "+1234567890",
      "emailVerified": true
    }
  }
}
```

### 3. Verificar Token

**GET** `/api_user/firebase/verificar-token`

**Headers:**
```
Authorization: Bearer <jwt_token_o_firebase_token>
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "userId": "uuid-del-usuario",
    "email": "usuario@gmail.com",
    "firebaseUid": "firebase_user_id_123",
    "tipoAutenticacion": "firebase"
  }
}
```

### 4. Obtener Perfil

**GET** `/api_user/firebase/perfil`

**Headers:**
```
Authorization: Bearer <jwt_token_o_firebase_token>
```

## Middleware de Autenticación Unificado

### authMiddleware

Middleware unificado que verifica tokens tanto JWT de la aplicación como tokens de Firebase.

```typescript
import { authMiddleware } from "../Shared/middleware/auth-middleware";

// En las rutas
app.get("/ruta-protegida", authMiddleware, (req, res) => {
  // req.user contiene la información del usuario autenticado
  // req.user.userId, req.user.email, req.user.firebaseUid, req.user.tipoAutenticacion
});
```

### optionalAuthMiddleware

Middleware opcional que permite rutas públicas o autenticadas.

```typescript
import { optionalAuthMiddleware } from "../Shared/middleware/auth-middleware";

// En las rutas
app.get("/ruta-opcional", optionalAuthMiddleware, (req, res) => {
  // req.user puede estar definido o no
});
```

## Flujo de Autenticación

### 1. Registro de Usuario con Firebase

1. El cliente obtiene un token de Firebase Auth
2. Envía los datos del usuario + token a `/api_user/firebase/registrar`
3. El servidor verifica el token de Firebase
4. Se crea el usuario en la base de datos con `tipo_autenticacion = "firebase"`
5. Se retorna el ID del usuario creado

### 2. Login de Usuario con Firebase

1. El cliente obtiene un token de Firebase Auth
2. Envía el token a `/api_user/firebase/login`
3. El servidor verifica el token de Firebase
4. Busca el usuario por `firebase_uid`
5. Actualiza `ultimo_login` y `fcm_token`
6. Retorna un JWT de la aplicación

### 3. Autenticación en Rutas Protegidas

1. El cliente envía el token en el header `Authorization`
2. El middleware verifica si es JWT o token de Firebase automáticamente
3. Si es válido, agrega `req.user` con la información del usuario
4. La ruta puede acceder a `req.user`

## Comparación de Tipos de Usuario

### Usuario Local
```json
{
  "id": "uuid",
  "nombre": "Jose Saúl",
  "apellido": "Gómez",
  "email": "23josesaul@gmail.com",
  "phone": "9612175253",
  "contrasena_hash": "hash_bcrypt",
  "idiomaPreferido": "zapoteco",
  "fcmToken": "dsdsdfsfdsdf234242",
  "tipo_autenticacion": "local",
  "firebase_uid": null,
  "email_verificado": false
}
```

### Usuario Firebase
```json
{
  "id": "uuid",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "usuario@gmail.com",
  "phone": "+1234567890",
  "contrasena_hash": null,
  "idiomaPreferido": "español",
  "fcmToken": "dsdsdfsfdsdf234242",
  "tipo_autenticacion": "firebase",
  "firebase_uid": "firebase_user_id_123",
  "firebase_display_name": "Juan Pérez",
  "firebase_phone_number": "+1234567890",
  "email_verificado": true
}
```

## Migración de Base de Datos

Ejecutar la migración para agregar los nuevos campos:

```bash
npm run migration:firebase
```

O ejecutar manualmente el archivo `006_add_firebase_auth_fields.sql`.

## Configuración Requerida

### Variables de Entorno

```env
JWT_SECRET=tu_jwt_secret_aqui
FIREBASE_PROJECT_ID=tu_proyecto_firebase
```

### Archivo de Configuración de Firebase

Asegúrate de tener el archivo `service_account.json` en la raíz del proyecto con las credenciales de Firebase Admin SDK.

## Ventajas de esta Implementación

1. **Unificación**: Un solo modelo de usuario para toda la aplicación
2. **Flexibilidad**: Soporte para múltiples proveedores de autenticación
3. **Escalabilidad**: Fácil agregar Google, Facebook, etc.
4. **Mantenibilidad**: Código más limpio y organizado
5. **Compatibilidad**: Funciona con usuarios existentes
6. **Seguridad**: Verificación de tokens de Firebase
7. **Trazabilidad**: Registro de último login y tipo de autenticación
8. **Middleware Unificado**: Un solo middleware para JWT y Firebase

## Consideraciones de Seguridad

1. **Verificación de Tokens**: Siempre verificar tokens de Firebase en el servidor
2. **Validación de Datos**: Sanitizar y validar todos los datos de entrada
3. **Rate Limiting**: Implementar límites de tasa para endpoints de autenticación
4. **Logging**: Registrar intentos de autenticación fallidos
5. **HTTPS**: Usar HTTPS en producción

## Próximos Pasos

1. Implementar autenticación con Google
2. Implementar autenticación con Facebook
3. Agregar validación de email para usuarios locales
4. Implementar refresh tokens
5. Agregar rate limiting
6. Implementar logout y revocación de tokens 