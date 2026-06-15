import { DomainException } from "./domain.exception";

export class DuplicateAlertException extends DomainException {
  constructor() {
    super("Ya existe una alerta activa idéntica para este paciente");
  }
}
