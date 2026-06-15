import { Test, TestingModule } from "@nestjs/testing";
import { DeleteAlertUseCase } from "../../../../src/modules/patient-alerts/application/use-cases/delete-alert.use-case";
import {
  IPatientAlertRepository,
  PATIENT_ALERT_REPOSITORY,
} from "../../../../src/modules/patient-alerts/domain/repositories/patient-alert.repository.interface";
import { PatientAlertNotFoundException } from "../../../../src/modules/patient-alerts/domain/exceptions/patient-alert-not-found.exception";
import { AlertType } from "../../../../src/modules/patient-alerts/domain/enums/alert-type.enum";
import { Severity } from "../../../../src/modules/patient-alerts/domain/enums/severity.enum";
import { PatientAlert } from "../../../../src/modules/patient-alerts/domain/entities/patient-alert.entity";
import { PatientId } from "../../../../src/modules/patient-alerts/domain/value-objects/patient-id.vo";
import { AlertMessage } from "../../../../src/modules/patient-alerts/domain/value-objects/alert-message.vo";

describe("DeleteAlertUseCase", () => {
  let useCase: DeleteAlertUseCase;
  let mockRepository: jest.Mocked<IPatientAlertRepository>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByPatientId: jest.fn(),
      findActiveIdentical: jest.fn(),
      findActiveIdenticalExcluding: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAlertUseCase,
        {
          provide: PATIENT_ALERT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteAlertUseCase>(DeleteAlertUseCase);
  });

  describe("execute", () => {
    const alertId = "550e8400-e29b-41d4-a716-446655440000";

    it("execute_whenAlertExists_deletesAlert", async () => {
      const existingAlert = PatientAlert.create(
        PatientId.create("550e8400-e29b-41d4-a716-446655440001"),
        AlertType.ALLERGY,
        Severity.HIGH,
        AlertMessage.create("Allergy to penicillin"),
        true,
      );

      mockRepository.findById.mockResolvedValue(existingAlert);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(alertId);

      expect(mockRepository.findById).toHaveBeenCalledWith(alertId);
      expect(mockRepository.delete).toHaveBeenCalledWith(alertId);
    });

    it("execute_whenAlertNotFound_throwsPatientAlertNotFoundException", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(alertId)).rejects.toThrow(
        PatientAlertNotFoundException,
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(alertId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
