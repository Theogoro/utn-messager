import { Message } from "../entities/Message";
import { Credentials } from "../entities/Credentials";

export interface MessageFetcher {
  fetchMessages(credentials: Credentials): Promise<Message[]>;
}
