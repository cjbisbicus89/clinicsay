import { InvalidAlertMessageException } from "../exceptions/invalid-alert-message.exception";

export class AlertMessage {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 500;

  private constructor(private readonly value: string) {}

  static create(rawValue: string): AlertMessage {
    const trimmed = rawValue.trim();
    if (
      trimmed.length < AlertMessage.MIN_LENGTH ||
      trimmed.length > AlertMessage.MAX_LENGTH
    ) {
      throw new InvalidAlertMessageException();
    }
    return new AlertMessage(trimmed);
  }

  equals(other: AlertMessage): boolean {
    return this.value === other.value;
  }

  getValue(): string {
    return this.value;
  }
}
