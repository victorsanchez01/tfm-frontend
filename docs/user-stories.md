# TFM Frontend - Documentación del Proyecto

## 📋 Visión General

Plataforma de aprendizaje impulsada por IA (AI-driven Learning Platform) con frontend modular y escalable.

### Stack Tecnológico
- **Frontend**: React + Vite + TypeScript
- **Routing**: React Router
- **State Management**: Zustand
- **Server State**: React Query
- **Validation**: Zod
- **Date Handling**: date-fns
- **Styling**: CSS Modules

---

## 🎯 Historias de Usuario
### Épica 1: Gestión de Usuario y Perfil

#### US-001: Registro de Usuario
**Como** usuario nuevo  
**Quiero** registrarme en la plataforma  
**Para** que se cree automáticamente mi cuenta en el sistema de autenticación y mi perfil interno de aprendizaje

**Criterios de Aceptación:**
- [ ] El usuario puede registrarse proporcionando email, contraseña y datos básicos (nombre, apellido)
- [ ] El sistema crea automáticamente una cuenta en Keycloak con las credenciales proporcionadas
- [ ] Se genera un perfil interno vinculado al ID de Keycloak
- [ ] El usuario recibe un email de confirmación de registro
- [ ] Si el email ya existe, el sistema retorna un error descriptivo (HTTP 409)
- [ ] La contraseña cumple con políticas de seguridad mínimas (8+ caracteres, mayúscula, número)
- [ ] El registro es transaccional: si falla la creación del perfil interno, se revierte la cuenta en Keycloak

---

#### US-002: Consultar Perfil
**Como** usuario autenticado  
**Quiero** consultar mi perfil  
**Para** ver mis datos personales, preferencias y estado actual de aprendizaje

**Criterios de Aceptación:**
- [ ] El endpoint requiere token de autenticación válido (JWT)
- [ ] Retorna los datos del usuario: nombre, email, fecha de registro, preferencias
- [ ] Incluye los objetivos de aprendizaje activos del usuario
- [ ] Incluye estadísticas básicas (cursos en progreso, completados)
- [ ] Un usuario solo puede ver su propio perfil (autorización por ID)
- [ ] Si el token es inválido o expirado, retorna HTTP 401
- [ ] Tiempo de respuesta menor a 500ms

---

#### US-003: Actualizar Perfil
**Como** usuario autenticado  
**Quiero** actualizar mi perfil  
**Para** modificar mis preferencias e información personal según mis necesidades

**Criterios de Aceptación:**
- [ ] El usuario puede modificar: nombre, apellido, preferencias de idioma, zona horaria
- [ ] Los cambios se persisten correctamente en la base de datos
- [ ] El email no puede ser modificado desde este endpoint
- [ ] Se validan los campos antes de guardar (longitud, formato)
- [ ] Retorna el perfil actualizado tras la operación exitosa
- [ ] Se registra un evento de auditoría con los campos modificados
- [ ] Si hay errores de validación, retorna HTTP 400 con detalle de errores

---

#### US-004: Crear Objetivo
**Como** estudiante  
**Quiero** crear un objetivo de aprendizaje  
**Para** definir las metas que deseo alcanzar y que el sistema pueda personalizar mi experiencia

**Criterios de Aceptación:**
- [ ] El estudiante puede crear un objetivo especificando: título, descripción, skill objetivo, fecha límite (opcional)
- [ ] El objetivo queda asociado al perfil del usuario autenticado
- [ ] El objetivo se crea con estado "activo" por defecto
- [ ] Se valida que la skill referenciada exista en el catálogo
- [ ] El objetivo aparece inmediatamente en el perfil del usuario
- [ ] No hay límite de objetivos activos por usuario
- [ ] Retorna el objetivo creado con su ID asignado

---

#### US-005: Actualizar Objetivo
**Como** estudiante  
**Quiero** actualizar o desactivar un objetivo  
**Para** ajustar mis metas de aprendizaje según mi progreso o cambio de intereses

