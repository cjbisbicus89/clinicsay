# Estándares de Ingeniería Backend

**Guía Definitiva — Sistema de Alertas de Pacientes (NestJS + Prisma)**

---

## Regla de Oro

El código se lee muchas más veces de las que se escribe. Optimiza la lectura para el desarrollador que mantendrá el sistema en 6 meses (que probablemente serás tú). No son reglas teóricas, son prácticas para evitar que la aplicación falle en producción.

---

## 1. Higiene del Código y Naming Conventions

La limpieza estructural es innegociable. Refleja profesionalismo y facilita las revisiones de código (PRs).

### Reglas Fundamentales

- **Cero código comentado.** Si una función no se usa, se elimina. Git es nuestra máquina del tiempo, no necesitamos ruido de código muerto.
- **Cero variables sin usar.** Configurado estrictamente vía ESLint/TSConfig. Si existe, debe usarse.
- **Nombres en Inglés.** Todo el código fuente (clases, variables, métodos, BD) va en inglés. La traducción del negocio se hace en la capa de presentación (Swagger/UI).

### Convenciones TypeScript

- **PascalCase** para Clases, Interfaces, DTOs y Enums.
- **camelCase** para variables, métodos e instancias.
- **Prohibido el sufijo `Async`.** En TypeScript es redundante porque el tipo `Promise<T>` ya declara explícitamente su asincronía.

---

## 2. Principios SOLID & Arquitectura Limpia

El proyecto utiliza Domain-Driven Design (DDD) estructurado en capas. La responsabilidad de cada componente es estricta.

### Responsabilidad por Capas

| Capa | Responsabilidad | Prohibido |
|------|------------------|------------|
| **Controladores (Presentación)** | Son delgados. Únicamente validan el Request HTTP, inyectan el caso de uso, lo ejecutan y mapean la respuesta. | Cualquier lógica de negocio o acceso directo a Prisma. |
| **Casos de Uso (Aplicación)** | Orquestan el flujo. Llaman a repositorios para obtener entidades, ejecutan métodos de dominio y persisten cambios. | Calcular reglas nativas, delegan al dominio. |
| **Entidades (Dominio)** | Contienen la verdad absoluta del negocio. Las validaciones ricas y reglas (como que no haya alertas duplicadas) nacen y se verifican aquí. | Acceso a infraestructura o protocolos HTTP. |
| **Repositorios (Infraestructura)** | Exclusivamente implementan el acceso a datos. PrismaClient vive confinado a esta capa. | Lógica de negocio. |

### ❌ Anti-patrón (Prohibido): Lógica acoplada en el Controlador

```typescript
@Post(':patientId/alerts')
async create(@Body() body: any) {
  // Acceso directo a infraestructura (Prisma)
  // Lógica de validación duplicada
  const exists = await this.prisma.alert.findFirst({ ... });
  if (exists) throw new Error('Duplicated');
  return this.prisma.alert.create({ ... });
}
```

### ✅ Patrón Correcto: Controlador Delegador

```typescript
@Post(':patientId/alerts')
async create(
  @Param('patientId', ParseUUIDPipe) patientId: string,
  @Body() dto: CreateAlertDto
) {
  // Validación HTTP manejada por DTOs
  // El controlador solo delega al Caso de Uso
  return this.createAlertUseCase.execute(patientId, dto);
}
```

---

## 3. Dominios Ricos y Validación en Capas

### El Mal de las "Clases Anémicas" (Domain-Driven Design)

En muchas implementaciones de NestJS + Prisma, las entidades terminan siendo simples interfaces o types con propiedades públicas. Eso es una entidad anémica.

#### Reglas para Evitar Entidades Anémicas

**Encapsulamiento estricto:** Las propiedades de las entidades de dominio deben ser `private` o `readonly`. El acceso debe ser mediante métodos de dominio con nombres expresivos.

**Invariantes de Dominio:** Una entidad nunca debe estar en un estado inválido. Por ejemplo, si `PatientAlert` requiere un `patientId` y un `type` para existir, su constructor debe validar esto.

**Regla de mutación de estado:** "El estado de una entidad solo puede cambiar mediante métodos que expresen una acción de negocio (ej: `alert.deactivate()`, `alert.changeSeverity(newSeverity)`), nunca mediante setters directos (`alert.isActive = false`)."

