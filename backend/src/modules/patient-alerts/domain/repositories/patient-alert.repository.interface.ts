import { PatientAlert } from "../entities/patient-alert.entity";
import { PatientId } from "../value-objects/patient-id.vo";
import { AlertMessage } from "../value-objects/alert-message.vo";
import { AlertType } from "../enums/alert-type.enum";

export const PATIENT_ALERT_REPOSITORY = Symbol("PATIENT_ALERT_REPOSITORY");

export interface IPatientAlertRepository {
  save(alert: PatientAlert, tx?: unknown): Promise<PatientAlert>;
  findById(id: string, tx?: unknown): Promise<PatientAlert | null>;
  findByPatientId(patientId: PatientId, tx?: unknown): Promise<PatientAlert[]>;
  findActiveIdentical(
    patientId: PatientId,
    type: AlertType,
    message: AlertMessage,
    tx?: unknown,
  ): Promise<PatientAlert | null>;
  findActiveIdenticalExcluding(
    patientId: PatientId,
    type: AlertType,
    message: AlertMessage,
    excludeId: string,
    tx?: unknown,
  ): Promise<PatientAlert | null>;
  delete(id: string, tx?: unknown): Promise<void>;
}
