# Prompt de Ingeniería: Especificación de Diseño Visual y Arquitectura Limpia - ClinicSay

## 📋 Contexto y Rol del Sistema
Actúa como un **Principal Frontend Engineer y Arquitecto de UI/UX Experto**. Tu tarea es implementar el módulo de interfaz completo para la feature **"PatientAlertsPanel"** dentro de la ficha de paciente de la plataforma **ClinicSay**. 

Debes unificar de manera estricta e intransigente dos pilares:
1. **Identidad Visual Corporativa e Interfaz Comercial de ClinicSay** (extraída de sus páginas oficiales de Facturación & Caja).
2. **Ingeniería de Software de Alto Nivel** (Clean Code, SOLID, DDD adaptado a Frontend y Tolerancia Cero al código redundante o inconcluso).

---

## 🎨 I. Sistema de Identidad Visual (ClinicSay Brand Guidelines)

Debes replicar con precisión de píxel la paleta de colores, componentes de UI y estilos tipográficos de la web oficial de ClinicSay:

### 1. Paleta de Colores Exclusiva (Tailwind CSS Config)
* **Primary Brand Blue (Azul Clínico Principal):** `#0563c5` (o `#0061df`). Utilizado para secciones Hero, cabeceras de tablas de alto impacto, botones de acción principal y acentos de UI. Los fondos azules principales deben soportar superposiciones sutiles tipo malla tecnológica u ondas si la sección lo requiere.
* **Dark Neutral Text (Texto Principal):** Slate-800 (`#1e293b`). Ningún texto de encabezado o cuerpo debe usar negro puro (`#000000`).
* **Muted Text (Texto Secundario):** Slate-500 (`#64748b`) o azul/grisáceo atenuado para descripciones secundarias.
* **Surface/Backgrounds:** Light Gray / Cool Slate (`#f8fafc` o `#f1f5f9`) para fondos de contenedores secundarios, filas alternas o acordeones. Fondo general de la ficha en blanco puro (`#ffffff`).
* **Borders:** Slate-200 (`#e2e8f0`) para líneas divisorias finas.

### 2. Identidad del Logotipo y Cabeceras
* El logotipo en la cabecera principal debe representarse fielmente con tipografía limpia Sans-serif: La letra 'C' inicial integra un sutil diseño de "burbuja de chat". La palabra `Clinic` debe ir en fuente bold/extrabold y `Say` continuo en regular/medium (Blanco en fondos azules, o `#0563c5` en fondos claros).

### 3. Componentes Visuales y Botoneras (UI Elements)
* **Botones Principales (sobre fondos azules corporativos):** Fondo sólido blanco (`bg-white`), texto oscuro (`text-slate-800`), bordes altamente redondeados (`rounded-full` o `rounded-xl`), transiciones suaves.
* **Botones Principales (sobre fondos claros):** Fondo sólido `#0563c5`, texto blanco, bordes ligeramente redondeados (`rounded-lg` o `rounded-md`), transiciones suaves en hover (`hover:bg-[#034fa3]`).
* **Botones Secundarios / Outlines:** Borde fino de 1px en `#ffffff` o `#0563c5`, fondo transparente y transiciones limpias.
* **Estructura de Paneles / Contenedores:** Inspirado en las tablas de características de ClinicSay:
    * Cabeceras de paneles con bordes superiores altamente redondeados (`rounded-t-xl`).
    * Fondo de cabecera en Azul Principal (`bg-[#0563c5]`) con texto en blanco bold.
    * Celdas interiores limpias con bordes finos horizontales (`border-b border-slate-200`).
* **Iconografía de Acento:** Todos los iconos de confirmación o viñetas activas deben ser del tipo `Check` de `lucide-react`, coloreados exclusivamente en el azul corporativo (`text-[#0563c5]`).
* **Elementos Tipo Acordeón / Alertas Pasivas:** Bordes redondeados sutiles, fondo gris suave (`bg-slate-50`), con un indicador visual claro (como un símbolo `+` o `toggle` azul).

---

## 🏛️ II. Principios Arquitectónicos y Código Limpio (SOLID & DDD)

