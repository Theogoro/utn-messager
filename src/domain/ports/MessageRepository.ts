import { Message } from "../entities/Message";

export interface MessageRepository {
  saveMessages(messages: Message[], studentId: number): Promise<void>;
  getUnsentMessages(studentId: number): Promise<Message[]>;
  markAsSent(messageIds: string[]): Promise<void>;
}
