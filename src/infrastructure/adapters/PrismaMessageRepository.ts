import { PrismaClient } from "@prisma/client";
import { MessageRepository } from "../../domain/ports/MessageRepository";
import { Message } from "../../domain/entities/Message";

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveMessages(messages: Message[], studentId: number): Promise<void> {
    for (const msg of messages) {
      await this.prisma.dbMessage.upsert({
        where: { id: msg.id },
        update: {}, // don't overwrite existing messages
        create: {
          id: msg.id,
          title: msg.title,
          body: msg.body,
          date: msg.date,
          sender: msg.sender,
          raw: msg.raw,
          hasAttachments: msg.hasAttachments,
          class: msg.class,
          sentToTelegram: false,
          studentId,
        },
      });
    }
  }

  async getUnsentMessages(studentId: number): Promise<Message[]> {
    const rows = await this.prisma.dbMessage.findMany({
      where: { studentId, sentToTelegram: false },
      orderBy: { date: "asc" },
    });

    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      date: row.date,
      sender: row.sender,
      raw: row.raw,
      hasAttachments: row.hasAttachments,
      class: row.class,
    }));
  }

  async markAsSent(messageIds: string[]): Promise<void> {
    await this.prisma.dbMessage.updateMany({
      where: { id: { in: messageIds } },
      data: { sentToTelegram: true },
    });
  }
}
