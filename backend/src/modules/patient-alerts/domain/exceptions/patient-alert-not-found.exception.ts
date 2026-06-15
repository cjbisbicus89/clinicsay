import { DomainException } from "./domain.exception";

export class PatientAlertNotFoundException extends DomainException {
  constructor() {
    super("Alerta del paciente no encontrada");
  }
}