**Criterios de Aceptación:**
- [ ] El estudiante puede modificar: título, descripción, fecha límite, estado (activo/inactivo/completado)
- [ ] Solo el propietario del objetivo puede modificarlo
- [ ] Al desactivar un objetivo, este deja de influir en las recomendaciones
- [ ] Al marcar como "completado", se registra la fecha de completitud
- [ ] Se mantiene historial de objetivos (no se eliminan físicamente)
- [ ] Retorna el objetivo actualizado tras la operación
- [ ] Si el objetivo no existe o no pertenece al usuario, retorna HTTP 404

---

### Épica 2: Gestión de Contenidos

#### US-010: Listar Dominios
**Como** usuario  
**Quiero** listar los dominios de conocimiento disponibles  
**Para** explorar las áreas temáticas que ofrece la plataforma

**Criterios de Aceptación:**
- [ ] El endpoint es accesible para usuarios autenticados
- [ ] Retorna lista de dominios con: ID, nombre, descripción, icono/imagen, cantidad de skills
- [ ] Soporta paginación (página, tamaño, total)
- [ ] Permite filtrar por nombre (búsqueda parcial, case-insensitive)
- [ ] Permite ordenar por nombre o fecha de creación
- [ ] Solo muestra dominios activos (estado = publicado)
- [ ] Tiempo de respuesta menor a 300ms para menos de 100 dominios

**Estado:** ❌ No implementado

---

#### US-011: Crear Dominio
**Como** administrador  
**Quiero** crear un nuevo dominio de conocimiento  
**Para** ampliar el catálogo de áreas de aprendizaje disponibles

**Criterios de Aceptación:**
- [ ] Solo usuarios con rol "ADMIN" pueden acceder a este endpoint
- [ ] Campos requeridos: nombre (único), descripción
- [ ] Campos opcionales: icono, color, orden de visualización
- [ ] El nombre del dominio debe ser único (validación case-insensitive)
- [ ] El dominio se crea con estado "borrador" por defecto
- [ ] Retorna el dominio creado con su ID asignado
- [ ] Si el usuario no tiene permisos, retorna HTTP 403
- [ ] Si el nombre ya existe, retorna HTTP 409

---

#### US-012: Listar Skills
**Como** usuario  
**Quiero** listar las habilidades (skills) de un dominio  
**Para** conocer qué competencias puedo desarrollar en un área específica

**Criterios de Aceptación:**
- [ ] Requiere el ID del dominio como parámetro
- [ ] Retorna lista de skills con: ID, nombre, descripción, nivel de dificultad, prerrequisitos
- [ ] Soporta paginación
- [ ] Permite filtrar por nivel de dificultad (básico, intermedio, avanzado)
- [ ] Incluye el conteo de contenidos asociados a cada skill
- [ ] Si el dominio no existe, retorna HTTP 404
- [ ] Ordena por defecto según el orden pedagógico definido

---

#### US-013: Gestionar Prerrequisitos
**Como** administrador  
**Quiero** gestionar los prerrequisitos entre skills  
**Para** definir el orden lógico de aprendizaje y las dependencias entre habilidades

**Criterios de Aceptación:**
- [ ] Solo usuarios con rol "ADMIN" pueden gestionar prerrequisitos
- [ ] Permite agregar una skill como prerrequisito de otra
- [ ] Permite eliminar un prerrequisito existente
- [ ] Valida que no se creen ciclos de dependencia (A→B→C→A)
- [ ] Valida que ambas skills existan
- [ ] Una skill puede tener múltiples prerrequisitos
- [ ] Retorna la lista actualizada de prerrequisitos de la skill
- [ ] Si se detecta un ciclo, retorna HTTP 400 con mensaje explicativo

---

#### US-014: Listar Contenidos
**Como** estudiante  
**Quiero** listar los contenidos asociados a una skill  
**Para** acceder a los materiales educativos que me ayudarán a desarrollar esa competencia