1. **Single Responsibility (SRP):** Los componentes visuales no realizan peticiones HTTP directas ni gestionan estados asíncronos complejos. Toda la lógica de negocio y llamadas a la API se delegan a **Custom Hooks autocontenidos** en la capa de servicios.
2. **Open/Closed (OCP) para Variantes Visuales:** Queda prohibido el uso de múltiples condicionales `if/else` o estructuras `switch` en el cuerpo del renderizado para definir las severidades de alerta (`HIGH`, `MEDIUM`, `LOW`). Define un **diccionario de mapeo estático inmutable (TypeScript Record)** que asocie el enum con sus clases exactas de Tailwind CSS:
    * `HIGH` (Alergia/Riesgo): `bg-red-50 text-red-800 border-red-200`
    * `MEDIUM` (Condición Especial): `bg-orange-50 text-orange-800 border-orange-200`
    * `LOW` (Administrativa): `bg-blue-50 text-blue-800 border-blue-200`
3. **Dependency Inversion (DI):** Los componentes consumen la abstracción de datos provista por los hooks de `@tanstack/react-query`. No hay acoplamiento con clientes Axios locales.

---

## 🚫 III. Directrices de Calidad Contra Código Redundante ("Anti-AI Slop")

* **Tolerancia Cero a Fragmentos Incompletos:** Todo el código generado debe ser 100% funcional. No se permiten comentarios tipo `// ... resto del código` o `// Implementar aquí`. Cada archivo debe entregarse completo y listo para producción.
* **Eliminación de Comentarios Obvios:** No agregues comentarios descriptivos que repitan lo que el código ya expresa de forma natural (ej. eliminar `// Guarda el estado del modal` o `// Envía los datos`). Los comentarios quedan reservados exclusivamente para justificar reglas de negocio complejas del dominio de ClinicSay.
* **Nombres Ultra-Semánticos:** Prohibido el uso de variables vagas como `data`, `item`, `res` o `handler`. Utiliza términos explícitos: `patientAlertsList`, `isCreatingAlertLoading`, `handleAlertStateToggle`.
* **Mitigación Visual de Alertas Inactivas:** Las alertas con `isActive: false` deben heredar una atenuación visual consistente con los diseños corporativos (`opacity-60` y escala de grises selectiva en bordes).

---

## 📂 IV. Arquitectura de Archivos y Ficheros

El módulo completo debe organizarse en la carpeta modular `features/alerts/`:

```text
features/alerts/
├── api/                  # Capa de Servicios y Estado Asíncrono (React Query)
│   └── usePatientAlertsApi.ts
├── components/           # Componentes de UI Limpios y Estilizados
│   ├── PatientRecordLayout.tsx    # Layout de la ficha médica con los estilos de ClinicSay
│   ├── PatientAlertsPanel.tsx     # Contenedor principal del panel de alertas
│   ├── AlertCard.tsx              # Tarjeta/Fila individual con estilos condicionales
│   └── AlertForm.tsx              # Formulario (Modal) con validaciones de negocio
├── types/                # Interfaces de TypeScript y Contratos de Datos
│   └── index.ts
└── __tests__/            # Cobertura de Pruebas Automatizadas
    └── PatientAlertsPanel.test.tsx# Prompt de Ingeniería: Especificación de Diseño Visual y Arquitectura Limpia - ClinicSay

## 📋 Contexto y Rol del Sistema
Actúa como un **Principal Frontend Engineer y Arquitecto de UI/UX Experto**. Tu tarea es implementar el módulo de interfaz completo para la feature **"PatientAlertsPanel"** dentro de la ficha de paciente de la plataforma **ClinicSay**. 

Debes unificar de manera estricta e intransigente dos pilares:
1. **Identidad Visual Corporativa e Interfaz Comercial de ClinicSay** (extraída de sus páginas oficiales de Facturación & Caja).
2. **Ingeniería de Software de Alto Nivel** (Clean Code, SOLID, DDD adaptado a Frontend y Tolerancia Cero al código redundante o inconcluso).

---

## 🎨 I. Sistema de Identidad Visual (ClinicSay Brand Guidelines)

Debes replicar con precisión de píxel la paleta de colores, componentes de UI y estilos tipográficos de la web oficial de ClinicSay:

### 1. Paleta de Colores Exclusiva (Tailwind CSS Config)
* **Primary Brand Blue (Azul Clínico Principal):** `#0563c5` (o `#0061df`). Utilizado para secciones Hero, cabeceras de tablas de alto impacto, botones de acción principal y acentos de UI. Los fondos azules principales deben soportar superposiciones sutiles tipo malla tecnológica u ondas si la sección lo requiere.
* **Dark Neutral Text (Texto Principal):** Slate-800 (`#1e293b`). Ningún texto de encabezado o cuerpo debe usar negro puro (`#000000`).
* **Muted Text (Texto Secundario):** Slate-500 (`#64748b`) o azul/grisáceo atenuado para descripciones secundarias.
* **Surface/Backgrounds:** Light Gray / Cool Slate (`#f8fafc` o `#f1f5f9`) para fondos de contenedores secundarios, filas alternas o acordeones. Fondo general de la ficha en blanco puro (`#ffffff`).
* **Borders:** Slate-200 (`#e2e8f0`) para líneas divisorias finas.

