// simple-test.js
console.log('Iniciando test...');

const axios = require('axios');

axios.post('http://localhost:3001/api/auth/login', {
  email: 'admin@construccion.com',
  password: 'admin123'
}).then(response => {
  console.log('✅ SUCCESS:', response.data);
}).catch(error => {
  console.log('❌ ERROR:', error.message);
});
