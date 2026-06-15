import { DomainException } from "./domain.exception";

export class InvalidPatientIdException extends DomainException {
  constructor() {
    super("Formato de ID de paciente inválido");
  }
}