### 2. Identidad del Logotipo y Cabeceras
* El logotipo en la cabecera principal debe representarse fielmente con tipografía limpia Sans-serif: La letra 'C' inicial integra un sutil diseño de "burbuja de chat". La palabra `Clinic` debe ir en fuente bold/extrabold y `Say` continuo en regular/medium (Blanco en fondos azules, o `#0563c5` en fondos claros).

### 3. Componentes Visuales y Botoneras (UI Elements)
* **Botones Principales (sobre fondos azules corporativos):** Fondo sólido blanco (`bg-white`), texto oscuro (`text-slate-800`), bordes altamente redondeados (`rounded-full` o `rounded-xl`), transiciones suaves.
* **Botones Principales (sobre fondos claros):** Fondo sólido `#0563c5`, texto blanco, bordes ligeramente redondeados (`rounded-lg` o `rounded-md`), transiciones suaves en hover (`hover:bg-[#034fa3]`).
* **Botones Secundarios / Outlines:** Borde fino de 1px en `#ffffff` o `#0563c5`, fondo transparente y transiciones limpias.
* **Estructura de Paneles / Contenedores:** Inspirado en las tablas de características de ClinicSay:
    * Cabeceras de paneles con bordes superiores altamente redondeados (`rounded-t-xl`).
    * Fondo de cabecera en Azul Principal (`bg-[#0563c5]`) con texto en blanco bold.
    * Celdas interiores limpias con bordes finos horizontales (`border-b border-slate-200`).
* **Iconografía de Acento:** Todos los iconos de confirmación o viñetas activas deben ser del tipo `Check` de `lucide-react`, coloreados exclusivamente en el azul corporativo (`text-[#0563c5]`).
* **Elementos Tipo Acordeón / Alertas Pasivas:** Bordes redondeados sutiles, fondo gris suave (`bg-slate-50`), con un indicador visual claro (como un símbolo `+` o `toggle` azul).

---

## 🏛️ II. Principios Arquitectónicos y Código Limpio (SOLID & DDD)

1. **Single Responsibility (SRP):** Los componentes visuales no realizan peticiones HTTP directas ni gestionan estados asíncronos complejos. Toda la lógica de negocio y llamadas a la API se delegan a **Custom Hooks autocontenidos** en la capa de servicios.
2. **Open/Closed (OCP) para Variantes Visuales:** Queda prohibido el uso de múltiples condicionales `if/else` o estructuras `switch` en el cuerpo del renderizado para definir las severidades de alerta (`HIGH`, `MEDIUM`, `LOW`). Define un **diccionario de mapeo estático inmutable (TypeScript Record)** que asocie el enum con sus clases exactas de Tailwind CSS:
    * `HIGH` (Alergia/Riesgo): `bg-red-50 text-red-800 border-red-200`
    * `MEDIUM` (Condición Especial): `bg-orange-50 text-orange-800 border-orange-200`
    * `LOW` (Administrativa): `bg-blue-50 text-blue-800 border-blue-200`
3. **Dependency Inversion (DI):** Los componentes consumen la abstracción de datos provista por los hooks de `@tanstack/react-query`. No hay acoplamiento con clientes Axios locales.

---

## 🚫 III. Directrices de Calidad Contra Código Redundante ("Anti-AI Slop")

