# Feature: Panel de alertas cl�nicas en la ficha del paciente

**Prueba t�cnica take-home con IA para evaluar criterio fullstack en ClinicSay.**

## Stack esperado
- **Backend:** NestJS + Prisma + Domain-Driven Design
- **Frontend:** Ficha mock de paciente + PatientAlertsPanel
- **Regla clave:** Sin alertas activas id�nticas para el mismo paciente

---

## Contexto

En ClinicSay, cada paciente tiene una ficha donde el equipo consulta informaci�n antes de atenderlo. Dentro de esa ficha queremos agregar un panel visible llamado **Alertas cl�nicas**.

### �Qu� debe mostrar?
Advertencias importantes del paciente antes o durante la atenci�n:
- Alergias
- Riesgo m�dico
- Condici�n especial
- Advertencia administrativa

### �Por qu� importa?
Si una alerta se duplica, desaparece o se muestra mal, el sistema pierde confianza operativa.

---

## Planteamiento del problema

Una de las cosas m�s importantes durante la atenci�n es identificar r�pido las advertencias del paciente. Si esa informaci�n est� dispersa en notas, comentarios o memoria del personal, aparecen riesgos:

- El profesional podr�a no ver una alergia antes de indicar un procedimiento
- Recepci�n podr�a no saber que el paciente requiere autorizaci�n administrativa
- Dos usuarios podr�an registrar la misma alerta varias veces
- Una alerta antigua podr�a seguir activa aunque ya no aplique
- El sistema podr�a mostrar informaci�n sensible sin una estructura clara

---

## Objetivo de la prueba

Tu objetivo ser� crear una feature fullstack llamada **PatientAlertsPanel**. No buscamos que construyas todo ClinicSay. Buscamos ver criterio real de producto, datos, backend, frontend, tests y uso de IA.

### Backend
- NestJS con controladores, m�dulos, providers e inyecci�n de dependencias
- **Persistencia:** Prisma para modelo, migraci�n y persistencia
- **DDD:** Dominio, casos de uso, infraestructura y capa de entrada/API separados

### Frontend
- Consumir la API y mostrar la feature en una ficha mock de paciente

---

## Criterios de aceptaci�n: UI

La prueba est� completa si estos comportamientos existen en la experiencia de usuario. Estos criterios son la base para evaluar si la feature es entendible:

- Al abrir una ficha mock, se ve una secci�n "Alertas cl�nicas"
- La lista muestra alertas activas primero
- Cada alerta muestra: tipo, severidad, mensaje y estado
- La severidad se diferencia visualmente: low, medium, high
- El usuario puede crear una alerta con tipo, severidad, mensaje y estado activo
- El usuario puede editar, activar o desactivar una alerta
- Hay estado vac�o, loading y error de carga o guardado

---

## Criterios de aceptaci�n: Backend

La prueba tambi�n debe demostrar consistencia t�cnica. El backend no puede depender de que el frontend haga todo bien:

- El backend valida los datos recibidos
- El backend impide dos alertas activas id�nticas para el mismo paciente
- El backend est� implementado en NestJS
- La persistencia usa Prisma
- La soluci�n separa responsabilidades siguiendo DDD
- Hay tests m�nimos para la regla de negocio y al menos un endpoint
- El README explica setup, decisiones t�cnicas y uso de IA

---

## UI m�nima esperada

La feature debe verse como un panel dentro de la ficha del paciente. No tiene que ser id�ntica a ClinicSay, pero s� debe tener una estructura clara.

### Ejemplo de estructura
```
Ana Torres
DNI 12345678 � 34 a�os � Sede Miraflores

[Datos] [Citas] [Alertas]

## Alertas cl�nicas
+ Nueva alerta

HIGH  Alergia    Alergia a penicilina    Activa    [Editar]
MED   Admin      Requiere autorizaci�n   Activa    [Editar]
```

### Piezas esperadas
- PatientAlertsPanel
- AlertCard o fila
- AlertForm
- Estados loading/error/vac�o

---

## Flujo funcional

El flujo principal debe sentirse completo. Puedes usar modal, drawer, formulario inline o p�gina simple; lo importante es que el flujo sea entendible.

1. **Abrir ficha** - Se muestra paciente mock y secci�n de alertas
2. **Ver alertas** - Activas primero; high destaca visualmente
3. **Nueva alerta** - Formulario con tipo, severidad, mensaje y activo
4. **Guardar** - Actualiza lista, maneja errores y evita duplicados

**Regla m�s importante:** No debe existir m�s de una alerta activa id�ntica para el mismo paciente.

---

## Backend esperado

NestJS expone la API; Prisma persiste; DDD organiza la soluci�n. La regla anti-duplicados debe vivir en dominio/caso de uso, no en el controlador.

### Endpoints
- `GET /patients/:patientId/alerts`
- `POST /patients/:patientId/alerts`
- `PATCH /patient-alerts/:alertId`
- `DELETE /patient-alerts/:alertId`

### Se espera
- Controlador NestJS delgado
- Casos de uso separados
- Repositorio Prisma en infraestructura

---

## Tests, IA y entregables

La entrega debe ser f�cil de correr, revisar y defender. Se eval�a la soluci�n y tambi�n c�mo usaste IA para llegar a ella.

### Tests m�nimos
- 2 tests de regla/servicio
- 1 test de API
- Bonus: test de UI

### Uso de IA
Documenta: herramienta, prompts, partes generadas, errores detectados y revisi�n manual.

### Entregables
- Repo o branch
- README t�cnico
- Comandos de setup/test
- Video opcional

---

## R�brica

Se eval�a criterio fullstack, no solo que compile. Una soluci�n peque�a, clara y bien explicada vale m�s que una grande y fr�gil.

| Criterio | Peso |
|----------|------|
| Feature/UI entendible | 20% |
| NestJS + Prisma + reglas | 25% |
| Tests | 15% |
| DDD y separaci�n de capas | 15% |
| Uso responsable de IA | 15% |
| Comunicaci�n y README | 10% |
