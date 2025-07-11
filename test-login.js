// test-login.js - Archivo de prueba para login
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔐 Probando login...');
    
    // Probar con diferentes credenciales
    const credenciales = [
      { email: 'admin@admin.com', password: 'admin123' },
      { email: 'admin@test.com', password: 'password123' },
      { email: 'admin@example.com', password: 'admin' },
      { email: 'test@test.com', password: 'test123' }
    ];
    
    for (const cred of credenciales) {
      console.log(`\n🔑 Probando: ${cred.email} / ${cred.password}`);
      
      try {
        const response = await axios.post('http://localhost:3001/api/auth/login', cred);
        console.log('✅ Login exitoso:', response.data);
        console.log('🔑 Token:', response.data.token);
        console.log('👤 Usuario:', response.data.user);
        break; // Si una funciona, salimos del bucle
      } catch (error) {
        console.log('❌ Falló:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
};

testLogin();