**Criterios de Aceptación:**
- [ ] Requiere el ID de la skill como parámetro
- [ ] Retorna lista de contenidos con: ID, título, tipo (video, texto, ejercicio), duración estimada, dificultad
- [ ] Soporta paginación y filtrado por tipo de contenido
- [ ] Ordena por defecto según secuencia pedagógica
- [ ] Indica si el usuario ya completó cada contenido (requiere autenticación)
- [ ] Solo muestra contenidos con estado "publicado"
- [ ] Si la skill no existe, retorna HTTP 404

---

#### US-015: Crear/Editar Contenido
**Como** administrador/creador de contenido  
**Quiero** crear o editar contenidos educativos  
**Para** mantener actualizado el material de aprendizaje de la plataforma

**Criterios de Aceptación:**
- [ ] Solo usuarios con rol "ADMIN" o "CONTENT_CREATOR" pueden acceder
- [ ] Crear: campos requeridos son título, tipo, skill asociada, contenido/URL
- [ ] Editar: permite modificar cualquier campo excepto el ID
- [ ] Tipos soportados: VIDEO, TEXTO, EJERCICIO, QUIZ, RECURSO_EXTERNO
- [ ] Valida que la skill asociada exista
- [ ] Soporta versionado de contenido (mantiene historial de cambios)
- [ ] El contenido se crea como "borrador" y requiere publicación explícita
- [ ] Retorna el contenido creado/actualizado con su ID

---

#### US-016: Sistema de Favoritos
**Como** estudiante  
**Quiero** guardar contenidos como favoritos  
**Para** poder acceder rápidamente a ellos más tarde

**Criterios de Aceptación:**
- [x] Botón de guardar/quitar en detalle de contenido
- [x] Página de favoritos con lista de contenidos guardados
- [x] Búsqueda dentro de favoritos
- [x] Acceso a favoritos desde la página de contenidos
- [x] Eliminar de favoritos con un clic
- [x] Indicador visual de contenido guardado

**Estado:** ✅ Completado

---

### Épica 3: Planificación Adaptativa

#### US-020: Generar Plan Inicial
**Como** estudiante  
**Quiero** generar un plan de aprendizaje inicial personalizado con IA  
**Para** tener una ruta estructurada con módulos y actividades adaptadas a mis objetivos y nivel

**Criterios de Aceptación:**
- [ ] El estudiante puede solicitar un plan especificando sus objetivos de aprendizaje
- [ ] El sistema invoca al motor de IA para generar el plan
- [ ] El plan generado contiene módulos ordenados secuencialmente
- [ ] Cada módulo contiene actividades con contenidos específicos
- [ ] El plan considera los prerrequisitos entre skills
- [ ] El plan considera el nivel actual del estudiante (evaluación diagnóstica)
- [ ] El plan incluye estimación de tiempo total y por módulo
- [ ] El plan se guarda asociado al usuario con estado "activo"
- [ ] Tiempo de generación menor a 10 segundos

---

#### US-021: Replanificación Adaptativa
**Como** estudiante  
**Quiero** que mi plan se replanifique automáticamente ante cambios en mi progreso  
**Para** mantener una ruta de aprendizaje óptima y actualizada

**Criterios de Aceptación:**
- [ ] La replanificación se activa automáticamente cuando:
  - El estudiante completa un módulo
  - El estudiante falla una evaluación repetidamente (3+ intentos)
  - Han pasado más de 7 días sin actividad
  - El estudiante agrega/modifica objetivos
- [ ] El sistema invoca al motor de IA con el contexto actualizado
- [ ] Se genera un nuevo plan que preserva el progreso existente
- [ ] Las actividades completadas no se repiten (salvo refuerzo explícito)
- [ ] Se notifica al usuario cuando su plan ha sido actualizado
- [ ] Se mantiene historial de planes anteriores
- [ ] El estudiante puede rechazar la replanificación y mantener el plan actual

