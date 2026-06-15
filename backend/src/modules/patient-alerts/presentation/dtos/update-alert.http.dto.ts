import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
} from "class-validator";
import { AlertType } from "../../domain/enums/alert-type.enum";
import { Severity } from "../../domain/enums/severity.enum";

export class UpdateAlertHttpDto {
  @ApiPropertyOptional({ enum: AlertType, description: "Tipo de alerta" })
  @IsEnum(AlertType, { message: "El tipo de alerta debe ser válido" })
  @IsOptional()
  type?: AlertType;

  @ApiPropertyOptional({ enum: Severity, description: "Nivel de severidad de la alerta" })
  @IsEnum(Severity, { message: "La severidad debe ser válida" })
  @IsOptional()
  severity?: Severity;

  @ApiPropertyOptional({
    description: "Mensaje de la alerta",
    minLength: 3,
    maxLength: 500,
  })
  @IsString({ message: "El mensaje debe ser un texto" })
  @MinLength(3, { message: "El mensaje debe tener al menos 3 caracteres" })
  @MaxLength(500, { message: "El mensaje no puede exceder 500 caracteres" })
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ description: "Indica si la alerta está activa" })
  @IsBoolean({ message: "El estado activo debe ser un valor booleano" })
  @IsOptional()
  isActive?: boolean;
}
