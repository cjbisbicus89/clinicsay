import { Injectable, Inject } from "@nestjs/common";
import { PatientAlert } from "../../domain/entities/patient-alert.entity";
import { PatientId } from "../../domain/value-objects/patient-id.vo";
import { AlertMessage } from "../../domain/value-objects/alert-message.vo";
import { DuplicateAlertException } from "../../domain/exceptions/duplicate-alert.exception";
import {
  IPatientAlertRepository,
  PATIENT_ALERT_REPOSITORY,
} from "../../domain/repositories/patient-alert.repository.interface";
import { IUnitOfWork } from "../../domain/repositories/unit-of-work.interface";
import { CreateAlertApplicationDto } from "../dtos/create-alert.application.dto";
import { AlertResponseDto } from "../dtos/alert-response.dto";

export const UNIT_OF_WORK = Symbol("UNIT_OF_WORK");

@Injectable()
export class CreateAlertUseCase {
  constructor(
    @Inject(PATIENT_ALERT_REPOSITORY)
    private readonly repository: IPatientAlertRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(dto: CreateAlertApplicationDto): Promise<AlertResponseDto> {
    return this.unitOfWork.execute(async () => {
      const patientId = PatientId.create(dto.patientId);
      const message = AlertMessage.create(dto.message);

      const existing = await this.repository.findActiveIdentical(
        patientId,
        dto.type,
        message,
      );

      if (existing) {
        throw new DuplicateAlertException();
      }

      const alert = PatientAlert.create(
        patientId,
        dto.type,
        dto.severity,
        message,
        dto.isActive,
      );

      const saved = await this.repository.save(alert);

      return this.toResponseDto(saved);
    });
  }

  private toResponseDto(alert: PatientAlert): AlertResponseDto {
    return new AlertResponseDto(
      alert.getId().getValue(),
      alert.getPatientId().getValue(),
      alert.getType(),
      alert.getSeverity(),
      alert.getMessage().getValue(),
      alert.getIsActive(),
      alert.getCreatedAt(),
      alert.getUpdatedAt(),
    );
  }
}