---

#### US-022: Ver Módulos del Plan
**Como** estudiante  
**Quiero** ver los módulos de mi plan en curso  
**Para** conocer la estructura completa de mi ruta de aprendizaje y mi progreso

**Criterios de Aceptación:**
- [ ] Retorna el plan activo del usuario autenticado
- [ ] Incluye lista de módulos con: nombre, descripción, orden, estado (pendiente/en progreso/completado)
- [ ] Cada módulo incluye sus actividades con estado individual
- [ ] Muestra porcentaje de avance por módulo y total del plan
- [ ] Indica el módulo y actividad actual (siguiente a realizar)
- [ ] Incluye fechas estimadas de completitud
- [ ] Si el usuario no tiene plan activo, retorna HTTP 404 con mensaje sugeriendo crear uno

---

#### US-023: Actualizar Actividad
**Como** estudiante  
**Quiero** actualizar el estado de una actividad (completada/pendiente)  
**Para** registrar mi avance en el plan de aprendizaje

**Criterios de Aceptación:**
- [ ] El estudiante puede marcar una actividad como "completada"
- [ ] Se registra la fecha y hora de completitud
- [ ] Se registra el tiempo dedicado a la actividad (si está disponible)
- [ ] Al completar la última actividad de un módulo, el módulo se marca como completado
- [ ] Al completar el último módulo, el plan se marca como completado
- [ ] Se genera un evento de tracking para analítica
- [ ] Se evalúa si es necesario activar replanificación
- [ ] Retorna el estado actualizado de la actividad y el módulo

---

### Épica 4: Evaluación Adaptativa

#### US-030: Crear Sesión de Evaluación
**Como** estudiante  
**Quiero** iniciar una sesión de evaluación adaptativa  
**Para** medir mi nivel de conocimiento de forma personalizada

**Criterios de Aceptación:**
- [x] El estudiante puede iniciar una evaluación especificando la skill a evaluar
- [x] Se crea una sesión con estado "activa" y timestamp de inicio
- [x] La sesión tiene un tiempo máximo configurable (por defecto 30 minutos)
- [x] Se selecciona el primer ítem usando el algoritmo adaptativo
- [x] Solo puede haber una sesión activa por usuario a la vez
- [x] Retorna: ID de sesión, primer ítem, tiempo restante
- [x] Si ya existe una sesión activa, ofrece retomarla o cancelarla

**Estado:** ✅ Completado (con adaptatividad real)

---

#### US-032: Enviar Respuesta
**Como** estudiante  
**Quiero** enviar mis respuestas durante la evaluación  
**Para** que el sistema registre y analice mi desempeño

**Criterios de Aceptación:**
- [x] El estudiante envía: ID de sesión, ID de ítem, respuesta, tiempo de respuesta
- [x] Se valida que el ítem corresponda a la sesión activa
- [x] Se evalúa automáticamente si la respuesta es correcta
- [x] Se actualiza el nivel estimado del estudiante (algoritmo IRT/CAT simplificado)
- [x] Se registra la respuesta con todos los metadatos
- [x] Retorna: resultado (correcto/incorrecto), puntuación parcial, si hay siguiente ítem
- [x] Si la sesión expiró, retorna HTTP 410 (Gone)

**Estado:** ✅ Completado (con algoritmo IRT/CAT simplificado)

---

#### US-033: Generar Feedback Personalizado
**Como** estudiante  
**Quiero** recibir feedback personalizado generado por IA tras responder  
**Para** entender mis errores y recibir explicaciones o pistas contextuales

