import { Injectable, Inject } from "@nestjs/common";
import {
  IPatientAlertRepository,
  PATIENT_ALERT_REPOSITORY,
} from "../../domain/repositories/patient-alert.repository.interface";
import { PatientAlertNotFoundException } from "../../domain/exceptions/patient-alert-not-found.exception";

@Injectable()
export class DeleteAlertUseCase {
  constructor(
    @Inject(PATIENT_ALERT_REPOSITORY)
    private readonly repository: IPatientAlertRepository,
  ) {}

  async execute(alertId: string): Promise<void> {
    const existing = await this.repository.findById(alertId);

    if (!existing) {
      throw new PatientAlertNotFoundException();
    }

    await this.repository.delete(alertId);
  }
}
