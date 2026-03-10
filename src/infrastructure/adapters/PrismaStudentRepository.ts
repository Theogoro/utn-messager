import { PrismaClient } from "@prisma/client";
import { StudentRepository } from "../../domain/ports/StudentRepository";
import { Student } from "../../domain/entities/Student";

export class PrismaStudentRepository implements StudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findOrCreate(
    user: string,
    service: string,
    telegramChatId: string
  ): Promise<Student> {
    const student = await this.prisma.student.upsert({
      where: { user_service: { user, service } },
      update: { telegramChatId },
      create: { user, service, telegramChatId },
    });

    return {
      id: student.id,
      user: student.user,
      service: student.service,
      telegramChatId: student.telegramChatId,
    };
  }
}