* **Tolerancia Cero a Fragmentos Incompletos:** Todo el código generado debe ser 100% funcional. No se permiten comentarios tipo `// ... resto del código` o `// Implementar aquí`. Cada archivo debe entregarse completo y listo para producción.
* **Eliminación de Comentarios Obvios:** No agregues comentarios descriptivos que repitan lo que el código ya expresa de forma natural (ej. eliminar `// Guarda el estado del modal` o `// Envía los datos`). Los comentarios quedan reservados exclusivamente para justificar reglas de negocio complejas del dominio de ClinicSay.
* **Nombres Ultra-Semánticos:** Prohibido el uso de variables vagas como `data`, `item`, `res` o `handler`. Utiliza términos explícitos: `patientAlertsList`, `isCreatingAlertLoading`, `handleAlertStateToggle`.
* **Mitigación Visual de Alertas Inactivas:** Las alertas con `isActive: false` deben heredar una atenuación visual consistente con los diseños corporativos (`opacity-60` y escala de grises selectiva en bordes).

---

## 📂 IV. Arquitectura de Archivos y Ficheros

El módulo completo debe organizarse en la carpeta modular `features/alerts/`:

```text
features/alerts/
├── api/                  # Capa de Servicios y Estado Asíncrono (React Query)
│   └── usePatientAlertsApi.ts
├── components/           # Componentes de UI Limpios y Estilizados
│   ├── PatientRecordLayout.tsx    # Layout de la ficha médica con los estilos de ClinicSay
│   ├── PatientAlertsPanel.tsx     # Contenedor principal del panel de alertas
│   ├── AlertCard.tsx              # Tarjeta/Fila individual con estilos condicionales
│   └── AlertForm.tsx              # Formulario (Modal) con validaciones de negocio
├── types/                # Interfaces de TypeScript y Contratos de Datos
│   └── index.ts
└── __tests__/            # Cobertura de Pruebas Automatizadas
    └── PatientAlertsPanel.test.tsx# Prompt de Ingeniería: Especificación de Diseño Visual y Arquitectura Limpia - ClinicSay

## 📋 Contexto y Rol del Sistema
Actúa como un **Principal Frontend Engineer y Arquitecto de UI/UX Experto**. Tu tarea es implementar el módulo de interfaz completo para la feature **"PatientAlertsPanel"** dentro de la ficha de paciente de la plataforma **ClinicSay**. 

Debes unificar de manera estricta e intransigente dos pilares:
1. **Identidad Visual Corporativa e Interfaz Comercial de ClinicSay** (extraída de sus páginas oficiales de Facturación & Caja).
2. **Ingeniería de Software de Alto Nivel** (Clean Code, SOLID, DDD adaptado a Frontend y Tolerancia Cero al código redundante o inconcluso).

---

## 🎨 I. Sistema de Identidad Visual (ClinicSay Brand Guidelines)

Debes replicar con precisión de píxel la paleta de colores, componentes de UI y estilos tipográficos de la web oficial de ClinicSay:

### 1. Paleta de Colores Exclusiva (Tailwind CSS Config)
* **Primary Brand Blue (Azul Clínico Principal):** `#0563c5` (o `#0061df`). Utilizado para secciones Hero, cabeceras de tablas de alto impacto, botones de acción principal y acentos de UI. Los fondos azules principales deben soportar superposiciones sutiles tipo malla tecnológica u ondas si la sección lo requiere.
* **Dark Neutral Text (Texto Principal):** Slate-800 (`#1e293b`). Ningún texto de encabezado o cuerpo debe usar negro puro (`#000000`).
* **Muted Text (Texto Secundario):** Slate-500 (`#64748b`) o azul/grisáceo atenuado para descripciones secundarias.
* **Surface/Backgrounds:** Light Gray / Cool Slate (`#f8fafc` o `#f1f5f9`) para fondos de contenedores secundarios, filas alternas o acordeones. Fondo general de la ficha en blanco puro (`#ffffff`).
* **Borders:** Slate-200 (`#e2e8f0`) para líneas divisorias finas.

### 2. Identidad del Logotipo y Cabeceras
* El logotipo en la cabecera principal debe representarse fielmente con tipografía limpia Sans-serif: La letra 'C' inicial integra un sutil diseño de "burbuja de chat". La palabra `Clinic` debe ir en fuente bold/extrabold y `Say` continuo en regular/medium (Blanco en fondos azules, o `#0563c5` en fondos claros).

