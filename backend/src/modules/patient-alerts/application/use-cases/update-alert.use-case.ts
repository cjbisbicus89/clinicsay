import { Injectable, Inject } from "@nestjs/common";
import { PatientAlert } from "../../domain/entities/patient-alert.entity";
import { AlertMessage } from "../../domain/value-objects/alert-message.vo";
import {
  IPatientAlertRepository,
  PATIENT_ALERT_REPOSITORY,
} from "../../domain/repositories/patient-alert.repository.interface";
import { IUnitOfWork } from "../../domain/repositories/unit-of-work.interface";
import { UpdateAlertApplicationDto } from "../dtos/update-alert.application.dto";
import { AlertResponseDto } from "../dtos/alert-response.dto";
import { PatientAlertNotFoundException } from "../../domain/exceptions/patient-alert-not-found.exception";
import { UNIT_OF_WORK } from "./create-alert.use-case";

@Injectable()
export class UpdateAlertUseCase {
  constructor(
    @Inject(PATIENT_ALERT_REPOSITORY)
    private readonly repository: IPatientAlertRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    alertId: string,
    dto: UpdateAlertApplicationDto,
  ): Promise<AlertResponseDto> {
    return this.unitOfWork.execute(async () => {
      const existingAlert = await this.repository.findById(alertId);

      if (!existingAlert) {
        throw new PatientAlertNotFoundException();
      }

      const updatedAlert = this.applyChanges(existingAlert, dto);

      if (updatedAlert.getIsActive()) {
        const duplicate = await this.repository.findActiveIdenticalExcluding(
          updatedAlert.getPatientId(),
          updatedAlert.getType(),
          updatedAlert.getMessage(),
          alertId,
        );

        updatedAlert.ensureNotDuplicate(duplicate);
      }

      const saved = await this.repository.save(updatedAlert);
      return this.toResponseDto(saved);
    });
  }

  private applyChanges(
    alert: PatientAlert,
    dto: UpdateAlertApplicationDto,
  ): PatientAlert {
    if (dto.type !== undefined) {
      alert.changeType(dto.type);
    }

    if (dto.severity !== undefined) {
      alert.changeSeverity(dto.severity);
    }

    if (dto.message !== undefined) {
      alert.changeMessage(AlertMessage.create(dto.message));
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        alert.activate();
      } else {
        alert.deactivate();
      }
    }

    return alert;
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
