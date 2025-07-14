# Integración Firebase Authentication

Esta documentación explica cómo usar la integración de Firebase Authentication en tu API de usuarios.

## Configuración Requerida

### 1. Archivo de configuración de Firebase

Asegúrate de tener el archivo `service_account.json` en la raíz del proyecto con las credenciales de Firebase Admin SDK.

### 2. Variables de entorno

```env
# Firebase (opcional, ya que usas service_account.json)
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY=tu-clave-privada
FIREBASE_CLIENT_EMAIL=tu-email-cliente
```

## Endpoints Disponibles

### Base URL
```
/api_user/auth/firebase
```

### 1. Registro de Usuario

**POST** `/register`

Registra un nuevo usuario usando Firebase Authentication.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "phoneNumber": "+525512345678",
  "idiomaPreferido": "español",
  "fcmToken": "token-fcm-opcional"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "firebase-custom-token",
    "expiresAt": "2024-01-01T12:00:00.000Z",
    "user": {
      "uid": "firebase-user-id",
      "email": "usuario@ejemplo.com",
      "displayName": "Juan Pérez",
      "phoneNumber": "+525512345678",
      "emailVerified": false
    }
  }
}
```

### 2. Login

**POST** `/login`

Autentica un usuario usando un token de Firebase.

**Body:**
```json
{
  "idToken": "firebase-id-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "firebase-id-token",
    "expiresAt": "2024-01-01T12:00:00.000Z",
    "user": {
      "uid": "firebase-user-id",
      "email": "usuario@ejemplo.com",
      "displayName": "Juan Pérez",
      "phoneNumber": "+525512345678",
      "emailVerified": true
    }
  }
}
```

### 3. Verificar Token

**POST** `/verify-token`

Verifica si un token de Firebase es válido.

**Headers:**
```
Authorization: Bearer firebase-id-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "uid": "firebase-user-id",
      "email": "usuario@ejemplo.com",
      "displayName": "Juan Pérez",
      "phoneNumber": "+525512345678",
      "emailVerified": true
    }
  }
}
```

### 4. Obtener Usuario Actual

**GET** `/me`

Obtiene información del usuario autenticado.

**Headers:**
```
Authorization: Bearer firebase-id-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Información del usuario obtenida",
  "data": {
    "user": {
      "uid": "firebase-user-id",
      "email": "usuario@ejemplo.com",
      "displayName": "Juan Pérez",
      "phoneNumber": "+525512345678",
      "emailVerified": true
    }
  }
}
```

### 5. Enviar Email de Verificación

**POST** `/send-email-verification`

Envía un email de verificación al usuario autenticado.

**Headers:**
```
Authorization: Bearer firebase-id-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email de verificación enviado"
}
```

### 6. Enviar Email de Restablecimiento de Contraseña

**POST** `/send-password-reset`

Envía un email para restablecer la contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email de restablecimiento enviado"
}
```

### 7. Ruta Protegida de Prueba

**GET** `/protected`

Ruta de prueba que requiere autenticación.

**Headers:**
```
Authorization: Bearer firebase-id-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ruta protegida accedida correctamente",
  "user": {
    "uid": "firebase-user-id",
    "email": "usuario@ejemplo.com",
    "displayName": "Juan Pérez",
    "phoneNumber": "+525512345678",
    "emailVerified": true
  }
}
```

### 8. Ruta que Requiere Email Verificado

**GET** `/verified-only`

Ruta que requiere que el email esté verificado.

**Headers:**
```
Authorization: Bearer firebase-id-token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ruta accedida con email verificado",
  "user": {
    "uid": "firebase-user-id",
    "email": "usuario@ejemplo.com",
    "displayName": "Juan Pérez",
    "phoneNumber": "+525512345678",
    "emailVerified": true
  }
}
```

## Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "type": "field",
      "value": "email-invalido",
      "msg": "Email válido requerido",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token de autorización requerido"
}
```

```json
{
  "success": false,
  "message": "Token expirado"
}
```

```json
{
  "success": false,
  "message": "Token inválido"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Email no verificado"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Usuario no encontrado en nuestra base de datos"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "El email ya está registrado en nuestra base de datos"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Flujo de Autenticación

### 1. Registro
1. El cliente llama a `/register` con los datos del usuario
2. Se crea el usuario en Firebase Authentication
3. Se crea el usuario en tu base de datos local
4. Se envía email de verificación
5. Se retorna un token personalizado de Firebase

### 2. Login
1. El cliente obtiene un ID token de Firebase (desde el frontend)
2. El cliente llama a `/login` con el ID token
3. Se verifica el token con Firebase
4. Se busca el usuario en tu base de datos
5. Se retorna la información del usuario

### 3. Autenticación en Rutas Protegidas
1. El cliente incluye el ID token en el header `Authorization: Bearer <token>`
2. El middleware verifica el token con Firebase
3. Si es válido, se agrega la información del usuario a `req.firebaseUser`
4. La ruta puede acceder a `req.firebaseUser` para obtener información del usuario

## Middleware Disponible

### FirebaseAuthMiddleware

```typescript
// Autenticación requerida
app.get('/ruta-protegida', firebaseAuthMiddleware.authenticate, (req, res) => {
  // req.firebaseUser contiene la información del usuario
});

// Autenticación opcional
app.get('/ruta-opcional', firebaseAuthMiddleware.optionalAuth, (req, res) => {
  // req.firebaseUser puede ser undefined
});

// Requerir email verificado
app.get('/ruta-verificada', 
  firebaseAuthMiddleware.authenticate,
  firebaseAuthMiddleware.requireEmailVerified,
  (req, res) => {
    // Solo usuarios con email verificado
  }
);

// Verificar propiedad del recurso
app.get('/usuario/:userId/perfil',
  firebaseAuthMiddleware.authenticate,
  firebaseAuthMiddleware.requireOwnership('userId'),
  (req, res) => {
    // Verificar que el usuario sea propietario del recurso
  }
);
```

## Integración con Frontend

### React Native / Flutter

```javascript
// 1. Obtener ID token de Firebase
const idToken = await firebase.auth().currentUser.getIdToken();

// 2. Login en tu API
const response = await fetch('/api_user/auth/firebase/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ idToken }),
});

// 3. Usar el token para rutas protegidas
const userResponse = await fetch('/api_user/auth/firebase/me', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
  },
});
```

### Web (JavaScript)

```javascript
// 1. Obtener ID token de Firebase
const idToken = await firebase.auth().currentUser.getIdToken();

// 2. Login en tu API
const response = await fetch('/api_user/auth/firebase/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ idToken }),
});

// 3. Usar el token para rutas protegidas
const userResponse = await fetch('/api_user/auth/firebase/me', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
  },
});
```

## Consideraciones de Seguridad

1. **Tokens**: Los tokens de Firebase tienen una duración limitada (1 hora por defecto)
2. **Verificación de Email**: Implementa verificación de email para funcionalidades críticas
3. **Rate Limiting**: Considera implementar rate limiting en los endpoints de autenticación
4. **Logs**: Todos los errores de autenticación se registran en los logs
5. **HTTPS**: Asegúrate de usar HTTPS en producción

## Migración desde Autenticación Tradicional

Si ya tienes usuarios con autenticación tradicional, puedes:

1. Mantener ambos sistemas funcionando en paralelo
2. Migrar usuarios gradualmente a Firebase
3. Usar el mismo email para vincular cuentas
4. Implementar un proceso de migración automática

## Troubleshooting

### Error: "Token expirado"
- El token de Firebase ha expirado
- El cliente debe obtener un nuevo token

### Error: "Usuario no encontrado en nuestra base de datos"
- El usuario existe en Firebase pero no en tu base de datos
- Verifica la sincronización entre Firebase y tu base de datos

### Error: "El email ya está registrado"
- El email ya existe en tu base de datos
- Considera implementar un proceso de vinculación de cuentas

### Error: "Credenciales de Firebase nulas"
- Verifica que el archivo `service_account.json` esté presente y sea válido
- Verifica las variables de entorno de Firebase 