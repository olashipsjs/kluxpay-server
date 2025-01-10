import express from 'express';
import cors from 'cors';
import path from 'path';
import cookies from 'cookie-parser';
import render from './libs/render';

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://www.kluxpay.com'],
    credentials: true,
  })
);
app.use(cookies());

// Routes
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));

app.get('/views/:template', async (req, res) => {
  const { template } = req.params;
  try {
    const html = render(template);
    res.send(html);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send('An error occurred while rendering the email template.');
  }
});

export default app;
