import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { IUnitOfWork } from "@modules/patient-alerts/domain/repositories/unit-of-work.interface";

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(operation);
  }
}
