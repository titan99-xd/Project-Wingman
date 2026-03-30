import express, { type Request, type Response } from 'express';
const app = express();
const PORT = 5000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the TypeScript Backend!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});