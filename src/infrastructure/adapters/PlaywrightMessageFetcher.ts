import { chromium, Browser, Page } from "playwright";
import { MessageFetcher } from "../../domain/ports/MessageFetcher";
import { Message } from "../../domain/entities/Message";
import { Credentials } from "../../domain/entities/Credentials";

export class PlaywrightMessageFetcher implements MessageFetcher {
  private readonly LOGIN_URL = "https://www.frc.utn.edu.ar/logon.frc";
  private readonly AUTOGESTION_URL = "https://a4.frc.utn.edu.ar/4/";

  async fetchMessages(credentials: Credentials): Promise<Message[]> {
    let browser: Browser | null = null;

    try {
      const isProduction = process.env.NODE_ENV === "production";
      browser = await chromium.launch({ headless: isProduction });
      const page = await browser.newPage();

      await this.login(page, credentials);
      const messages = await this.extractMessages(page);

      return messages;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async login(page: Page, credentials: Credentials): Promise<void> {
    console.log("🔐 Navigating to login page...");
    await page.goto(this.LOGIN_URL, { waitUntil: "networkidle" });

    // Fill in the login form
    console.log(`👤 Logging in as ${credentials.user}@${credentials.service}...`);

    // Username input
    console.log("Filling username...");
    await page.fill('#txtUsuario', credentials.user);

    // Service dropdown
    console.log("Filling service...");
    await page.selectOption('#txtDominios', credentials.service);

    // Password input
    console.log("Filling password...");
    await page.fill('#pwdClave', credentials.password);

    // Check the Autogestión checkbox
    console.log("Checking Autogestión checkbox...");
    await page.check('#chk2');

    // Submit the form
    console.log("🚀 Submitting login...");
    await page.click('#btnEnviar');

    // Wait for redirect to Autogestión
    await page.waitForURL(`${this.AUTOGESTION_URL}**`, { timeout: 30000 });
    console.log("✅ Login successful, redirected to Autogestión.");
  }

  private async extractMessages(page: Page): Promise<Message[]> {
    console.log("📨 Waiting for messages list...");

    // Wait for the messages container to appear
    await page.waitForSelector("#listaMensajes", { timeout: 30000 });

    // wait for 5 seconds
    // click #masElementosDelTimeLine
    // scroll botton
    const masElementos = page.locator("#masElementosDelTimeLine");
    if (await masElementos.count() > 0) {
      await masElementos.click();
    }
    await page.waitForTimeout(5000);

    // Extract timeline items, filtering out time-label separators and pagination
    const messages = (await page.$$eval(
      "#listaMensajes > li:not(.time-label):not(:has(#masElementosDelTimeLine))",
      (elements) => {
        return elements.map((el) => {
          const raw = el.innerHTML.trim();

          const dateEl = el.querySelector(".time");
          const titleEl = el.querySelector(".timeline-header");
          const hasAttachments = !!el.querySelector(".archivosDescarga");
          const bodyEl = el.querySelector(hasAttachments ? "table > tbody > tr:nth-child(2) > td" : ".timeline-body");
          const senderEl = el.querySelector(".timeline-header a, .timeline-header strong");
          const classEl = el.querySelector(".alcance");

          return {
            id: el.getAttribute("id") ?? "",
            title: titleEl?.textContent?.trim() ?? "",
            body: bodyEl?.textContent?.trim() ?? "",
            date: dateEl?.getAttribute("title") ?? dateEl?.textContent?.trim() ?? "",
            sender: senderEl?.textContent?.trim() ?? "",
            raw,
            hasAttachments,
            class: classEl?.textContent?.trim() ?? ""
          };
        });
      }
    )).filter((msg) => msg.sender !== "Me" && msg.sender !== "Yo");

    console.log(`📬 Found ${messages.length} messages.`);
    return messages;
  }
}
