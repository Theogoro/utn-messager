import { MessageFetcher } from "../../domain/ports/MessageFetcher";
import { MessageRepository } from "../../domain/ports/MessageRepository";
import { StudentRepository } from "../../domain/ports/StudentRepository";
import { MessageNotifier } from "../../domain/ports/MessageNotifier";
import { Credentials } from "../../domain/entities/Credentials";

export class NotifyNewMessagesUseCase {
  constructor(
    private readonly messageFetcher: MessageFetcher,
    private readonly messageRepository: MessageRepository,
    private readonly studentRepository: StudentRepository,
    private readonly messageNotifier: MessageNotifier
  ) {}

  async execute(credentials: Credentials, telegramChatId: string): Promise<void> {
    // 1. Find or create the student
    const student = await this.studentRepository.findOrCreate(
      credentials.user,
      credentials.service,
      telegramChatId
    );

    // 2. Fetch messages from UTN
    console.log("📡 Fetching messages from UTN...");
    const messages = await this.messageFetcher.fetchMessages(credentials);
    console.log(`📬 Fetched ${messages.length} messages.`);

    // 3. Save all fetched messages (upsert — won't overwrite existing ones)
    await this.messageRepository.saveMessages(messages, student.id);
    console.log("💾 Messages saved to database.");

    // 4. Get unsent messages
    const unsent = await this.messageRepository.getUnsentMessages(student.id);

    if (unsent.length === 0) {
      console.log("✅ No new messages to send.");
      return;
    }

    // 5. Send unsent messages to Telegram
    console.log(`📤 Sending ${unsent.length} new message(s) to Telegram...`);
    await this.messageNotifier.notify(student.telegramChatId, unsent);

    // 6. Mark as sent
    const sentIds = unsent.map((msg) => msg.id);
    await this.messageRepository.markAsSent(sentIds);
    console.log("✅ All new messages sent and marked.");
  }
}
