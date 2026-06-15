import { AlertType } from "../enums/alert-type.enum";
import { Severity } from "../enums/severity.enum";
import { PatientId } from "../value-objects/patient-id.vo";
import { AlertMessage } from "../value-objects/alert-message.vo";
import { DuplicateAlertException } from "../exceptions/duplicate-alert.exception";
import { DomainException } from "../exceptions/domain.exception";

export class PatientAlert {
  private constructor(
    private readonly id: PatientId,
    private readonly patientId: PatientId,
    private type: AlertType,
    private severity: Severity,
    private message: AlertMessage,
    private isActive: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    if (!patientId) {
      throw new DomainException("El identificador del paciente es obligatorio");
    }
    if (!type) {
      throw new DomainException("El tipo de alerta es obligatorio");
    }
    if (!severity) {
      throw new DomainException("La severidad es obligatoria");
    }
    if (!message) {
      throw new DomainException("El mensaje de la alerta es obligatorio");
    }
  }

  static create(
    patientId: PatientId,
    type: AlertType,
    severity: Severity,
    message: AlertMessage,
    isActive: boolean = true,
  ): PatientAlert {
    return new PatientAlert(
      PatientId.generate(),
      patientId,
      type,
      severity,
      message,
      isActive,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    id: PatientId,
    patientId: PatientId,
    type: AlertType,
    severity: Severity,
    message: AlertMessage,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): PatientAlert {
    return new PatientAlert(
      id,
      patientId,
      type,
      severity,
      message,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  activate(): void {
    this.isActive = true;
    this.touch();
  }

  changeType(newType: AlertType): void {
    this.type = newType;
    this.touch();
  }

  changeSeverity(newSeverity: Severity): void {
    this.severity = newSeverity;
    this.touch();
  }

  changeMessage(newMessage: AlertMessage): void {
    this.message = newMessage;
    this.touch();
  }

  touch(): void {
    this.updatedAt = new Date();
  }

  isIdenticalTo(other: PatientAlert): boolean {
    return (
      this.patientId.equals(other.patientId) &&
      this.type === other.type &&
      this.message.equals(other.message)
    );
  }

  ensureNotDuplicate(existing: PatientAlert | null): void {
    if (existing && this.isIdenticalTo(existing)) {
      throw new DuplicateAlertException();
    }
  }

  getId(): PatientId {
    return this.id;
  }

  getPatientId(): PatientId {
    return this.patientId;
  }

  getType(): AlertType {
    return this.type;
  }

  getSeverity(): Severity {
    return this.severity;
  }

  getMessage(): AlertMessage {
    return this.message;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
