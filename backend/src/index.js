import app from './app.js';

const port = Number(process.env.PORT ?? 5050);

app.listen(port, () => {
  console.log(`OutageIQ backend running on http://localhost:${port}`);
});