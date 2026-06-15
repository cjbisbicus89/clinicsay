import { PatientAlert as PrismaAlert } from "@prisma/client";
import { PatientAlert } from "../../../domain/entities/patient-alert.entity";
import { AlertType } from "../../../domain/enums/alert-type.enum";
import { Severity } from "../../../domain/enums/severity.enum";
import { PatientId } from "../../../domain/value-objects/patient-id.vo";
import { AlertMessage } from "../../../domain/value-objects/alert-message.vo";
import { DomainException } from "../../../domain/exceptions/domain.exception";

export class PatientAlertMapper {
  static toDomain(prismaAlert: PrismaAlert): PatientAlert {
    const type = this.toAlertType(prismaAlert.type);
    const severity = this.toSeverity(prismaAlert.severity);

    return PatientAlert.reconstitute(
      PatientId.create(prismaAlert.id),
      PatientId.create(prismaAlert.patientId),
      type,
      severity,
      AlertMessage.create(prismaAlert.message),
      prismaAlert.isActive,
      prismaAlert.createdAt,
      prismaAlert.updatedAt,
    );
  }

  static toPrisma(alert: PatientAlert): {
    id: string;
    patientId: string;
    type: AlertType;
    severity: Severity;
    message: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: alert.getId().getValue(),
      patientId: alert.getPatientId().getValue(),
      type: alert.getType(),
      severity: alert.getSeverity(),
      message: alert.getMessage().getValue(),
      isActive: alert.getIsActive(),
      createdAt: alert.getCreatedAt(),
      updatedAt: alert.getUpdatedAt(),
    };
  }

  private static isAlertType(value: string): value is AlertType {
    return Object.values(AlertType).some((v) => v === value);
  }

  private static isSeverity(value: string): value is Severity {
    return Object.values(Severity).some((v) => v === value);
  }

  private static toAlertType(value: string): AlertType {
    if (!this.isAlertType(value)) {
      throw new DomainException(`Valor de tipo de alerta no válido: ${value}`);
    }
    return value;
  }

  private static toSeverity(value: string): Severity {
    if (!this.isSeverity(value)) {
      throw new DomainException(`Valor de severidad no válido: ${value}`);
    }
    return value;
  }
}
