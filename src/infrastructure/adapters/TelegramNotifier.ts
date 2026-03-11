import TelegramBot from "node-telegram-bot-api";
import { MessageNotifier } from "../../domain/ports/MessageNotifier";
import { Message } from "../../domain/entities/Message";

export class TelegramNotifier implements MessageNotifier {
  private readonly bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token);
  }

  async notify(chatId: string, messages: Message[]): Promise<void> {
    for (const msg of messages) {
      const text = this.formatMessage(msg);
      await this.bot.sendMessage(chatId, text, { parse_mode: "HTML" });
    }
  }

  private formatMessage(msg: Message): string {
    const lines = [
      `<b>📬 Nuevo mensaje en Autogestión</b>`,
      ``,
      `<b>🎓 Clase:</b> ${this.escapeHtml(msg.class || 'No especificada')}`,
      `<b>👤 De:</b> ${this.escapeHtml(msg.sender)}`,
      `<b>📅 Fecha:</b> ${this.escapeHtml(msg.date)}`,
      `<b>📌 Asunto:</b> ${this.escapeHtml(msg.title)}`,
    ];

    if (msg.body) {
      lines.push(``, `💬 ${this.escapeHtml(msg.body)}`);
    }

    if (msg.hasAttachments) {
      lines.push(``, `📎 Tiene archivos adjuntos`);
    }

    return lines.join("\n");
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
