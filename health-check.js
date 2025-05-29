const http = require('http');

http.get('http://localhost:3000/api/student', (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.error(`Health check failed: ${res.statusCode}`);
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});