**Validación interna:** La entidad debe validar sus reglas antes de guardarse. Si intentas asignar un valor prohibido, el constructor o el método debe lanzar una `DomainException`.

#### ❌ Entidad Anémica (Prohibido)

```typescript
class PatientAlert {
  patientId: string;
  type: AlertType;
  severity: Severity;
  message: string;
  isActive: boolean;
  // Sin lógica, sin validaciones, sin encapsulamiento
}
```

#### ✅ Entidad Rica (Correcto)

```typescript
class PatientAlert {
  private constructor(
    private readonly id: PatientId,
    private readonly patientId: PatientId,
    private readonly type: AlertType,
    private severity: Severity,
    private readonly message: AlertMessage,
    private isActive: boolean
  ) {}

  static create(patientId: PatientId, type: AlertType, severity: Severity, message: AlertMessage): PatientAlert {
    if (!message.isValid()) {
      throw new InvalidAlertMessageException();
    }
    return new PatientAlert(PatientId.generate(), patientId, type, severity, message, true);
  }

  deactivate(): void {
    this.isActive = false;
  }

  changeSeverity(newSeverity: Severity): void {
    this.severity = newSeverity;
  }

  isDuplicated(other: PatientAlert): boolean {
    return this.patientId.equals(other.patientId) &&
           this.type === other.type &&
           this.message.equals(other.message);
  }
}
```

### Estratificación de Validación

| Capa | Tipo de Validación | Herramienta NestJS |
|------|-------------------|---------------------|
| **Presentación (HTTP)** | Sintáctica y de Formato (Ej: es UUID, Enum válido, Max length) | `class-validator` (DTOs + ValidationPipe) |
| **Aplicación (Use Case)** | Reglas Orquestadas (Ej: Permisos, Tiempos, Ventanas de acción) | Excepciones HTTP personalizadas |
| **Dominio** | Reglas Core (Ej: Anti-duplicados activos, Invariantes de Alertas) | `DomainException` |

### Lenguaje Ubicuo y Enums Centralizados

No usamos "magic strings". Las severidades y tipos se manejan con Enums estrictos:

```typescript
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum AlertType {
  ALLERGY = 'ALLERGY',
  MEDICAL_RISK = 'MEDICAL_RISK',
  SPECIAL_CONDITION = 'SPECIAL_CONDITION',
  ADMINISTRATIVE = 'ADMINISTRATIVE'
}
```

---

## 4. Manejo de Errores y Códigos HTTP

### Respuestas No Genéricas (Problem Details)

Es un error común responder con 500 Internal Server Error o un simple `{ "message": "error" }`. En DDD, el cliente necesita saber por qué falló la regla de negocio.

#### Estandarización RFC 7807

Toda respuesta de error debe seguir el formato Problem Details.

**❌ Respuesta Genérica (Prohibido)**

```json
{
  "message": "error"
}
```

**✅ Problem Details (Correcto)**

```json
{
  "type": "https://clinicsay.com/errors/duplicated-alert",
  "title": "Alerta duplicada",
  "status": 409,
  "detail": "Ya existe una alerta activa del mismo tipo para este paciente.",
  "instance": "/patients/123/alerts"
}
```

#### Mapeo de Capas

Define explícitamente que la capa de Infraestructura debe mapear los errores de dominio a estos esquemas. El controlador nunca debe "adivinar" el error.

```typescript
// infrastructure/filters/domain-exception.filter.ts
@Catch(DuplicateAlertException)
catch(exception: DuplicateAlertException, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();

  response.status(409).json({
    type: 'https://clinicsay.com/errors/duplicated-alert',
    title: 'Alerta duplicada',
    status: 409,
    detail: exception.message,
    instance: ctx.getRequest().url
  });
}
```

### Códigos de Estado

Las excepciones no son para flujo de control rutinario. Usamos filtros globales (`GlobalExceptionFilter` en NestJS) para interceptar errores de dominio y mapearlos a respuestas HTTP estandarizadas siguiendo el formato ProblemDetails (RFC 7807).