### 3. Componentes Visuales y Botoneras (UI Elements)
* **Botones Principales (sobre fondos azules corporativos):** Fondo sólido blanco (`bg-white`), texto oscuro (`text-slate-800`), bordes altamente redondeados (`rounded-full` o `rounded-xl`), transiciones suaves.
* **Botones Principales (sobre fondos claros):** Fondo sólido `#0563c5`, texto blanco, bordes ligeramente redondeados (`rounded-lg` o `rounded-md`), transiciones suaves en hover (`hover:bg-[#034fa3]`).
* **Botones Secundarios / Outlines:** Borde fino de 1px en `#ffffff` o `#0563c5`, fondo transparente y transiciones limpias.
* **Estructura de Paneles / Contenedores:** Inspirado en las tablas de características de ClinicSay:
    * Cabeceras de paneles con bordes superiores altamente redondeados (`rounded-t-xl`).
    * Fondo de cabecera en Azul Principal (`bg-[#0563c5]`) con texto en blanco bold.
    * Celdas interiores limpias con bordes finos horizontales (`border-b border-slate-200`).
* **Iconografía de Acento:** Todos los iconos de confirmación o viñetas activas deben ser del tipo `Check` de `lucide-react`, coloreados exclusivamente en el azul corporativo (`text-[#0563c5]`).
* **Elementos Tipo Acordeón / Alertas Pasivas:** Bordes redondeados sutiles, fondo gris suave (`bg-slate-50`), con un indicador visual claro (como un símbolo `+` o `toggle` azul).

---

## 🏛️ II. Principios Arquitectónicos y Código Limpio (SOLID & DDD)

1. **Single Responsibility (SRP):** Los componentes visuales no realizan peticiones HTTP directas ni gestionan estados asíncronos complejos. Toda la lógica de negocio y llamadas a la API se delegan a **Custom Hooks autocontenidos** en la capa de servicios.
2. **Open/Closed (OCP) para Variantes Visuales:** Queda prohibido el uso de múltiples condicionales `if/else` o estructuras `switch` en el cuerpo del renderizado para definir las severidades de alerta (`HIGH`, `MEDIUM`, `LOW`). Define un **diccionario de mapeo estático inmutable (TypeScript Record)** que asocie el enum con sus clases exactas de Tailwind CSS:
    * `HIGH` (Alergia/Riesgo): `bg-red-50 text-red-800 border-red-200`
    * `MEDIUM` (Condición Especial): `bg-orange-50 text-orange-800 border-orange-200`
    * `LOW` (Administrativa): `bg-blue-50 text-blue-800 border-blue-200`
3. **Dependency Inversion (DI):** Los componentes consumen la abstracción de datos provista por los hooks de `@tanstack/react-query`. No hay acoplamiento con clientes Axios locales.

---

## 🚫 III. Directrices de Calidad Contra Código Redundante ("Anti-AI Slop")

* **Tolerancia Cero a Fragmentos Incompletos:** Todo el código generado debe ser 100% funcional. No se permiten comentarios tipo `// ... resto del código` o `// Implementar aquí`. Cada archivo debe entregarse completo y listo para producción.
* **Eliminación de Comentarios Obvios:** No agregues comentarios descriptivos que repitan lo que el código ya expresa de forma natural (ej. eliminar `// Guarda el estado del modal` o `// Envía los datos`). Los comentarios quedan reservados exclusivamente para justificar reglas de negocio complejas del dominio de ClinicSay.
* **Nombres Ultra-Semánticos:** Prohibido el uso de variables vagas como `data`, `item`, `res` o `handler`. Utiliza términos explícitos: `patientAlertsList`, `isCreatingAlertLoading`, `handleAlertStateToggle`.
* **Mitigación Visual de Alertas Inactivas:** Las alertas con `isActive: false` deben heredar una atenuación visual consistente con los diseños corporativos (`opacity-60` y escala de grises selectiva en bordes).

---

## 📂 IV. Arquitectura de Archivos y Ficheros

El módulo completo debe organizarse en la carpeta modular `features/alerts/`:

```text
features/alerts/
├── api/                  # Capa de Servicios y Estado Asíncrono (React Query)
│   └── usePatientAlertsApi.ts
├── components/           # Componentes de UI Limpios y Estilizados
│   ├── PatientRecordLayout.tsx    # Layout de la ficha médica con los estilos de ClinicSay
│   ├── PatientAlertsPanel.tsx     # Contenedor principal del panel de alertas
│   ├── AlertCard.tsx              # Tarjeta/Fila individual con estilos condicionales
│   └── AlertForm.tsx              # Formulario (Modal) con validaciones de negocio
├── types/                # Interfaces de TypeScript y Contratos de Datos
│   └── index.ts
└── __tests__/            # Cobertura de Pruebas Automatizadas
    └── PatientAlertsPanel.test.tsx