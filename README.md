# UTN Autogestión Messager Bot

A Telegram bot that logs into the UTN FRC Autogestión platform, scrapes new messages using Playwright, and sends them directly to a Telegram chat. It uses Prisma and SQLite to remember which messages have already been sent, ensuring you only receive new notifications.

## Prerequisites

- Node.js (v18+)
- SQLite (built-in via Prisma)
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Your Telegram Chat ID (you can get this from [@userinfobot](https://t.me/userinfobot))

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Make sure you provide your `UTN_USER`, `UTN_SERVICE`, `UTN_PASSWORD`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_CHAT_ID`.*

3. **Set up the Database:**
   Initialize the SQLite database using Prisma:
   ```bash
   npx prisma db push
   ```
   *(This creates a local `dev.db` file).*

4. **Run locally (Development):**
   ```bash
   npm run dev
   ```
   *This will run the script once using `tsx`, open a visible browser (for debugging), scrape the messages, push them to Telegram, and close.*

## Production Deployment (PM2 / VPS)

The bot is designed as a one-shot script. To run it continuously on a server, we use **PM2**'s cron scheduling feature. By default, it runs every 20 minutes in a headless browser environment.

1. **Build the application:**
   Compile the TypeScript code to plain JavaScript for lower Memory/CPU overhead:
   ```bash
   npm run build
   ```

2. **Install PM2 (if not already installed):**
   ```bash
   npm install -g pm2
   ```

3. **Start the Bot Daemon:**
   Use the provided npm script which triggers the PM2 ecosystem config:
   ```bash
   npm run pm2:start
   ```

### PM2 Management Commands

Once deployed, you can manage the bot easily via npm scripts:

- **Check Live Logs:** `npm run pm2:logs`
- **Stop the Bot:** `npm run pm2:stop`
- **Delete Daemon completely:** `npm run pm2:delete`

If your server reboots, make sure PM2 starts automatically:
```bash
pm2 save
pm2 startup
```

## Architecture Notes
- **Playwright** is used because the Autogestión platform relies on heavy Client-Side Rendering (Angular), requiring an actual browser context rather than simple cURL/Axios scraping.
- **Hexagonal Architecture** separates the infrastructure (Prisma, Telegram API, Playwright) from the business logic (Entities and UseCases).
- Idempotency is handled locally using `prisma upsert`. Messages are stored by their unique Autogestión ID, and filtered by a `sentToTelegram` boolean flag before notifying the user.
