// debug-login.js
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔐 Probando login con credenciales válidas...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@construccion.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso!');
    console.log('📊 Status:', response.status);
    console.log('🔍 Response data:', JSON.stringify(response.data, null, 2));
    console.log('🔑 Token:', response.data.token);
    console.log('👤 User:', response.data.user);
    console.log('📝 User Role:', response.data.user?.role);
    
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
  }
};

testLogin();
