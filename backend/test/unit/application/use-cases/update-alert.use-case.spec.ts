import { Test, TestingModule } from "@nestjs/testing";
import { UpdateAlertUseCase } from "../../../../src/modules/patient-alerts/application/use-cases/update-alert.use-case";
import { UpdateAlertApplicationDto } from "../../../../src/modules/patient-alerts/application/dtos/update-alert.application.dto";
import {
  PATIENT_ALERT_REPOSITORY,
} from "../../../../src/modules/patient-alerts/domain/repositories/patient-alert.repository.interface";
import { IUnitOfWork } from "../../../../src/modules/patient-alerts/domain/repositories/unit-of-work.interface";
import { UNIT_OF_WORK } from "../../../../src/modules/patient-alerts/application/use-cases/create-alert.use-case";
import { DuplicateAlertException } from "../../../../src/modules/patient-alerts/domain/exceptions/duplicate-alert.exception";
import { PatientAlertNotFoundException } from "../../../../src/modules/patient-alerts/domain/exceptions/patient-alert-not-found.exception";
import { AlertType } from "../../../../src/modules/patient-alerts/domain/enums/alert-type.enum";
import { Severity } from "../../../../src/modules/patient-alerts/domain/enums/severity.enum";
import { PatientAlert } from "../../../../src/modules/patient-alerts/domain/entities/patient-alert.entity";
import { PatientId } from "../../../../src/modules/patient-alerts/domain/value-objects/patient-id.vo";
import { AlertMessage } from "../../../../src/modules/patient-alerts/domain/value-objects/alert-message.vo";
import { InMemoryPatientAlertRepository } from "../../../shared/in-memory-patient-alert.repository";

describe("UpdateAlertUseCase", () => {
  let useCase: UpdateAlertUseCase;
  let inMemoryRepository: InMemoryPatientAlertRepository;
  let mockUnitOfWork: jest.Mocked<IUnitOfWork>;

  beforeEach(async () => {
    inMemoryRepository = new InMemoryPatientAlertRepository();

    mockUnitOfWork = {
      execute: jest.fn((operation) => operation()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAlertUseCase,
        {
          provide: PATIENT_ALERT_REPOSITORY,
          useValue: inMemoryRepository,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: mockUnitOfWork,
        },
      ],
    }).compile();

    useCase = module.get<UpdateAlertUseCase>(UpdateAlertUseCase);
  });

  afterEach(() => {
    inMemoryRepository.clear();
  });

  describe("execute", () => {
    const alertId = "550e8400-e29b-41d4-a716-446655440000";
    const patientId = "550e8400-e29b-41d4-a716-446655440001";

    it("execute_whenAlertExistsAndNoDuplicate_updatesAlert", async () => {
      const existingAlert = PatientAlert.create(
        PatientId.create(patientId),
        AlertType.ALLERGY,
        Severity.HIGH,
        AlertMessage.create("Allergy to penicillin"),
        true,
      );

      await inMemoryRepository.save(existingAlert);

      const dto = new UpdateAlertApplicationDto(
        undefined,
        Severity.MEDIUM,
        undefined,
        undefined,
      );

      const result = await useCase.execute(existingAlert.getId().getValue(), dto);

      expect(result.severity).toBe(Severity.MEDIUM);
    });

    it("execute_whenAlertNotFound_throwsPatientAlertNotFoundException", async () => {
      const dto = new UpdateAlertApplicationDto();

      await expect(useCase.execute(alertId, dto)).rejects.toThrow(
        PatientAlertNotFoundException,
      );
    });

    it("execute_whenActiveDuplicateExists_throwsDuplicateAlertException", async () => {
      const existingAlert = PatientAlert.create(
        PatientId.create(patientId),
        AlertType.ALLERGY,
        Severity.HIGH,
        AlertMessage.create("Allergy to penicillin"),
        true,
      );

      const duplicateAlert = PatientAlert.create(
        PatientId.create(patientId),
        AlertType.ALLERGY,
        Severity.HIGH,
        AlertMessage.create("Allergy to penicillin"),
        true,
      );

      await inMemoryRepository.save(existingAlert);
      await inMemoryRepository.save(duplicateAlert);

      const dto = new UpdateAlertApplicationDto(
        AlertType.ALLERGY,
        undefined,
        "Allergy to penicillin",
        true,
      );

      await expect(useCase.execute(duplicateAlert.getId().getValue(), dto)).rejects.toThrow(
        DuplicateAlertException,
      );
    });
  });
});
