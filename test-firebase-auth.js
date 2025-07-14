// Script de prueba para Firebase Authentication
// Ejecutar con: node test-firebase-auth.js

const API_BASE_URL = 'http://localhost:3000/api_user/auth/firebase';

// Función para hacer requests HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    console.log(`\n${options.method || 'GET'} ${url}`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error('Error:', error.message);
    return { response: null, data: null };
  }
}

// Función para probar el registro
async function testRegister() {
  console.log('\n=== Probando Registro ===');
  
  const userData = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    nombre: 'Usuario',
    apellido: 'Prueba',
    phoneNumber: '+525512345678',
    idiomaPreferido: 'español',
    fcmToken: 'test-fcm-token'
  };

  const { data } = await makeRequest(`${API_BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (data && data.success) {
    console.log('✅ Registro exitoso');
    return data.data.token; // Retornar el token para pruebas posteriores
  } else {
    console.log('❌ Registro falló');
    return null;
  }
}

// Función para probar la verificación de token
async function testVerifyToken(token) {
  console.log('\n=== Probando Verificación de Token ===');
  
  const { data } = await makeRequest(`${API_BASE_URL}/verify-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (data && data.success) {
    console.log('✅ Token válido');
    return true;
  } else {
    console.log('❌ Token inválido');
    return false;
  }
}

// Función para probar obtener usuario actual
async function testGetCurrentUser(token) {
  console.log('\n=== Probando Obtener Usuario Actual ===');
  
  const { data } = await makeRequest(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (data && data.success) {
    console.log('✅ Usuario obtenido correctamente');
    return true;
  } else {
    console.log('❌ Error al obtener usuario');
    return false;
  }
}

// Función para probar ruta protegida
async function testProtectedRoute(token) {
  console.log('\n=== Probando Ruta Protegida ===');
  
  const { data } = await makeRequest(`${API_BASE_URL}/protected`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (data && data.success) {
    console.log('✅ Ruta protegida accedida correctamente');
    return true;
  } else {
    console.log('❌ Error al acceder a ruta protegida');
    return false;
  }
}

// Función para probar envío de email de verificación
async function testSendEmailVerification(token) {
  console.log('\n=== Probando Envío de Email de Verificación ===');
  
  const { data } = await makeRequest(`${API_BASE_URL}/send-email-verification`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (data && data.success) {
    console.log('✅ Email de verificación enviado');
    return true;
  } else {
    console.log('❌ Error al enviar email de verificación');
    return false;
  }
}

// Función para probar envío de email de restablecimiento
async function testSendPasswordReset() {
  console.log('\n=== Probando Envío de Email de Restablecimiento ===');
  
  const { data } = await makeRequest(`${API_BASE_URL}/send-password-reset`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
    }),
  });

  if (data && data.success) {
    console.log('✅ Email de restablecimiento enviado');
    return true;
  } else {
    console.log('❌ Error al enviar email de restablecimiento');
    return false;
  }
}

// Función para probar login con token inválido
async function testInvalidToken() {
  console.log('\n=== Probando Token Inválido ===');
  
  const { data } = await makeRequest(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid-token',
    },
  });

  if (data && !data.success) {
    console.log('✅ Token inválido rechazado correctamente');
    return true;
  } else {
    console.log('❌ Token inválido no fue rechazado');
    return false;
  }
}

// Función para probar acceso sin token
async function testNoToken() {
  console.log('\n=== Probando Acceso Sin Token ===');
  
  const { data } = await makeRequest(`${API_BASE_URL}/me`, {
    method: 'GET',
  });

  if (data && !data.success) {
    console.log('✅ Acceso sin token rechazado correctamente');
    return true;
  } else {
    console.log('❌ Acceso sin token no fue rechazado');
    return false;
  }
}

// Función principal que ejecuta todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas de Firebase Authentication');
  console.log('==============================================');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Registro
  totalTests++;
  const token = await testRegister();
  if (token) passedTests++;

  if (token) {
    // Test 2: Verificación de token
    totalTests++;
    if (await testVerifyToken(token)) passedTests++;

    // Test 3: Obtener usuario actual
    totalTests++;
    if (await testGetCurrentUser(token)) passedTests++;

    // Test 4: Ruta protegida
    totalTests++;
    if (await testProtectedRoute(token)) passedTests++;

    // Test 5: Envío de email de verificación
    totalTests++;
    if (await testSendEmailVerification(token)) passedTests++;
  }

  // Test 6: Envío de email de restablecimiento
  totalTests++;
  if (await testSendPasswordReset()) passedTests++;

  // Test 7: Token inválido
  totalTests++;
  if (await testInvalidToken()) passedTests++;

  // Test 8: Sin token
  totalTests++;
  if (await testNoToken()) passedTests++;

  // Resumen final
  console.log('\n==============================================');
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('==============================================');
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! La integración de Firebase está funcionando correctamente.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa los logs anteriores para más detalles.');
  }
}

// Ejecutar las pruebas si el script se ejecuta directamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testRegister,
  testVerifyToken,
  testGetCurrentUser,
  testProtectedRoute,
  testSendEmailVerification,
  testSendPasswordReset,
  testInvalidToken,
  testNoToken,
  runAllTests,
}; 