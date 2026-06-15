import { v4 as uuidv4, validate as isValidUUID } from "uuid";
import { InvalidPatientIdException } from "../exceptions/invalid-patient-id.exception";

export class PatientId {
  private constructor(private readonly value: string) {}

  static create(value: string): PatientId {
    if (!isValidUUID(value)) {
      throw new InvalidPatientIdException();
    }
    return new PatientId(value);
  }

  static generate(): PatientId {
    return new PatientId(uuidv4());
  }

  equals(other: PatientId): boolean {
    return this.value === other.value;
  }

  getValue(): string {
    return this.value;
  }
}
