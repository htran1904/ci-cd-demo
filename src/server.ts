import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Fake user database ---
const USERS: Record<string, string> = {
  admin: 'password123',
  user1: 'secret456',
};

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'src', 'public')));

// Health check - pipeline dùng endpoint này để biết server đã sẵn sàng
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login endpoint
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username và password không được để trống',
    });
  }

  const stored = USERS[username];
  if (!stored || stored !== password) {
    return res.status(401).json({
      success: false,
      message: 'Sai username hoặc password',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    user: { username, role: username === 'admin' ? 'admin' : 'user' },
  });
});

// Logout endpoint
app.post('/api/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Đã đăng xuất' });
});

const server = app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

export { app, server };
