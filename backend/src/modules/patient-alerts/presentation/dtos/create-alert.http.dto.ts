import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
} from "class-validator";
import { AlertType } from "../../domain/enums/alert-type.enum";
import { Severity } from "../../domain/enums/severity.enum";

export class CreateAlertHttpDto {
  @ApiProperty({ enum: AlertType, description: "Tipo de alerta" })
  @IsEnum(AlertType, { message: "El tipo de alerta debe ser válido" })
  @IsNotEmpty({ message: "El tipo de alerta es obligatorio" })
  type!: AlertType;

  @ApiProperty({ enum: Severity, description: "Nivel de severidad de la alerta" })
  @IsEnum(Severity, { message: "La severidad debe ser válida" })
  @IsNotEmpty({ message: "La severidad es obligatoria" })
  severity!: Severity;

  @ApiProperty({
    description: "Mensaje de la alerta",
    minLength: 3,
    maxLength: 500,
    example: "Alergia a la penicilina",
  })
  @IsString({ message: "El mensaje debe ser un texto" })
  @IsNotEmpty({ message: "El mensaje es obligatorio" })
  @MinLength(3, { message: "El mensaje debe tener al menos 3 caracteres" })
  @MaxLength(500, { message: "El mensaje no puede exceder 500 caracteres" })
  message!: string;

  @ApiProperty({
    required: false,
    default: true,
    description: "Indica si la alerta está activa",
  })
  @IsBoolean({ message: "El estado activo debe ser un valor booleano" })
  @IsOptional()
  isActive?: boolean;
}
