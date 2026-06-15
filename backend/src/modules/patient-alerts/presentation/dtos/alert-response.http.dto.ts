import { ApiProperty } from "@nestjs/swagger";
import { AlertType } from "../../domain/enums/alert-type.enum";
import { Severity } from "../../domain/enums/severity.enum";

export class AlertResponseHttpDto {
  @ApiProperty({ description: "UUID de la alerta" })
  id!: string;

  @ApiProperty({ description: "UUID del paciente" })
  patientId!: string;

  @ApiProperty({ enum: AlertType })
  type!: AlertType;

  @ApiProperty({ enum: Severity })
  severity!: Severity;

  @ApiProperty({ description: "Mensaje de la alerta" })
  message!: string;

  @ApiProperty({ description: "Indica si la alerta está activa" })
  isActive!: boolean;

  @ApiProperty({ description: "Fecha de creación" })
  createdAt!: Date;

  @ApiProperty({ description: "Fecha de última actualización" })
  updatedAt!: Date;
}
