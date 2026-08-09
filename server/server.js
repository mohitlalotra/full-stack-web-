const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas / Local Database
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`[Wholesale ERP Backend Server Running]`);
    console.log(`- Port: ${PORT}`);
    console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- Health Check: http://localhost:${PORT}/`);
    console.log(`================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [Port Error] Port ${PORT} is already in use by another process.`);
      console.error(`Run this command in PowerShell to free port ${PORT}:`);
      console.error(`Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }\n`);
    } else {
      console.error('❌ [Server Error]', err);
    }
  });
});
