import { test, expect } from "@playwright/test";

const LANDING_URL = "https://quantum-fit-landing-production.up.railway.app";
const ADMIN_URL = "https://quantum-fit-admin-production.up.railway.app";
const API_URL = "https://quantum-fit-backend-production.up.railway.app/api";

test.describe("Quantum Fit Landing", () => {

  test("page loads with correct title", async ({ page }) => {
    await page.goto(LANDING_URL);
    await expect(page).toHaveTitle(/Quantum Fit/);
  });

  test("Hero section is visible with heading", async ({ page }) => {
    await page.goto(LANDING_URL);
    const hero = page.locator("#inicio");
    await expect(hero).toBeVisible();
    await expect(hero.locator("h1, h2").first()).toBeVisible();
  });

  test("navigation links are present", async ({ page }) => {
    await page.goto(LANDING_URL);
    const header = page.locator("header, nav").first();
    await expect(header).toBeVisible();
    const links = header.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(3);
  });

  test("Cursos section loads courses from API", async ({ page }) => {
    await page.goto(LANDING_URL);
    const section = page.locator("#clases");
    await expect(section).toBeVisible({ timeout: 15000 });
    const cards = section.locator("h3");
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
  });

  test("Buffet section shows menu items when data loads", async ({ page }) => {
    await page.goto(LANDING_URL);
    const section = page.locator("#buffet");
    await expect(section).toBeVisible({ timeout: 15000 });
    const items = section.locator("li");
    await expect(items.first()).toBeVisible({ timeout: 15000 });
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test("News section shows articles when data loads", async ({ page }) => {
    await page.goto(LANDING_URL);
    const section = page.locator("#noticias");
    await expect(section).toBeVisible({ timeout: 15000 });
    const articles = section.locator("h3");
    await expect(articles.first()).toBeVisible({ timeout: 15000 });
  });

  test("Gallery section loads images from API", async ({ page }) => {
    await page.goto(LANDING_URL);
    const section = page.locator("#galeria");
    await expect(section).toBeVisible({ timeout: 15000 });
    const images = section.locator("img[src*='images.unsplash.com']");
    await expect(images.first()).toBeVisible({ timeout: 15000 });
  });

  test("Plans section shows pricing cards", async ({ page }) => {
    await page.goto(LANDING_URL);
    const section = page.locator("#planes");
    await expect(section).toBeVisible({ timeout: 15000 });
    const cards = section.locator("h3");
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);
  });

  test("Testimonials section shows user names", async ({ page }) => {
    await page.goto(LANDING_URL);
    const section = page.locator("#testimonios");
    await expect(section).toBeVisible({ timeout: 10000 });
    const name = section.locator("p.font-semibold");
    await expect(name.first()).toBeVisible({ timeout: 15000 });
    const text = await name.first().textContent();
    expect(text?.trim()).toBeTruthy();
  });

  test("all section IDs are present", async ({ page }) => {
    await page.goto(LANDING_URL);
    const ids = ["#inicio", "#features", "#nosotros", "#planes", "#clases", "#galeria", "#testimonios", "#buffet", "#noticias", "#contacto", "#descargar"];
    for (const id of ids) {
      await expect(page.locator(id)).toBeVisible({ timeout: 10000 });
    }
  });

  test("API endpoints respond correctly", async ({ request }) => {
    const endpoints = ["/landing/gallery", "/landing/courses", "/landing/buffet", "/landing/news", "/landing/site-config", "/landing/testimonials", "/landing/plans"];
    for (const ep of endpoints) {
      const resp = await request.get(`${API_URL}${ep}`);
      expect(resp.ok()).toBeTruthy();
      const body = await resp.json();
      expect(body.success).toBe(true);
    }
  });

  test("API returns data for all sections", async ({ request }) => {
    const checks = [
      { url: "/landing/gallery", min: 1 },
      { url: "/landing/courses", min: 1 },
      { url: "/landing/buffet", min: 1 },
      { url: "/landing/news", min: 1 },
      { url: "/landing/testimonials", min: 1 },
      { url: "/landing/plans", min: 1 },
    ];
    for (const c of checks) {
      const resp = await request.get(`${API_URL}${c.url}`);
      const body = await resp.json();
      expect(body.data.length).toBeGreaterThanOrEqual(c.min);
    }
  });

});

test.describe("Admin Panel", () => {

  test("admin login page loads", async ({ page }) => {
    await page.goto(ADMIN_URL + "/login");
    await expect(page.locator("#email")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#password")).toBeVisible({ timeout: 5000 });
  });

  test("admin can log in and redirects to dashboard", async ({ page }) => {
    await page.goto(ADMIN_URL + "/login");
    await page.locator("#email").waitFor({ timeout: 10000 });
    await page.locator("#email").fill("admin@quantumfit.com");
    await page.locator("#password").fill("Admin123!");
    await page.locator("button[type='submit']").first().click();
    await page.waitForTimeout(5000);
    const url = page.url();
    expect(url).not.toContain("/login");
  });

});
