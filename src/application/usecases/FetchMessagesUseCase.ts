import { MessageFetcher } from "../../domain/ports/MessageFetcher";
import { Message } from "../../domain/entities/Message";
import { Credentials } from "../../domain/entities/Credentials";

export class FetchMessagesUseCase {
  constructor(private readonly messageFetcher: MessageFetcher) {}

  async execute(): Promise<Message[]> {
    const user = process.env.UTN_USER;
    const service = process.env.UTN_SERVICE;
    const password = process.env.UTN_PASSWORD;

    if (!user || !service || !password) {
      throw new Error(
        "Missing UTN credentials. Set UTN_USER, UTN_SERVICE, and UTN_PASSWORD in .env"
      );
    }

    const credentials: Credentials = { user, service, password };

    return this.messageFetcher.fetchMessages(credentials);
  }
}
