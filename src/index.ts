import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { NotifyNewMessagesUseCase } from "./application/usecases/NotifyNewMessagesUseCase";
import { PlaywrightMessageFetcher } from "./infrastructure/adapters/PlaywrightMessageFetcher";
import { PrismaMessageRepository } from "./infrastructure/adapters/PrismaMessageRepository";
import { PrismaStudentRepository } from "./infrastructure/adapters/PrismaStudentRepository";
import { TelegramNotifier } from "./infrastructure/adapters/TelegramNotifier";
import { Credentials } from "./domain/entities/Credentials";

async function main(): Promise<void> {
  // Validate environment variables
  const user = process.env.UTN_USER;
  const service = process.env.UTN_SERVICE;
  const password = process.env.UTN_PASSWORD;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!user || !service || !password) {
    throw new Error(
      "Missing UTN credentials. Set UTN_USER, UTN_SERVICE, and UTN_PASSWORD in .env"
    );
  }

  if (!telegramToken || !telegramChatId) {
    throw new Error(
      "Missing Telegram config. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env"
    );
  }

  const credentials: Credentials = { user, service, password };

  // Wire dependencies (composition root)
  const prisma = new PrismaClient({} as any);

  try {
    const messageFetcher = new PlaywrightMessageFetcher();
    const messageRepository = new PrismaMessageRepository(prisma);
    const studentRepository = new PrismaStudentRepository(prisma);
    const telegramNotifier = new TelegramNotifier(telegramToken);

    const notifyNewMessages = new NotifyNewMessagesUseCase(
      messageFetcher,
      messageRepository,
      studentRepository,
      telegramNotifier
    );

    await notifyNewMessages.execute(credentials, telegramChatId);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
