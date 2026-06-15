import { AlertType } from "../../domain/enums/alert-type.enum";
import { Severity } from "../../domain/enums/severity.enum";

export class CreateAlertApplicationDto {
  constructor(
    public readonly patientId: string,
    public readonly type: AlertType,
    public readonly severity: Severity,
    public readonly message: string,
    public readonly isActive: boolean = true,
  ) {}
}
