import { Test, TestingModule } from "@nestjs/testing";
import { GetPatientAlertsUseCase } from "../../../../src/modules/patient-alerts/application/use-cases/get-patient-alerts.use-case";
import {
  IPatientAlertRepository,
  PATIENT_ALERT_REPOSITORY,
} from "../../../../src/modules/patient-alerts/domain/repositories/patient-alert.repository.interface";
import { AlertType } from "../../../../src/modules/patient-alerts/domain/enums/alert-type.enum";
import { Severity } from "../../../../src/modules/patient-alerts/domain/enums/severity.enum";
import { PatientAlert } from "../../../../src/modules/patient-alerts/domain/entities/patient-alert.entity";
import { PatientId } from "../../../../src/modules/patient-alerts/domain/value-objects/patient-id.vo";
import { AlertMessage } from "../../../../src/modules/patient-alerts/domain/value-objects/alert-message.vo";

describe("GetPatientAlertsUseCase", () => {
  let useCase: GetPatientAlertsUseCase;
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
        GetPatientAlertsUseCase,
        {
          provide: PATIENT_ALERT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPatientAlertsUseCase>(GetPatientAlertsUseCase);
  });

  describe("execute", () => {
    const patientIdValue = "550e8400-e29b-41d4-a716-446655440000";

    it("execute_whenAlertsExist_returnsSortedAlerts", async () => {
      const alert1 = PatientAlert.create(
        PatientId.create(patientIdValue),
        AlertType.ALLERGY,
        Severity.LOW,
        AlertMessage.create("Low severity alert"),
        false,
      );

      const alert2 = PatientAlert.create(
        PatientId.create(patientIdValue),
        AlertType.MEDICAL_RISK,
        Severity.HIGH,
        AlertMessage.create("High severity alert"),
        true,
      );

      const alert3 = PatientAlert.create(
        PatientId.create(patientIdValue),
        AlertType.SPECIAL_CONDITION,
        Severity.MEDIUM,
        AlertMessage.create("Medium severity alert"),
        true,
      );

      mockRepository.findByPatientId.mockResolvedValue([
        alert1,
        alert2,
        alert3,
      ]);

      const result = await useCase.execute(patientIdValue);

      expect(result).toHaveLength(3);
      expect(result[0].isActive).toBe(true);
      expect(result[0].severity).toBe(Severity.HIGH);
      expect(result[1].isActive).toBe(true);
      expect(result[1].severity).toBe(Severity.MEDIUM);
      expect(result[2].isActive).toBe(false);
    });

    it("execute_whenNoAlertsExist_returnsEmptyArray", async () => {
      mockRepository.findByPatientId.mockResolvedValue([]);

      const result = await useCase.execute(patientIdValue);

      expect(result).toEqual([]);
    });
  });
});
