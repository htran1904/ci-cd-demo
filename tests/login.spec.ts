import { test, expect } from '@playwright/test';

// ============================================================
// TEST SUITE: Login Feature
// Mỗi "test()" là 1 test case — pipeline sẽ chạy tất cả
// ============================================================

test.describe('Login Page — UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC01 — Trang login hiển thị đúng các thành phần', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Đăng nhập');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-btn')).toBeVisible();
    await expect(page.locator('#login-btn')).toHaveText('Đăng nhập');
  });

  test('TC02 — Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'password123');
    await page.click('#login-btn');

    // Dashboard phải hiện ra
    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('#welcome-text')).toContainText('admin');
    await expect(page.locator('#login-form')).toBeHidden();
  });

  test('TC03 — Đăng nhập thất bại với sai password', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'wrongpassword');
    await page.click('#login-btn');

    // Phải hiện thông báo lỗi
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('Sai username');
    // Dashboard KHÔNG được hiện
    await expect(page.locator('#dashboard')).toBeHidden();
  });

  test('TC04 — Đăng nhập thất bại với username không tồn tại', async ({ page }) => {
    await page.fill('#username', 'nobody');
    await page.fill('#password', 'whatever');
    await page.click('#login-btn');

    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#dashboard')).toBeHidden();
  });

  test('TC05 — Validation: để trống username và password', async ({ page }) => {
    await page.click('#login-btn');
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('đầy đủ thông tin');
  });

  test('TC06 — Validation: để trống chỉ password', async ({ page }) => {
    await page.fill('#username', 'admin');
    // Không điền password
    await page.click('#login-btn');
    await expect(page.locator('#message')).toHaveClass(/error/);
  });

  test('TC07 — Đăng xuất sau khi đăng nhập thành công', async ({ page }) => {
    // Đăng nhập
    await page.fill('#username', 'admin');
    await page.fill('#password', 'password123');
    await page.click('#login-btn');
    await expect(page.locator('#dashboard')).toBeVisible();

    // Đăng xuất
    await page.click('#logout-btn');
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('#dashboard')).toBeHidden();
    // Form phải được reset
    await expect(page.locator('#username')).toHaveValue('');
    await expect(page.locator('#password')).toHaveValue('');
  });

  test('TC08 — Nhấn Enter để đăng nhập', async ({ page }) => {
    await page.fill('#username', 'user1');
    await page.fill('#password', 'secret456');
    await page.keyboard.press('Enter');

    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('#welcome-text')).toContainText('user1');
  });
});

// ============================================================
// TEST SUITE: API Tests (gọi thẳng API, không qua UI)
// ============================================================

test.describe('Login API — Backend Tests', () => {
  test('TC09 — API /health trả về status ok', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('TC10 — API login thành công trả về 200', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.role).toBe('admin');
  });

  test('TC11 — API login sai password trả về 401', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: 'admin', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('TC12 — API login thiếu body trả về 400', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    //expect(body.message).toContain('không được để trống');
  });
});
