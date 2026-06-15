import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { DomainException } from "../../modules/patient-alerts/domain/exceptions/domain.exception";
import { DuplicateAlertException } from "../../modules/patient-alerts/domain/exceptions/duplicate-alert.exception";
import { PatientAlertNotFoundException } from "../../modules/patient-alerts/domain/exceptions/patient-alert-not-found.exception";
import { InvalidPatientIdException } from "../../modules/patient-alerts/domain/exceptions/invalid-patient-id.exception";
import { InvalidAlertMessageException } from "../../modules/patient-alerts/domain/exceptions/invalid-alert-message.exception";

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.resolveHttpStatus(exception);
    const type = this.resolveType(exception);

    const problemDetails: ProblemDetails = {
      type,
      title: this.resolveTitle(exception),
      status,
      detail: exception.message,
      instance: request.url,
    };

    response.status(status).json(problemDetails);
  }

  private resolveHttpStatus(exception: DomainException): number {
    if (exception instanceof DuplicateAlertException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof PatientAlertNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (
      exception instanceof InvalidPatientIdException ||
      exception instanceof InvalidAlertMessageException
    ) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveType(exception: DomainException): string {
    if (exception instanceof DuplicateAlertException) {
      return "https://clinicsay.com/errors/duplicated-alert";
    }
    if (exception instanceof PatientAlertNotFoundException) {
      return "https://clinicsay.com/errors/alert-not-found";
    }
    if (exception instanceof InvalidPatientIdException) {
      return "https://clinicsay.com/errors/invalid-patient-id";
    }
    if (exception instanceof InvalidAlertMessageException) {
      return "https://clinicsay.com/errors/invalid-alert-message";
    }
    return "https://clinicsay.com/errors/internal-server-error";
  }

  private resolveTitle(exception: DomainException): string {
    if (exception instanceof DuplicateAlertException) {
      return "Alerta duplicada";
    }
    if (exception instanceof PatientAlertNotFoundException) {
      return "Alerta no encontrada";
    }
    if (exception instanceof InvalidPatientIdException) {
      return "ID de paciente inválido";
    }
    if (exception instanceof InvalidAlertMessageException) {
      return "Mensaje de alerta inválido";
    }
    return "Error interno del servidor";
  }
}
