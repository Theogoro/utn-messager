import { Message } from "../entities/Message";

export interface MessageNotifier {
  notify(chatId: string, messages: Message[]): Promise<void>;
}