**Criterios de Aceptación:**
- [x] Tras cada respuesta incorrecta, se genera feedback automáticamente
- [x] El feedback es generado por el motor de IA
- [x] Incluye: explicación del concepto, por qué la respuesta era incorrecta, pista para entender
- [x] El tono es pedagógico, positivo y motivador
- [x] El feedback está contextualizado a la pregunta específica
- [x] El estudiante puede solicitar feedback adicional ("explicar de otra forma")
- [x] Tiempo de generación menor a 3 segundos
- [x] Para respuestas correctas, ofrece refuerzo positivo opcional

**Estado:** ✅ Completado (con mock para feedback alternativo)

---

#### US-034: Consultar Dominio
**Como** estudiante  
**Quiero** consultar mi nivel de dominio por habilidad  
**Para** conocer mi progreso y áreas de mejora en cada competencia

**Criterios de Aceptación:**
- [ ] El estudiante puede consultar su nivel en una skill específica o en todas
- [ ] Retorna: skill, nivel de dominio (0-100%), fecha de última evaluación
- [ ] Incluye tendencia (mejorando, estable, decayendo)
- [ ] Incluye número de evaluaciones realizadas por skill
- [ ] Muestra desglose por sub-temas si aplica
- [ ] Indica skills con nivel bajo que requieren atención
- [ ] Compara con promedio de usuarios similares (opcional, anonimizado)

---

### Épica 5: Tracking y Analítica del Aprendizaje

#### US-040: Registrar Evento
**Como** sistema/plataforma  
**Quiero** registrar eventos de interacción significativa del usuario  
**Para** almacenar datos que permitan analizar el comportamiento de aprendizaje

**Criterios de Aceptación:**
- [ ] El sistema puede registrar eventos de tipo: PAGE_VIEW, CONTENT_START, CONTENT_COMPLETE, EVALUATION_START, EVALUATION_END, PLAN_GENERATED, ACTIVITY_COMPLETE
- [ ] Cada evento incluye: tipo, timestamp, user_id, entity_id, entity_type, metadata (JSON)
- [ ] Los eventos se almacenan de forma asíncrona (no bloquea la operación principal)
- [ ] Se valida el formato del evento antes de almacenar
- [ ] Los eventos son inmutables (no se pueden modificar una vez creados)
- [ ] Soporta alta concurrencia (1000+ eventos/segundo)
- [ ] Retorna confirmación de recepción (HTTP 202 Accepted)

---

#### US-041: Consultar Eventos
**Como** administrador/analista  
**Quiero** consultar eventos filtrados por usuario, tipo o entidad  
**Para** analizar patrones de uso y tomar decisiones basadas en datos

**Criterios de Aceptación:**
- [ ] Solo usuarios con rol "ADMIN" o "ANALYST" pueden consultar eventos
- [ ] Filtros disponibles: user_id, tipo de evento, entity_id, entity_type, rango de fechas
- [ ] Soporta paginación con cursor para grandes volúmenes
- [ ] Permite ordenar por timestamp (ascendente/descendente)
- [ ] Permite exportar resultados en formato CSV/JSON
- [ ] Límite máximo de 10,000 registros por consulta
- [ ] Incluye agregaciones básicas: conteo por tipo, por día
- [ ] Un usuario regular solo puede ver sus propios eventos

---

### Épica 6: Motor de Inteligencia Artificial

#### US-050: Generar Plan IA
**Como** servicio de planificación  
**Quiero** invocar al motor de IA para generar un plan personalizado desde cero  
**Para** crear módulos y actividades adaptadas al perfil del estudiante

**Criterios de Aceptación:**
- [ ] Recibe como entrada: perfil del estudiante, objetivos, nivel actual por skill, tiempo disponible
- [ ] Genera un plan estructurado con módulos y actividades
- [ ] Cada módulo tiene: nombre, descripción, skills objetivo, duración estimada
- [ ] Cada actividad tiene: tipo, contenido asociado, orden, duración
- [ ] Respeta los prerrequisitos entre skills
- [ ] Prioriza según los objetivos del estudiante
- [ ] El plan es coherente pedagógicamente (secuencia lógica)
- [ ] Tiempo de respuesta menor a 8 segundos
- [ ] Retorna JSON estructurado según esquema definido

