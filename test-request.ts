
async function testEndpoints() {
  const endpoints = [
    '/api/content',
    '/api/categories',
    '/api/glossary',
    '/api/auth/me'
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`);
      const data = await res.json();
      console.log(`Endpoint ${endpoint}:`, res.ok ? 'OK' : 'FAILED', data);
    } catch (err: any) {
      console.error(`Error testing ${endpoint}:`, err.message);
    }
  }
}

testEndpoints();
