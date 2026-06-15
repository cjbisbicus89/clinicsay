import { IPatientAlertRepository } from "../../src/modules/patient-alerts/domain/repositories/patient-alert.repository.interface";
import { PatientAlert } from "../../src/modules/patient-alerts/domain/entities/patient-alert.entity";
import { PatientId } from "../../src/modules/patient-alerts/domain/value-objects/patient-id.vo";
import { AlertMessage } from "../../src/modules/patient-alerts/domain/value-objects/alert-message.vo";
import { AlertType } from "../../src/modules/patient-alerts/domain/enums/alert-type.enum";

export class InMemoryPatientAlertRepository implements IPatientAlertRepository {
  private alerts: PatientAlert[] = [];

  async save(alert: PatientAlert, _tx?: unknown): Promise<PatientAlert> {
    const index = this.alerts.findIndex((a) => a.getId().equals(alert.getId()));
    if (index >= 0) {
      this.alerts[index] = alert;
    } else {
      this.alerts.push(alert);
    }
    return alert;
  }

  async findById(id: string, _tx?: unknown): Promise<PatientAlert | null> {
    return this.alerts.find((a) => a.getId().getValue() === id) ?? null;
  }

  async findByPatientId(
    patientId: PatientId,
    _tx?: unknown,
  ): Promise<PatientAlert[]> {
    return this.alerts.filter((a) => a.getPatientId().equals(patientId));
  }

  async findActiveIdentical(
    patientId: PatientId,
    type: AlertType,
    message: AlertMessage,
    _tx?: unknown,
  ): Promise<PatientAlert | null> {
    return (
      this.alerts.find(
        (a) =>
          a.getPatientId().equals(patientId) &&
          a.getType() === type &&
          a.getMessage().equals(message) &&
          a.getIsActive(),
      ) ?? null
    );
  }

  async findActiveIdenticalExcluding(
    patientId: PatientId,
    type: AlertType,
    message: AlertMessage,
    excludeId: string,
    _tx?: unknown,
  ): Promise<PatientAlert | null> {
    return (
      this.alerts.find(
        (a) =>
          a.getId().getValue() !== excludeId &&
          a.getPatientId().equals(patientId) &&
          a.getType() === type &&
          a.getMessage().equals(message) &&
          a.getIsActive(),
      ) ?? null
    );
  }

  async delete(id: string, _tx?: unknown): Promise<void> {
    this.alerts = this.alerts.filter((a) => a.getId().getValue() !== id);
  }

  clear(): void {
    this.alerts = [];
  }
}
