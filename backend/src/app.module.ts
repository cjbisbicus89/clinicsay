import { Module } from "@nestjs/common";
import { PatientAlertsModule } from "./modules/patient-alerts/patient-alerts.module";

@Module({
  imports: [PatientAlertsModule],
})
export class AppModule {}
