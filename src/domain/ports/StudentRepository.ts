import { Student } from "../entities/Student";

export interface StudentRepository {
  findOrCreate(user: string, service: string, telegramChatId: string): Promise<Student>;
}
