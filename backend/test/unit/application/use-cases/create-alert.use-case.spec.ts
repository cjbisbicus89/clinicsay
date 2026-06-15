import { Test, TestingModule } from "@nestjs/testing";
import { CreateAlertUseCase } from "../../../../src/modules/patient-alerts/application/use-cases/create-alert.use-case";
import { CreateAlertApplicationDto } from "../../../../src/modules/patient-alerts/application/dtos/create-alert.application.dto";
import {
  PATIENT_ALERT_REPOSITORY,
} from "../../../../src/modules/patient-alerts/domain/repositories/patient-alert.repository.interface";
import { IUnitOfWork } from "../../../../src/modules/patient-alerts/domain/repositories/unit-of-work.interface";
import { UNIT_OF_WORK } from "../../../../src/modules/patient-alerts/application/use-cases/create-alert.use-case";
import { DuplicateAlertException } from "../../../../src/modules/patient-alerts/domain/exceptions/duplicate-alert.exception";
import { AlertType } from "../../../../src/modules/patient-alerts/domain/enums/alert-type.enum";
import { Severity } from "../../../../src/modules/patient-alerts/domain/enums/severity.enum";
import { InMemoryPatientAlertRepository } from "../../../shared/in-memory-patient-alert.repository";

describe("CreateAlertUseCase", () => {
  let useCase: CreateAlertUseCase;
  let inMemoryRepository: InMemoryPatientAlertRepository;
  let mockUnitOfWork: jest.Mocked<IUnitOfWork>;

  beforeEach(async () => {
    inMemoryRepository = new InMemoryPatientAlertRepository();

    mockUnitOfWork = {
      execute: jest.fn((operation) => operation()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAlertUseCase,
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

    useCase = module.get<CreateAlertUseCase>(CreateAlertUseCase);
  });

  afterEach(() => {
    inMemoryRepository.clear();
  });

  describe("execute", () => {
    const patientId = "550e8400-e29b-41d4-a716-446655440000";
    const dto = new CreateAlertApplicationDto(
      patientId,
      AlertType.ALLERGY,
      Severity.HIGH,
      "Allergy to penicillin",
      true,
    );

    it("execute_whenNoDuplicateExists_createsAlert", async () => {
      const result = await useCase.execute(dto);

      expect(result.patientId).toBe(patientId);
      expect(result.type).toBe(AlertType.ALLERGY);
      expect(result.severity).toBe(Severity.HIGH);
      expect(result.message).toBe("Allergy to penicillin");
      expect(result.isActive).toBe(true);
    });

    it("execute_whenActiveDuplicateExists_throwsDuplicateAlertException", async () => {
      await useCase.execute(dto);

      await expect(useCase.execute(dto)).rejects.toThrow(
        DuplicateAlertException,
      );
    });
  });
});
