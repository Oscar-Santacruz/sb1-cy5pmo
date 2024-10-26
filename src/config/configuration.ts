export default () => ({
  database: {
    host: process.env.DB2_HOST,
    user: process.env.DB2_USER,
    password: process.env.DB2_PASSWORD,
    port: parseInt(process.env.DB2_PORT, 10) || 50000,
    database: process.env.DB2_DATABASE
  },
  seq: {
    url: process.env.SEQ_URL,
    apiKey: process.env.SEQ_API_KEY
  }
});