---

#### US-051: Replanificación IA
**Como** servicio de planificación  
**Quiero** invocar al motor de IA para replanificar dinámicamente  
**Para** ajustar el plan de forma coherente ante cambios en el progreso del estudiante

**Criterios de Aceptación:**
- [ ] Recibe como entrada: plan actual, progreso (actividades completadas), eventos recientes, nuevos objetivos
- [ ] Genera un nuevo plan que incorpora el progreso existente
- [ ] Identifica actividades que deben agregarse, eliminarse o reordenarse
- [ ] No repite contenido ya completado exitosamente
- [ ] Agrega refuerzo para áreas donde el estudiante mostró dificultades
- [ ] Mantiene coherencia con los objetivos originales y nuevos
- [ ] Tiempo de respuesta menor a 5 segundos
- [ ] Incluye explicación de los cambios realizados

---

#### US-052: Ítem Adaptativo IA
**Como** servicio de evaluación  
**Quiero** invocar al motor de IA para seleccionar el siguiente ítem adaptativo  
**Para** elegir preguntas coherentes con el desempeño actual del estudiante

**Criterios de Aceptación:**
- [ ] Recibe como entrada: skill evaluada, historial de respuestas de la sesión, nivel estimado actual, ítems ya presentados
- [ ] Selecciona el ítem óptimo usando algoritmo CAT (Computerized Adaptive Testing)
- [ ] El ítem tiene máxima información para el nivel estimado
- [ ] Evita ítems ya respondidos en la sesión
- [ ] Considera balance de sub-temas dentro de la skill
- [ ] Tiempo de respuesta menor a 500ms
- [ ] Retorna: ID del ítem seleccionado, dificultad, justificación de selección
- [ ] Si no hay ítems disponibles, indica finalización

---

#### US-053: Feedback IA
**Como** servicio de evaluación  
**Quiero** invocar al motor de IA para generar feedback pedagógico  
**Para** proporcionar explicaciones claras, correctas y personalizadas en lenguaje natural

**Criterios de Aceptación:**
- [ ] Recibe como entrada: pregunta, respuesta del estudiante, respuesta correcta, contexto del estudiante
- [ ] Genera explicación del concepto subyacente
- [ ] Explica por qué la respuesta dada era incorrecta (si aplica)
- [ ] Proporciona una pista o forma alternativa de entender
- [ ] El tono es empático, motivador y pedagógico
- [ ] Adaptado al nivel del estudiante (vocabulario apropiado)
- [ ] Longitud apropiada (50-200 palabras)
- [ ] Tiempo de generación menor a 2 segundos
- [ ] Soporta solicitud de "explicar de otra forma" con respuesta diferente

---

## 📝 Requisitos funcionales 

### Gestión de usuario y perfil 

#### RF-1.1 Registro de usuario - El sistema deberá permitir el registro de nuevos usuarios y crear automáticamente su perfil interno asociado al identificador de autenticación. 

#### RF-1.2 Autenticación y acceso - El sistema deberá restringir el acceso a las funcionalidades personalizadas únicamente a usuarios autenticados. 

#### RF-1.3 Consulta de perfil - El sistema deberá permitir al usuario autenticado consultar su perfil, incluyendo datos personales básicos y preferencias relevantes para el aprendizaje. 

#### RF-1.4 Edición de perfil - El sistema deberá permitir al usuario actualizar sus datos de perfil (por ejemplo, idioma, zona horaria, preferencias de notificación y nivel declarado). 

#### RF-1.5 Gestión de objetivos de aprendizaje - El sistema deberá permitir al usuario crear, modificar y desactivar objetivos de aprendizaje individuales asociados a su perfil. 


### Gestión de contenidos y estructura formativa  

