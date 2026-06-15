import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const problemDetails = this.toProblemDetails(exception, request.url);

    response.status(problemDetails.status).json(problemDetails);
  }

  private isPrismaKnownRequestError(
    error: unknown,
  ): error is { code: string; message: string } {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }

  private isPrismaValidationError(
    error: unknown,
  ): error is { message: string } {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      !(error instanceof HttpException)
    );
  }

  private toProblemDetails(
    exception: unknown,
    instanceUrl: string,
  ): ProblemDetails {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      let detail: string;
      if (typeof response === "string") {
        detail = response;
      } else if (
        typeof response === "object" &&
        response !== null &&
        "message" in response
      ) {
        const candidate = response.message;
        detail =
          typeof candidate === "string" ? candidate : JSON.stringify(response);
      } else {
        detail = JSON.stringify(response);
      }

      return {
        type: "https://clinicsay.com/errors/validation-error",
        title: "Error de validación",
        status,
        detail,
        instance: instanceUrl,
      };
    }

    if (this.isPrismaKnownRequestError(exception)) {
      return this.handlePrismaError(exception, instanceUrl);
    }

    if (this.isPrismaValidationError(exception)) {
      return {
        type: "https://clinicsay.com/errors/validation-error",
        title: "Error de validación",
        status: HttpStatus.BAD_REQUEST,
        detail: exception.message,
        instance: instanceUrl,
      };
    }

    const message =
      exception instanceof Error ? exception.message : "Error interno del servidor";

    return {
      type: "https://clinicsay.com/errors/internal-server-error",
      title: "Error interno del servidor",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: message,
      instance: instanceUrl,
    };
  }

  private handlePrismaError(
    error: { code: string; message: string },
    instanceUrl: string,
  ): ProblemDetails {
    switch (error.code) {
      case "P2002":
        return {
          type: "https://clinicsay.com/errors/unique-constraint",
          title: "Violación de restricción única",
          status: HttpStatus.CONFLICT,
          detail: error.message,
          instance: instanceUrl,
        };
      case "P2025":
        return {
          type: "https://clinicsay.com/errors/record-not-found",
          title: "Registro no encontrado",
          status: HttpStatus.NOT_FOUND,
          detail: error.message,
          instance: instanceUrl,
        };
      default:
        return {
          type: "https://clinicsay.com/errors/database-error",
          title: "Error de base de datos",
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: error.message,
          instance: instanceUrl,
        };
    }
  }
}
