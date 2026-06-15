# ClinicSay — PatientAlertsPanel

Feature fullstack que agrega un panel de alertas clínicas a la ficha del paciente en ClinicSay. Antes de atender a un paciente, el equipo médico y administrativo puede ver de un vistazo sus alertas activas: alergias, riesgos médicos, condiciones especiales o advertencias administrativas.

---

## ¿Qué resuelve esto?

Cuando la información crítica de un paciente está dispersa en notas o depende de la memoria del personal, aparecen riesgos reales: un profesional puede no ver una alergia antes de indicar un procedimiento, o recepción puede no saber que ese paciente requiere autorización previa. Este panel centraliza esa información y la hace visible desde el primer momento.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS · Prisma · PostgreSQL 16 |
| Frontend | React 18 · TypeScript · Vite · TailwindCSS |
| Formularios | React Hook Form · Zod |
| Estado servidor | TanStack React Query |
| Contenedores | Docker · Docker Compose |

---

## 🚀 Instalación rápida

**Requisito:** tener Docker Desktop instalado y corriendo.

**Paso 1** — Cloná el repositorio y entrá a la carpeta:

```bash
git clone https://github.com/cjbisbicus89/clinicsay.git

```

**Paso 2** — Ejecutá el script según tu sistema operativo:

### Windows

```powershell
.\start.ps1
```

### Linux / macOS

```bash
chmod +x start.sh
./start.sh
```

El script verifica que Docker esté activo, construye las imágenes (capturando cambios de código) e inicia los tres servicios. **No borra datos existentes** — si ya tenías alertas guardadas, siguen ahí. La primera vez puede tardar unos minutos mientras descarga las dependencias.

### Accedé a la aplicación

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| API REST | http://localhost:3000 |
| Swagger (documentación) | http://localhost:3000/api/docs |

### Comandos del día a día

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Detener todos los servicios
docker-compose down

# Detener y borrar la base de datos (fresh start)
docker-compose down -v
```

---

## Instalación manual (sin Docker)

Si preferís correr el proyecto directamente:

### Backend

```bash
cd backend
npm install
cp .env.example .env        # ajustá DATABASE_URL si tu Postgres es diferente
npx prisma migrate deploy
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Necesitás PostgreSQL corriendo localmente. La URL de conexión por defecto es:
```
postgresql://postgres:postgres@localhost:5432/clinicsay
```

---

## Arquitectura

El proyecto sigue **Domain-Driven Design (DDD)** en el backend y una arquitectura **por features** en el frontend.

### Backend — Capas DDD

```
backend/src/modules/patient-alerts/
├── domain/           # Lógica de negocio pura: entidades, value objects, excepciones
├── application/      # Casos de uso que orquestan el dominio
├── infrastructure/   # Repositorios Prisma, mappers, Unit of Work
└── presentation/     # Controladores NestJS, DTOs HTTP, validaciones
```

La regla más importante del negocio —**no puede existir más de una alerta activa idéntica para el mismo paciente**— vive en el dominio (`PatientAlert.ensureNotDuplicate`), no en el controlador. Si alguien bypasea el frontend, el backend igualmente la rechaza con HTTP 409.

Las entidades no son anémicas: `PatientAlert` expone métodos de comportamiento (`activate`, `deactivate`, `changeMessage`, `ensureNotDuplicate`) en lugar de ser simples bolsas de datos.

### Frontend — Feature-based

```
frontend/src/features/alerts/
├── api/          # Hooks de React Query (usePatientAlertsQuery, mutations)
├── components/   # PatientAlertsPanel, AlertCard, AlertForm, AlertsLoadingSkeleton
├── constants/    # Mapeos de severidad y tipo (Record inmutable, sin if/else)
├── types/        # Interfaces y enums compartidos
└── __tests__/    # Tests de comportamiento con Vitest + React Testing Library
```

Los componentes no hacen peticiones HTTP directamente. Toda la lógica asíncrona vive en los hooks de la capa `api/`. Los estilos condicionales de severidad (`HIGH`, `MEDIUM`, `LOW`) se resuelven con un `Record` estático, sin condicionales en el render.

### Principios aplicados

- **SOLID**: responsabilidad única por componente/caso de uso, repositorios detrás de interfaces, dependencias inyectadas por NestJS
- **DRY**: los textos visibles están centralizados en `constants/messages.ts`, los estilos de severidad en un único `Record`
- **Inyección de dependencias**: el controlador no conoce la implementación de Prisma; solo conoce la interfaz `IPatientAlertRepository`
- **Clases no anémicas**: el dominio tiene comportamiento real, no solo getters y setters

---

## API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/patients/:patientId/alerts` | Lista todas las alertas del paciente |
| `POST` | `/patients/:patientId/alerts` | Crea una nueva alerta |
| `PATCH` | `/patient-alerts/:alertId` | Edita una alerta existente |
| `DELETE` | `/patient-alerts/:alertId` | Elimina una alerta permanentemente |

Todos los errores de validación devuelven mensajes  El conflicto de duplicado devuelve `409 Conflict` con el mensaje `"Ya existe una alerta activa idéntica para este paciente"`.

---

## Tests

El backend tiene cobertura en los casos de uso críticos y en el endpoint principal:

```bash
# Tests unitarios
cd backend && npm test

# Tests end-to-end
cd backend && npm run test:e2e
```

El frontend tiene tests de comportamiento que verifican los tres flujos principales:

```bash
cd frontend && npm test
```

- Estado de carga (skeleton)
- Orden correcto de alertas (activas primero, por severidad)
- Estado vacío cuando no hay alertas

---

## Uso de IA

La IA se usó como herramienta de apoyo, no como reemplazo del criterio técnico.

**Para qué se usó:**
- Validar que el contexto del problema estaba bien comprendido antes de escribir código
- Guiarse del diseño visual de la página oficial de ClinicSay para replicar la paleta de colores, tipografía y estilo de componentes con precisión
- Actuar como validador de reglas de arquitectura (DDD, SOLID, nomenclatura) para detectar inconsistencias durante la implementación
- Generación de boilerplate inicial (estructura de carpetas, schema Prisma)