#### RF-2.1 Gestión de dominios de conocimiento - El sistema deberá permitir listar y gestionar dominios de conocimiento (por ejemplo, “Fundamentos de Programación”) como contenedores de habilidades y contenidos. 

#### RF-2.2 Gestión de habilidades (skills) - El sistema deberá permitir definir y consultar habilidades (skills) asociadas a cada dominio de conocimiento. 

#### RF-2.3 Prerrequisitos entre habilidades - El sistema deberá permitir configurar relaciones de prerrequisito entre habilidades, de forma que se pueda controlar la progresión lógica del aprendizaje. 

#### RF-2.4 Gestión de ítems de contenido - El sistema deberá permitir crear, actualizar, consultar y eliminar ítems de contenido (lecciones, ejercicios, cuestionarios, etc.) asociados a habilidades concretas. 

#### RF-2.5 Consulta de contenidos disponibles - El sistema deberá permitir al usuario consultar los contenidos disponibles filtrando por dominio, habilidad u otros criterios relevantes. 


### Planificación adaptativa del aprendizaje 

#### RF-3.1 Generación de plan inicial - El sistema deberá generar un plan de aprendizaje inicial personalizado para cada usuario, considerando su perfil, objetivos y nivel de conocimiento declarado o detectado. 

#### RF-3.2 Estructura del plan - El sistema deberá representar cada plan de aprendizaje como una estructura de módulos y actividades ordenadas, vinculadas a habilidades y contenidos concretos. 

#### RF-3.3 Replanificación dinámica - El sistema deberá poder reajustar un plan de aprendizaje existente (replanificación) cuando cambien las condiciones del usuario (por ejemplo, nuevo objetivo, retraso, avance más rápido o cambios en su nivel de dominio). 

#### RF-3.4 Actualización del estado de actividades - El sistema deberá permitir registrar el estado de cada actividad (pendiente, en curso, completada, bloqueada) y reflejarlo en el plan de aprendizaje. 

#### RF-3.5 Consulta de plan y módulos - El sistema deberá permitir al usuario consultar en cualquier momento su plan actual, así como el detalle de los módulos y actividades que lo componen. 


### Evaluación y retroalimentación adaptativa 

#### RF-4.1 Creación de sesiones de evaluación - El sistema deberá permitir la creación de sesiones de evaluación asociadas a uno o varios objetivos o habilidades del usuario. 

#### RF-4.2 Selección adaptativa de ítems de evaluación - El sistema deberá seleccionar de forma adaptativa el siguiente ítem de evaluación de una sesión, en función de las respuestas anteriores y del nivel estimado del usuario. 

#### RF-4.3 Registro de respuestas - El sistema deberá registrar las respuestas del usuario a cada ítem de evaluación, incluyendo tiempo de respuesta y resultados. 

#### RF-4.4 Generación de feedback personalizado - El sistema deberá proporcionar retroalimentación personalizada al usuario sobre sus respuestas, pudiendo incluir explicaciones, pistas o sugerencias de contenido adicional. 

#### RF-4.5 Estimación de dominio por habilidad - El sistema deberá estimar y almacenar el nivel de dominio del usuario para cada habilidad relevante, utilizando los resultados de las evaluaciones y las actividades completadas. 


### Tracking y analítica de aprendizaje 

#### RF-5.1 Registro de eventos de aprendizaje - El sistema deberá registrar eventos significativos de aprendizaje (por ejemplo, inicio/fin de actividad, errores, aciertos, tiempo dedicado, abandonos) asociados a usuario, plan y actividad. 

#### RF-5.2 Consulta de eventos - El sistema deberá permitir la consulta de eventos de aprendizaje filtrados por usuario, tipo de evento, rango temporal y entidad relacionada (plan, actividad, habilidad). 

#### RF-5.3 Soporte a analítica de aprendizaje - El sistema deberá poner a disposición de los componentes de analítica y de inteligencia artificial los eventos y datos de progreso necesarios para calcular métricas e indicadores (por ejemplo, tiempo total, tasa de éxito, nivel de dominio). 


