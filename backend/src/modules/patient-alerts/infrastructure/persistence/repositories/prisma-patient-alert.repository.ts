import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PatientAlertMapper } from "../mappers/patient-alert.mapper";
import { IPatientAlertRepository } from "../../../domain/repositories/patient-alert.repository.interface";
import { PatientAlert } from "../../../domain/entities/patient-alert.entity";
import { PatientId } from "../../../domain/value-objects/patient-id.vo";
import { AlertMessage } from "../../../domain/value-objects/alert-message.vo";
import { AlertType } from "../../../domain/enums/alert-type.enum";

@Injectable()
export class PrismaPatientAlertRepository implements IPatientAlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  private resolveClient(tx: unknown): PrismaService {
    return tx ? (tx as PrismaService) : this.prisma;
  }

  async save(alert: PatientAlert, tx?: unknown): Promise<PatientAlert> {
    const client = this.resolveClient(tx);
    const data = PatientAlertMapper.toPrisma(alert);

    const upserted = await client.patientAlert.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });

    return PatientAlertMapper.toDomain(upserted);
  }

  async findById(id: string, tx?: unknown): Promise<PatientAlert | null> {
    const client = this.resolveClient(tx);
    const found = await client.patientAlert.findUnique({
      where: { id },
    });

    return found ? PatientAlertMapper.toDomain(found) : null;
  }

  async findByPatientId(
    patientId: PatientId,
    tx?: unknown,
  ): Promise<PatientAlert[]> {
    const client = this.resolveClient(tx);
    const found = await client.patientAlert.findMany({
      where: { patientId: patientId.getValue() },
    });

    return found.map((alert) => PatientAlertMapper.toDomain(alert));
  }

  async findActiveIdentical(
    patientId: PatientId,
    type: AlertType,
    message: AlertMessage,
    tx?: unknown,
  ): Promise<PatientAlert | null> {
    const client = this.resolveClient(tx);
    const found = await client.patientAlert.findFirst({
      where: {
        patientId: patientId.getValue(),
        type,
        message: message.getValue(),
        isActive: true,
      },
    });

    return found ? PatientAlertMapper.toDomain(found) : null;
  }

  async findActiveIdenticalExcluding(
    patientId: PatientId,
    type: AlertType,
    message: AlertMessage,
    excludeId: string,
    tx?: unknown,
  ): Promise<PatientAlert | null> {
    const client = this.resolveClient(tx);
    const found = await client.patientAlert.findFirst({
      where: {
        patientId: patientId.getValue(),
        type,
        message: message.getValue(),
        isActive: true,
        NOT: { id: excludeId },
      },
    });

    return found ? PatientAlertMapper.toDomain(found) : null;
  }

  async delete(id: string, tx?: unknown): Promise<void> {
    const client = this.resolveClient(tx);
    await client.patientAlert.delete({
      where: { id },
    });
  }
}
