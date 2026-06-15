import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { CreateAlertUseCase } from "../../application/use-cases/create-alert.use-case";
import { UpdateAlertUseCase } from "../../application/use-cases/update-alert.use-case";
import { DeleteAlertUseCase } from "../../application/use-cases/delete-alert.use-case";
import { GetPatientAlertsUseCase } from "../../application/use-cases/get-patient-alerts.use-case";
import { CreateAlertApplicationDto } from "../../application/dtos/create-alert.application.dto";
import { UpdateAlertApplicationDto } from "../../application/dtos/update-alert.application.dto";
import { CreateAlertHttpDto } from "../dtos/create-alert.http.dto";
import { UpdateAlertHttpDto } from "../dtos/update-alert.http.dto";
import { AlertResponseHttpDto } from "../dtos/alert-response.http.dto";

@ApiTags("patient-alerts")
@Controller()
export class PatientAlertController {
  constructor(
    private readonly createAlertUseCase: CreateAlertUseCase,
    private readonly updateAlertUseCase: UpdateAlertUseCase,
    private readonly deleteAlertUseCase: DeleteAlertUseCase,
    private readonly getPatientAlertsUseCase: GetPatientAlertsUseCase,
  ) {}

  @Get("patients/:patientId/alerts")
  @ApiOperation({ summary: "Obtener todas las alertas del paciente" })
  @ApiParam({ name: "patientId", type: String, format: "uuid" })
  @ApiResponse({
    status: 200,
    description: "Lista de alertas del paciente",
    type: [AlertResponseHttpDto],
  })
  async getPatientAlerts(
    @Param("patientId", ParseUUIDPipe)
    patientId: string,
  ): Promise<AlertResponseHttpDto[]> {
    return this.getPatientAlertsUseCase.execute(patientId);
  }

  @Post("patients/:patientId/alerts")
  @ApiOperation({ summary: "Crear una nueva alerta para un paciente" })
  @ApiParam({ name: "patientId", type: String, format: "uuid" })
  @ApiResponse({
    status: 201,
    description: "Alerta creada correctamente",
    type: AlertResponseHttpDto,
  })
  @ApiResponse({ status: 400, description: "Datos de entrada no válidos" })
  @ApiResponse({ status: 409, description: "Alerta activa duplicada" })
  async createAlert(
    @Param("patientId", ParseUUIDPipe)
    patientId: string,
    @Body() dto: CreateAlertHttpDto,
  ): Promise<AlertResponseHttpDto> {
    const applicationDto = new CreateAlertApplicationDto(
      patientId,
      dto.type,
      dto.severity,
      dto.message,
      dto.isActive ?? true,
    );

    return this.createAlertUseCase.execute(applicationDto);
  }

  @Patch("patient-alerts/:alertId")
  @ApiOperation({ summary: "Actualizar una alerta existente" })
  @ApiParam({ name: "alertId", type: String, format: "uuid" })
  @ApiResponse({
    status: 200,
    description: "Alerta actualizada correctamente",
    type: AlertResponseHttpDto,
  })
  @ApiResponse({ status: 400, description: "Datos de entrada no válidos" })
  @ApiResponse({ status: 404, description: "Alerta no encontrada" })
  @ApiResponse({ status: 409, description: "Alerta activa duplicada" })
  async updateAlert(
    @Param("alertId", ParseUUIDPipe)
    alertId: string,
    @Body() dto: UpdateAlertHttpDto,
  ): Promise<AlertResponseHttpDto> {
    const applicationDto = new UpdateAlertApplicationDto(
      dto.type,
      dto.severity,
      dto.message,
      dto.isActive,
    );

    return this.updateAlertUseCase.execute(alertId, applicationDto);
  }

  @Delete("patient-alerts/:alertId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar una alerta permanentemente" })
  @ApiParam({ name: "alertId", type: String, format: "uuid" })
  @ApiResponse({ status: 204, description: "Alerta eliminada correctamente" })
  @ApiResponse({ status: 404, description: "Alerta no encontrada" })
  async deleteAlert(
    @Param("alertId", ParseUUIDPipe)
    alertId: string,
  ): Promise<void> {
    return this.deleteAlertUseCase.execute(alertId);
  }
}