### Servicios de Inteligencia Artificial 

#### RF-6.1 Motor de generación de planes con IA - El sistema deberá disponer de un componente de inteligencia artificial capaz de generar planes de aprendizaje personalizados a partir de la información de perfil, objetivos, habilidades y contenidos disponibles. 

#### RF-6.2 Motor de replanificación con IA - El sistema deberá permitir que el componente de IA reajuste un plan existente cuando se detecten cambios en el desempeño, el seguimiento o los objetivos del usuario. 

#### RF-6.3 Motor de selección adaptativa de ítems - El sistema deberá disponer de un componente de IA capaz de seleccionar el siguiente ítem de evaluación de manera adaptativa según el historial de respuestas del usuario. 

#### RF-6.4 Motor de generación de feedback pedagógico - El sistema deberá disponer de un componente de IA capaz de generar feedback pedagógico en lenguaje natural, coherente con la respuesta del usuario y el contenido evaluado. 

---

## 🔧 Requisitos No Funcionales

### RNF-001: Performance
- Tiempo de carga < 3 segundos
- Lazy loading de imágenes
- Paginación eficiente

### RNF-002: UX/UI
- Design system consistente
- Responsive design
- Accesibilidad WCAG 2.1

### RNF-003: Seguridad
- HTTPS obligatorio
- Sanitización de inputs
- Protección XSS

### RNF-004: Escalabilidad
- Arquitectura modular
- Componentes reutilizables
- Código mantenible

---

## 🎨 Design System

### Colores
- Primary: #3b82f6 (blue-500)
- Secondary: #64748b (slate-500)
- Success: #10b981 (emerald-500)
- Warning: #f59e0b (amber-500)
- Error: #ef4444 (red-500)

### Tipografía
- Títulos: 1.5rem, font-weight: 600
- Subtítulos: 1.25rem, font-weight: 600
- Body: 0.875rem, font-weight: 400
- Small: 0.75rem, font-weight: 500

### Espaciado
- Base: 0.25rem (4px)
- Escala: 0.25, 0.5, 0.75, 1, 1.5, 2, 3rem

### Componentes
- Buttons: 3 variantes (primary, secondary, ghost)
- Cards: con shadow y hover states
- Forms: validación en tiempo real
- Modals: overlay con backdrop

---

## 📊 Métricas de Éxito

### KPIs
- Tasa de conversión (registro → primer curso)
- Tiempo promedio en plataforma
- Tasa de finalización de cursos
- Engagement diario/semanal

### Métricas Técnicas
- Lighthouse score > 90
- Bundle size < 500KB gzipped
- Tiempo de first paint < 1.5s

---

## 🚀 Roadmap

### Sprint 1 (Actual) - ✅ Completado
- [x] Autenticación completa
- [x] Gestión de perfil
- [x] Dashboard básico
- [x] Gestión de objetivos
- [x] Catálogo de contenidos

### Sprint 2
- [ ] Detalle de contenido
- [ ] Reproductor de video
- [ ] Sistema de progreso
- [ ] Notificaciones

### Sprint 3
- [ ] Estadísticas avanzadas
- [ ] Certificados
- [ ] Gamificación
- [ ] Sistema de bookmarks

### Futuro
- [ ] Mobile app
- [ ] Offline mode
- [ ] AI recommendations
- [ ] Live classes

---

## 📝 Notas

### Decisiones Arquitectónicas
1. **CSS Modules** sobre styled-components por mejor performance
2. **Zustand** sobre Redux por simplicidad
3. **React Query** para caché de servidor
4. **Vite** por velocidad de desarrollo

### Deudas Técnicas
- [x] Implementar tests unitarios
- [ ] Añadir Storybook
- [ ] Optimizar imágenes con WebP
- [ ] Implementar PWA

---

*Última actualización: 18 de Enero, 2026*
