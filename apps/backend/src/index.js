import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { logLlmConnectionStatus } from './services/aiProvider.js';

const start = async () => {
  try {
    await connectDatabase();
    void logLlmConnectionStatus();
    app.listen(config.port, () => {
      console.log(`API http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
