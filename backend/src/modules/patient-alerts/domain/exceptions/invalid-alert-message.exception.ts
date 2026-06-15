import { DomainException } from "./domain.exception";

export class InvalidAlertMessageException extends DomainException {
  constructor() {
    super("El mensaje de la alerta debe tener entre 3 y 500 caracteres");
  }
}
