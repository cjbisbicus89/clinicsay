import { Injectable, Inject } from "@nestjs/common";
import { PatientId } from "../../domain/value-objects/patient-id.vo";
import { PatientAlert } from "../../domain/entities/patient-alert.entity";
import {
  IPatientAlertRepository,
  PATIENT_ALERT_REPOSITORY,
} from "../../domain/repositories/patient-alert.repository.interface";
import { AlertResponseDto } from "../dtos/alert-response.dto";
import { Severity } from "../../domain/enums/severity.enum";

@Injectable()
export class GetPatientAlertsUseCase {
  constructor(
    @Inject(PATIENT_ALERT_REPOSITORY)
    private readonly repository: IPatientAlertRepository,
  ) {}

  async execute(patientIdValue: string): Promise<AlertResponseDto[]> {
    const patientId = PatientId.create(patientIdValue);
    const alerts = await this.repository.findByPatientId(patientId);
    const sorted = this.sortAlerts(alerts);
    return sorted.map((alert) => this.toResponseDto(alert));
  }

  private sortAlerts(alerts: PatientAlert[]): PatientAlert[] {
    const severityOrder = {
      [Severity.HIGH]: 3,
      [Severity.MEDIUM]: 2,
      [Severity.LOW]: 1,
    };

    return [...alerts].sort((a, b) => {
      if (a.getIsActive() !== b.getIsActive()) {
        return a.getIsActive() ? -1 : 1;
      }

      const severityDiff =
        severityOrder[b.getSeverity()] - severityOrder[a.getSeverity()];
      if (severityDiff !== 0) return severityDiff;

      return b.getCreatedAt().getTime() - a.getCreatedAt().getTime();
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