| Código HTTP | Caso de Uso |
|-------------|-------------|
| **400 Bad Request** | DTO inválido o violación sintáctica. |
| **404 Not Found** | Paciente o Alerta inexistente. |
| **409 Conflict** | Exclusivo para la regla anti-duplicados. Indica que el estado actual del sistema choca con la solicitud (la alerta activa ya existe). |
| **500 Internal Server Error** | Caída de BD, errores no capturados. (No filtrar stacktraces en producción). |

---

## 5. Más allá de lo obvio: Lo que suele fallar en DDD con Prisma

Teniendo en cuenta tu stack, aquí hay 3 puntos que los arquitectos suelen olvidar:

### Repository Pattern vs. Active Record

Prisma es un Active Record disfrazado. En tu guía, debes prohibir el uso de `this.prisma.alert...` directamente en el Caso de Uso.

**Regla:** "Los Casos de Uso solo conocen la Interfaz del Repositorio. La implementación concreta con Prisma es un detalle de infraestructura que vive en una capa separada."

#### ❌ Anti-patrón: Prisma directo en Use Case (Prohibido)

```typescript
// application/use-cases/create-alert.use-case.ts
@Injectable()
export class CreateAlertUseCase {
  constructor(private prisma: PrismaService) {} // ❌ ERROR

  async execute(dto: CreateAlertDto) {
    return this.prisma.alert.create({ ... }); // ❌ ERROR
  }
}
```

#### ✅ Patrón Correcto: Repository Interface (Correcto)

```typescript
// domain/repositories/patient-alert.repository.interface.ts
export interface IPatientAlertRepository {
  save(alert: PatientAlert): Promise<PatientAlert>;
  findByPatientId(patientId: PatientId): Promise<PatientAlert[]>;
  findActiveIdentical(patientId: PatientId, type: AlertType, message: AlertMessage): Promise<PatientAlert | null>;
}

// application/use-cases/create-alert.use-case.ts
@Injectable()
export class CreateAlertUseCase {
  constructor(private readonly repository: IPatientAlertRepository) {} // ✅ CORRECTO

  async execute(dto: CreateAlertDto) {
    return this.repository.save(alert); // ✅ CORRECTO
  }
}
```

### Value Objects (No todo es un String/UUID)

Para evitar clases anémicas, usa Value Objects para conceptos como `Severity` o `PatientId`.

**Regla:** "Si una propiedad tiene reglas de validación (ej: un PatientId debe ser formato UUID, o un Severity debe pertenecer a un rango), no la trates como string, trátala como un Value Object que se valida a sí mismo."

#### ❌ Primitivos sin validación (Prohibido)

```typescript
class PatientAlert {
  patientId: string; // ❌ Puede ser cualquier string inválido
  severity: string;  // ❌ Puede ser cualquier string inválido
}
```

#### ✅ Value Objects con validación (Correcto)

```typescript
// domain/value-objects/patient-id.vo.ts
export class PatientId {
  private constructor(private readonly value: string) {}

  static create(value: string): PatientId {
    if (!this.isValidUUID(value)) {
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

  private static isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
}

// domain/value-objects/alert-message.vo.ts
export class AlertMessage {
  private constructor(private readonly value: string) {}

  static create(value: string): AlertMessage {
    if (value.length < 3 || value.length > 500) {
      throw new InvalidAlertMessageException();
    }
    return new AlertMessage(value.trim());
  }

  equals(other: AlertMessage): boolean {
    return this.value === other.value;
  }

  getValue(): string {
    return this.value;
  }
}
```

### Estrategia de Transaccionalidad

¿Qué pasa si el caso de uso necesita actualizar dos tablas?

**Regla:** "La transacción debe ser gestionada en el Caso de Uso mediante un patrón UnitOfWork o pasando una transacción de Prisma a través del repositorio, para evitar que la lógica de persistencia se contamine en los servicios."

#### Implementación con Unit of Work

```typescript
// infrastructure/unit-of-work/prisma.unit-of-work.ts
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async executeInTransaction<T>(operation: (tx: PrismaTransaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(operation);
  }
}

// application/use-cases/create-alert.use-case.ts
@Injectable()
export class CreateAlertUseCase {
  constructor(
    private readonly repository: IPatientAlertRepository,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute(dto: CreateAlertDto): Promise<void> {
    await this.unitOfWork.executeInTransaction(async (tx) => {
      // Pasar la transacción al repositorio
      await this.repository.save(alert, tx);
      // Otras operaciones en la misma transacción
    });
  }
}
```

