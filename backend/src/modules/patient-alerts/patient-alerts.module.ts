import { Module } from "@nestjs/common";
import { PrismaService } from "./infrastructure/persistence/prisma/prisma.service";
import { PrismaPatientAlertRepository } from "./infrastructure/persistence/repositories/prisma-patient-alert.repository";
import { PrismaUnitOfWork } from "./infrastructure/persistence/prisma/prisma.unit-of-work";
import { PATIENT_ALERT_REPOSITORY } from "./domain/repositories/patient-alert.repository.interface";
import { UNIT_OF_WORK } from "./application/use-cases/create-alert.use-case";
import { CreateAlertUseCase } from "./application/use-cases/create-alert.use-case";
import { UpdateAlertUseCase } from "./application/use-cases/update-alert.use-case";
import { DeleteAlertUseCase } from "./application/use-cases/delete-alert.use-case";
import { GetPatientAlertsUseCase } from "./application/use-cases/get-patient-alerts.use-case";
import { PatientAlertController } from "./presentation/controllers/patient-alert.controller";
import { DomainExceptionFilter } from "../../core/filters/domain-exception.filter";

@Module({
  controllers: [PatientAlertController],
  providers: [
    PrismaService,
    {
      provide: PATIENT_ALERT_REPOSITORY,
      useClass: PrismaPatientAlertRepository,
    },
    {
      provide: UNIT_OF_WORK,
      useClass: PrismaUnitOfWork,
    },
    CreateAlertUseCase,
    UpdateAlertUseCase,
    DeleteAlertUseCase,
    GetPatientAlertsUseCase,
    DomainExceptionFilter,
  ],
  exports: [CreateAlertUseCase, UpdateAlertUseCase, GetPatientAlertsUseCase],
})
export class PatientAlertsModule {}
