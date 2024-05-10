const dotEnv = require('dotenv');
const app = require('./app');

// UnCaught Exceptions
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('uncaughtException ! Shutting down....');
  process.exit(1);
});

dotEnv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;

// Starting the server.
const port = 3000
const server = app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

// Handling UnhandledRejection 
process.on('rejectionHandled', err => {
  console.log(err.name, err.message);
  console.log('UnhandledRejection ! Shutting down....');
  
  server.close(() => {
    process.exit(1);
  })
});