---

## 6. Estilo TypeScript Moderno & NestJS

- **`strict: true` en tsconfig.json.** Si puede ser nulo, debe definirse explícitamente (`string | null`).
- **Prohibido `any`.** Usar `unknown` + type-guards si el origen es incierto.
- **Prohibidos los casteos (`as Type`).** para silenciar el compilador.
- **Inyección de Dependencias por Constructor:** Usar `@Injectable()` y declarar las dependencias como `private readonly` en los constructores.

```typescript
@Injectable()
export class CreateAlertUseCase {
  constructor(
    private readonly repository: IPatientAlertRepository
  ) {}
}
```

---


### Reglas de Nomenclatura

`metodoOAccion_escenario_comportamientoEsperado`

### Unit Tests (Dominio/Use Cases)

Mockear los repositorios por completo. Instanciar los casos de uso y verificar que las reglas (ej. Lanzar error en duplicados) se cumplen.

```typescript
// test/use-cases/create-alert.use-case.spec.ts
it('createAlert_whenActiveDuplicateExists_throwsConflictException', async () => {
  // Arrange
  mockRepository.findActiveByPatientAndType.mockResolvedValue(existingAlert);
  
  // Act & Assert
  await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
});
```

### E2E Tests (API)

Levantar la aplicación con `Test.createTestingModule` y base de datos en memoria (SQLite o Testcontainers con Postgres). Verificar códigos de respuesta (201, 409, etc.).

---

## 8. Gitflow, Commits y OpenAPI

### Conventional Commits

Uso obligatorio de formato semántico en inglés en el título (máximo 72 caracteres):

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `refactor:` - Refactorización sin cambio de comportamiento
- `test:` - Agregar o modificar tests

**Prohibidos** los commits estilo "wip", "cambios", "arreglar bug".

### Swagger / OpenAPI

Cada endpoint debe documentar su contrato. Usar decoradores de NestJS:

```typescript
@ApiTags('Patient Alerts')
@ApiOperation({ summary: 'Create a new clinical alert for a patient' })
@ApiResponse({ status: 201, description: 'Alert created successfully' })
@ApiResponse({ status: 409, description: 'Duplicated active alert exists' })
```

---

## 9. Calidad de Dominio (Checklist de Senior)

Este checklist te ayuda a verificar que tu implementación DDD es de nivel senior, no superficial.

- [ ] **¿Es mi entidad un "pobre" contenedor de datos?** Si no tiene lógica de negocio (métodos, validaciones), es anémica. Refactoriza.
- [ ] **¿Estoy usando tipos primitivos (string, number) para conceptos de negocio?** Si es así, crea un Value Object.
- [ ] **¿Mis excepciones son técnicas o semánticas?** Prohibido lanzar `Error` genérico. Lanza `DuplicateAlertException` (Semántica).
- [ ] **¿El controlador conoce cómo se guarda en BD?** Prohibido. El controlador solo sabe que llamó a un `execute()` de un caso de uso.
- [ ] **¿Los casos de uso inyectan Prisma directamente?** Prohibido. Deben inyectar la interfaz del repositorio.
- [ ] **¿Las respuestas de error son genéricas?** Deben seguir RFC 7807 (Problem Details).
- [ ] **¿Las entidades pueden mutar su estado arbitrariamente?** Solo mediante métodos de negocio (`deactivate()`, no `isActive = false`).
- [ ] **¿Los Value Objects validan su estado al crearse?** Deben lanzar excepciones si reciben valores inválidos.

---

## 10. Anti-patrones Prohibidos (Checklist)

- [ ] **Lógica en Controllers:** Violar la responsabilidad única.
- [ ] **Entidades Anémicas:** Clases de dominio que no validan su estado interno.
- [ ] **Ignorar Promesas (Floating Promises):** Funciones asíncronas no await-eadas.
- [ ] **Magia en mapeos:** Falta de DTOs tipados retornando objetos crudos de BD.
- [ ] **PrismaClient regado:** Usar Prisma fuera del directorio `infrastructure/`.
