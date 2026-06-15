import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { DomainExceptionFilter } from "../../src/core/filters/domain-exception.filter";
import { GlobalExceptionFilter } from "../../src/core/filters/global-exception.filter";
import { PatientAlertController } from "../../src/modules/patient-alerts/presentation/controllers/patient-alert.controller";
import { CreateAlertUseCase } from "../../src/modules/patient-alerts/application/use-cases/create-alert.use-case";
import { UpdateAlertUseCase } from "../../src/modules/patient-alerts/application/use-cases/update-alert.use-case";
import { DeleteAlertUseCase } from "../../src/modules/patient-alerts/application/use-cases/delete-alert.use-case";
import { GetPatientAlertsUseCase } from "../../src/modules/patient-alerts/application/use-cases/get-patient-alerts.use-case";
import { PATIENT_ALERT_REPOSITORY } from "../../src/modules/patient-alerts/domain/repositories/patient-alert.repository.interface";
import { UNIT_OF_WORK } from "../../src/modules/patient-alerts/application/use-cases/create-alert.use-case";
import { InMemoryPatientAlertRepository } from "./in-memory-patient-alert.repository";
import { AlertType } from "../../src/modules/patient-alerts/domain/enums/alert-type.enum";
import { Severity } from "../../src/modules/patient-alerts/domain/enums/severity.enum";

describe("PatientAlertController (e2e)", () => {
  let app: INestApplication;
  let inMemoryRepository: InMemoryPatientAlertRepository;
  const patientId = "550e8400-e29b-41d4-a716-446655440001";

  beforeEach(async () => {
    inMemoryRepository = new InMemoryPatientAlertRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PatientAlertController],
      providers: [
        CreateAlertUseCase,
        UpdateAlertUseCase,
        DeleteAlertUseCase,
        GetPatientAlertsUseCase,
        {
          provide: PATIENT_ALERT_REPOSITORY,
          useValue: inMemoryRepository,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: {
            execute: async <T>(operation: () => Promise<T>): Promise<T> =>
              operation(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(
      new GlobalExceptionFilter(),
      new DomainExceptionFilter(),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /patients/:patientId/alerts", () => {
    it("execute_whenValidInput_createsAlert", async () => {
      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.HIGH,
          message: "Allergy to penicillin",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.type).toBe(AlertType.ALLERGY);
      expect(response.body.severity).toBe(Severity.HIGH);
      expect(response.body.message).toBe("Allergy to penicillin");
      expect(response.body.isActive).toBe(true);
    });

    it("execute_whenInvalidInput_returns400", async () => {
      await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: "INVALID_TYPE",
          severity: Severity.HIGH,
          message: "A",
        })
        .expect(400);
    });

    it("execute_whenDuplicateActiveAlert_returns409", async () => {
      await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.HIGH,
          message: "Allergy to penicillin",
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.HIGH,
          message: "Allergy to penicillin",
        })
        .expect(409);
    });
  });

  describe("GET /patients/:patientId/alerts", () => {
    it("execute_whenAlertsExist_returnsSortedAlerts", async () => {
      await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.HIGH,
          message: "Allergy to penicillin",
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ADMINISTRATIVE,
          severity: Severity.MEDIUM,
          message: "Requires prior authorization",
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/alerts`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].severity).toBe(Severity.HIGH);
      expect(response.body[1].severity).toBe(Severity.MEDIUM);
    });

    it("execute_whenNoAlertsExist_returnsEmptyArray", async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/alerts`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("PATCH /patient-alerts/:alertId", () => {
    it("execute_whenValidInput_updatesAlert", async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.HIGH,
          message: "Allergy to penicillin",
        })
        .expect(201);

      const alertId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/patient-alerts/${alertId}`)
        .send({
          severity: Severity.MEDIUM,
          message: "Updated message",
        })
        .expect(200);

      expect(response.body.severity).toBe(Severity.MEDIUM);
      expect(response.body.message).toBe("Updated message");
    });

    it("execute_whenAlertNotFound_returns404", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patient-alerts/550e8400-e29b-41d4-a716-446655440099`)
        .send({
          severity: Severity.LOW,
        })
        .expect(404);

      expect(response.body.title).toBe("Alert Not Found");
    });

    it("execute_whenDuplicateActiveAlert_returns409", async () => {
      await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.HIGH,
          message: "Allergy to penicillin",
        })
        .expect(201);

      const createResponse = await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.LOW,
          message: "Secondary allergy note",
        })
        .expect(201);

      const alertId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/patient-alerts/${alertId}`)
        .send({
          message: "Allergy to penicillin",
        })
        .expect(409);

      expect(response.body.title).toBe("Duplicated Alert");
    });
  });

  describe("DELETE /patient-alerts/:alertId", () => {
    it("execute_whenAlertExists_deletesAlert", async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/patients/${patientId}/alerts`)
        .send({
          type: AlertType.ALLERGY,
          severity: Severity.HIGH,
          message: "Allergy to penicillin",
        })
        .expect(201);

      const alertId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/patient-alerts/${alertId}`)
        .expect(204);

      const getResponse = await request(app.getHttpServer())
        .get(`/patients/${patientId}/alerts`)
        .expect(200);

      expect(getResponse.body).toHaveLength(0);
    });

    it("execute_whenAlertNotFound_returns404", async () => {
      await request(app.getHttpServer())
        .delete(`/patient-alerts/550e8400-e29b-41d4-a716-446655440099`)
        .expect(404);
    });
  });
});
