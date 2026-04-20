# Manual de Usuario - App de Calendario LSA
La app de Calendario LSA es una herramienta diseñada para gestionar calendarios y eventos de la organización La Senda Antigua. Permite visualizar, crear y editar eventos según los permisos del usuario, con soporte para notificaciones push y múltiples métodos de autenticación.

## Plan de Contenidos

1. **Instalación de la App**
   - Enlaces de descarga para Android (Google Play) y iOS (App Store)

2. **Inicio de Sesión**
   - Métodos de login disponibles (usuario/contraseña, Google, Apple)
   - Recuperación de sesión automática
   - Manejo de errores de login

3. **Pantalla Principal - Vista General**
   - Navegación básica (barra superior, drawer, menú de perfil)
   - Modos de vista disponibles (Día, Mes, Asignados a mí)
   - Navegación por fechas y meses

4. **Gestión de Calendarios**
   - Ver calendarios disponibles
   - Seleccionar/deseleccionar calendarios en el drawer
   - Permisos y roles (usuario normal, calendar manager, admin)

5. **Visualización de Eventos**
   - Cómo se muestran los eventos en cada modo de vista
   - Información mostrada por evento (título, descripción, asignados, calendario)
   - Navegación entre eventos con fechas

6. **Creación y Edición de Eventos**
   - Requisitos para crear eventos (permisos necesarios)
   - Campos del formulario (título, descripción, fecha/hora, asignados, calendario)
   - Eventos de todo el día vs. eventos con hora específica
   - Copiar eventos

7. **Eliminación de Eventos**
   - Confirmación de eliminación
   - Permisos requeridos

8. **Notificaciones y Actualizaciones**
   - Notificaciones push
   - Actualización automática de datos
   - Manejo de conflictos de eventos

9. **Cerrar Sesión y Seguridad**
   - Cómo cerrar sesión
   - Limpieza de datos locales
   - Seguridad de la información

10. **Solución de Problemas**
    - Errores comunes (conexión, permisos)
    - Reinicio de la app
    - Contacto de soporte

11. **Configuraciones Avanzadas**
    - Idioma de la app (español/inglés)
    - Versión de la app
    - Información del usuario

## 1. Instalación de la App

La aplicación de Calendario LSA está disponible para dispositivos Android e iOS. Sigue los siguientes pasos para instalarla en tu dispositivo.

### Requisitos del Sistema
- **Android**: Versión 5.0 o superior
- **iOS**: Versión 12.0 o superior
- Conexión a internet para el funcionamiento completo

### Enlaces de Descarga
- **Android (Google Play Store)**: [Descargar desde Google Play](https://play.google.com/store/apps/details?id=com.iglesialasendaantigua.calendar)
- **iOS (App Store)**: [Descargar desde App Store](https://apps.apple.com/us/app/calendario-la-senda/id6757451489)

### Pasos de Instalación
1. Haz clic en el enlace correspondiente a tu dispositivo.
2. Serás redirigido a la tienda de aplicaciones oficial.
3. Haz clic en "Instalar" o "Actualizar".
4. Espera a que se complete la descarga e instalación.
5. Una vez instalada, abre la app y sigue las instrucciones de inicio de sesión.


## 2. Inicio de Sesión

La aplicación de Calendario LSA ofrece múltiples formas de iniciar sesión para facilitar el acceso a los usuarios. Al abrir la app por primera vez, serás dirigido automáticamente a la pantalla de login.

### Métodos de Inicio de Sesión Disponibles

#### 1. Inicio de Sesión con Usuario y Contraseña
- **Campos requeridos**:
  - **Usuario**: Ingresa tu nombre de usuario proporcionado por el administrador del sistema.
  - **Contraseña**: Ingresa tu contraseña. La contraseña se oculta por defecto; puedes hacer clic en el ícono del ojo para mostrarla.
- **Pasos**:
  1. Completa los campos de usuario y contraseña.
  2. Haz clic en el botón "Iniciar Sesión" (botón azul con texto blanco).
  3. Si las credenciales son correctas, accederás automáticamente a la pantalla principal.
- **Nota**: En modo de desarrollo, los campos pueden estar prellenados para facilitar las pruebas.

#### 2. Inicio de Sesión con Google
- **Requisitos**: Debes tener una cuenta de Google configurada en tu dispositivo.
- **Pasos**:
  1. Haz clic en el botón "Continuar con Google" (botón blanco con ícono de Google y texto negro).
  2. Se abrirá una ventana emergente de Google para seleccionar tu cuenta.
  3. Autoriza el acceso a tu cuenta de Google.
  4. Si la autenticación es exitosa, accederás automáticamente a la pantalla principal.
- **Nota**: Si cancelas el proceso, la app permanecerá en la pantalla de login.

#### 3. Inicio de Sesión con Apple (solo en iOS)
- **Requisitos**: Disponible únicamente en dispositivos iOS con iOS 13 o superior.
- **Pasos**:
  1. Haz clic en el botón "Continuar con Apple" (botón negro con ícono de Apple y texto blanco).
  2. Se abrirá la ventana de autenticación de Apple ID.
  3. Autoriza el acceso usando tu huella dactilar, Face ID o código de acceso.
  4. Si la autenticación es exitosa, accederás automáticamente a la pantalla principal.

### Recuperación Automática de Sesión
- La app guarda automáticamente tu sesión para evitar que tengas que iniciar sesión cada vez.
- Si has iniciado sesión previamente y la sesión aún es válida, al abrir la app serás dirigido directamente a la pantalla principal.
- Si la sesión ha expirado, la app intentará renovarla automáticamente usando tokens de refresco.
- En caso de que la renovación falle, deberás iniciar sesión nuevamente.

### Manejo de Errores de Inicio de Sesión
- **Credenciales incorrectas**: Si el usuario o contraseña son incorrectos, aparecerá un mensaje: "Usuario o contraseña incorrectos".
- **Error de conexión**: Si hay problemas de red, aparecerá un mensaje: "Error de conexión. Verifica tu conexión a internet".
- **Permisos insuficientes**: Si tu cuenta no tiene permisos para acceder, aparecerá un mensaje: "No tienes permisos para acceder a esta aplicación".
- **Error en Google/Apple**: Si falla la autenticación externa, aparecerá un mensaje específico del error.
- **Sesión expirada**: Si intentas acceder con una sesión expirada, la app limpiará los datos locales y te pedirá iniciar sesión nuevamente.

### Información Adicional
- **Versión de la app**: En la parte inferior de la pantalla de login se muestra la versión actual de la app (ej: v1.0.0).
- **Seguridad**: Todos los inicios de sesión se realizan a través de conexiones seguras HTTPS. Los tokens de acceso se almacenan de forma segura en el dispositivo.
- **Registro de dispositivo**: Al iniciar sesión exitosamente, la app registra automáticamente tu dispositivo para recibir notificaciones push relacionadas con los calendarios y eventos.

## 3. Pantalla Principal - Vista General

Una vez que inicies sesión, accederás a la pantalla principal de la app, que es el centro de gestión de calendarios y eventos. Esta pantalla está diseñada para ser intuitiva y eficiente, permitiéndote navegar rápidamente entre fechas, cambiar modos de vista y acceder a funciones clave.

### Elementos de la Interfaz

#### 1. Barra Superior (App Bar)
- **Botón de Menú (izquierda)**: Ícono de tres líneas horizontales (☰) en la esquina superior izquierda. Al hacer clic, abre el drawer lateral (menú de navegación).
- **Título**: Muestra "Calendario LSA" o el nombre de la app.
- **Menú de Perfil (derecha)**: Un avatar circular que representa al usuario actual. Al hacer clic, se despliega un menú emergente con:
  - Nombre de usuario y correo electrónico (si está disponible).
  - Opción "Cerrar Sesión" para salir de la app.

#### 2. Navegador de Meses
- Ubicado en la parte superior del contenido principal.
- Muestra el mes y año actual (ej: "Abril 2026").
- **Botones de navegación**:
  - Flecha izquierda (◀): Retrocede al mes anterior.
  - Flecha derecha (▶): Avanza al mes siguiente.
- Al cambiar de mes, la lista de eventos se actualiza automáticamente para mostrar los eventos del mes seleccionado.

#### 3. Navegador de Fechas (solo en modo Día)
- Aparece debajo del navegador de meses cuando estás en modo "Día" y hay eventos en el mes.
- Muestra flechas para navegar a la fecha anterior o siguiente con eventos.
- Permite saltar rápidamente a fechas específicas con actividad.

#### 4. Lista de Eventos
- Ocupa la mayor parte de la pantalla.
- Muestra los eventos según el modo de vista seleccionado y los calendarios activos.
- Cada evento se presenta en una tarjeta con información clave.
- Si no hay eventos, muestra un mensaje indicando que no hay eventos para mostrar.
- Soporta deslizar hacia abajo para refrescar los datos.

#### 5. Botón Flotante de Agregar Evento
- Ícono de "+" en un círculo azul, ubicado en la esquina inferior derecha.
- Solo visible si tienes permisos para crear eventos (roles de administrador o calendar manager).
- Al hacer clic, abre un formulario modal para crear un nuevo evento.

### Modos de Vista Disponibles
La app ofrece tres modos de vista principales, accesibles desde el drawer lateral:

#### Modo Día
- Muestra eventos del día seleccionado.
- Navegación por fechas individuales.
- Ideal para ver el horario diario detallado.

#### Modo Mes
- Muestra todos los eventos del mes en una lista.
- Eventos ordenados por fecha y calendario.
- Útil para tener una visión general mensual.

#### Modo Asignados a Mí
- Muestra solo los eventos donde apareces como asignado.
- Filtra automáticamente los eventos relevantes para ti.
- Perfecto para enfocarte en tus responsabilidades.

### Navegación por Fechas y Meses
- **Cambio de mes**: Usa los botones del navegador de meses para moverte entre meses. La app cargará automáticamente los eventos del nuevo mes.
- **Navegación en modo Día**: Si hay eventos en fechas adyacentes, aparecerán flechas para navegar rápidamente.
- **Animaciones**: Los cambios de fecha incluyen transiciones suaves (deslizamiento) para una mejor experiencia visual.
- **Carga automática**: Al cambiar de mes, la app busca eventos en el mes actual y, si no los encuentra, en meses futuros hasta encontrar actividad.

### Interacciones Básicas
- **Abrir drawer**: Toca el ícono de menú en la barra superior.
- **Cambiar modo de vista**: En el drawer, selecciona el modo deseado (Día, Mes, Asignados).
- **Refrescar datos**: Desliza hacia abajo en la lista de eventos.
- **Agregar evento**: Toca el botón flotante "+" (si está disponible).
- **Cerrar sesión**: Toca tu avatar y selecciona "Cerrar Sesión".

### Notas Importantes
- La pantalla se adapta automáticamente al idioma seleccionado (español o inglés).
- Los eventos se filtran según los calendarios seleccionados en el drawer.
- Si pierdes conexión a internet, algunos datos pueden no actualizarse hasta que se restablezca la conexión.
- La app recibe notificaciones push que pueden actualizar la pantalla automáticamente.

## 4. Gestión de Calendarios

Los calendarios son contenedores organizativos que agrupan eventos relacionados. La app permite gestionar múltiples calendarios, cada uno con sus propios permisos y miembros. La gestión se realiza principalmente a través del drawer lateral (menú de navegación).

### Acceso al Drawer de Calendarios
1. Desde la pantalla principal, toca el ícono de menú (☰) en la esquina superior izquierda de la barra.
2. Se abrirá el drawer lateral desde el lado izquierdo de la pantalla.
3. El drawer contiene dos secciones principales: modos de vista y lista de calendarios.

### Ver Calendarios Disponibles
- En la sección "Mis Calendarios", verás una lista de todos los calendarios a los que tienes acceso.
- Cada calendario se muestra con:
  - Un círculo de color único para identificación visual.
  - El nombre del calendario.
  - Un checkbox para seleccionar/deseleccionar.
- Los calendarios se cargan automáticamente al iniciar sesión y se actualizan cuando refrescas la pantalla principal.

### Seleccionar/Deseleccionar Calendarios
- **Seleccionar un calendario**: Marca el checkbox junto al nombre del calendario. Los eventos de ese calendario aparecerán en la lista principal.
- **Deseleccionar un calendario**: Desmarca el checkbox. Los eventos de ese calendario se ocultarán de la vista.
- **Selección múltiple**: Puedes tener varios calendarios seleccionados simultáneamente.
- **Persistencia**: Tus selecciones se guardan automáticamente y se mantienen entre sesiones de la app.
- **Efecto inmediato**: Los cambios en la selección se reflejan inmediatamente en la lista de eventos sin necesidad de refrescar.

### Tipos de Calendarios
- **Calendarios públicos**: Accesibles por todos los usuarios de la organización.
- **Calendarios privados**: Restringidos a miembros específicos.
- **Calendarios ocultos**: Solo visibles para administradores y managers.

### Permisos y Roles
La visibilidad y gestión de calendarios depende de tu rol en el sistema:

#### Usuario Normal
- Puedes ver calendarios públicos y aquellos donde eres miembro.
- Solo puedes seleccionar/deseleccionar calendarios para filtrar eventos.
- No puedes crear o modificar calendarios.

#### Calendar Manager
- Acceso a calendarios donde eres designado como manager.
- Puedes crear, editar y eliminar eventos en calendarios que gestionas.
- Puedes asignar miembros a eventos dentro de tus calendarios.

#### Administrador (Admin)
- Acceso completo a todos los calendarios del sistema.
- Puedes gestionar cualquier calendario y evento.
- Tiene permisos para crear nuevos calendarios y modificar configuraciones globales.

### Gestión de Miembros y Managers
- **Managers**: Usuarios con permisos para gestionar eventos en el calendario (crear, editar, eliminar).
- **Members**: Usuarios que pueden ser asignados a eventos del calendario.
- Los administradores pueden modificar la lista de managers y members de cada calendario a través del backend del sistema.

### Funcionalidades Avanzadas
- **Filtrado automático**: En modo "Asignados a mí", solo se muestran eventos de calendarios seleccionados donde apareces como asignado.
- **Colores distintivos**: Cada calendario tiene un color único para diferenciar eventos en la vista mensual.
- **Actualización en tiempo real**: Los cambios en calendarios (nuevos calendarios, cambios de permisos) se reflejan al refrescar la app.

### Cerrar el Drawer
- Toca el ícono de "X" en la esquina superior derecha del drawer.
- O desliza el drawer hacia la izquierda para cerrarlo.
- También se cierra automáticamente al seleccionar un modo de vista o al tocar fuera del drawer.

### Solución de Problemas
- **Calendarios no aparecen**: Verifica tu conexión a internet y refresca la pantalla principal deslizando hacia abajo.
- **No puedes seleccionar un calendario**: Puede deberse a permisos insuficientes. Contacta a un administrador.
- **Cambios no se guardan**: Asegúrate de tener conexión estable. Las selecciones se guardan localmente en tu dispositivo.

## 5. Visualización de Eventos

Los eventos son las actividades o compromisos programados dentro de los calendarios. La app proporciona múltiples formas de visualizar eventos, cada una optimizada para diferentes necesidades y contextos. Los eventos se muestran de manera diferente según el modo de vista seleccionado.

### Cómo se Muestran los Eventos en Cada Modo de Vista

#### Modo Día
- Muestra todos los eventos del día seleccionado en una lista vertical.
- Los eventos aparecen en orden cronológico (ordenados por hora de inicio).
- **Características**:
  - Cada evento ocupa una tarjeta con toda la información visible.
  - Ideal para planificación diaria y horarios detallados.
  - Se actualiza automáticamente al cambiar de día usando el navegador de fechas.
  - Si no hay eventos en el día seleccionado pero los hay en otras fechas del mes, aparecen botones de navegación para ir a la siguiente fecha con eventos.

#### Modo Mes
- Muestra todos los eventos del mes seleccionado en una lista.
- Los eventos se ordenan por:
  1. Calendario (por orden de aparición en la lista)
  2. Fecha (dentro del mismo calendario)
  3. Hora de inicio
- **Características**:
  - Útil para tener una visión general de todas las actividades del mes.
  - Facilita la planificación a largo plazo y la identificación de períodos ocupados.
  - Los eventos de todo el día aparecen primero.
  - Al cambiar de mes, la lista se actualiza automáticamente.

#### Modo Asignados a Mí
- Muestra solo los eventos donde el usuario actual aparece como asignado.
- Los eventos se filtran automáticamente por:
  1. Calendarios seleccionados (respeta tu selección de calendarios activos).
  2. Presencia del usuario como asignado.
- Se ordenan por fecha y hora de inicio.
- **Características**:
  - Perfecto para enfocarse en responsabilidades personales.
  - Muestra solo eventos relevantes al usuario.
  - Incluye eventos de todos los meses (no está limitado al mes actual).

### Información Mostrada por Evento
Cada evento en la lista se presenta como una tarjeta con los siguientes elementos:

#### Información Básica
- **Título del evento**: Nombre principal del evento en texto destacado.
- **Descripción**: Descripción adicional del evento (si existe).
- **Calendario**: Indica a qué calendario pertenece el evento (con el color distintivo del calendario).

#### Información Temporal
- **Fecha**: Aparece en la lista del mes. En modo día no es necesaria por contexto.
- **Hora de inicio y fin**: Muestra el rango horario del evento (ej: "09:00 - 10:30").
- **Todo el día**: Si el evento es de todo el día, se indica especialmente y no muestra hora específica.
- **Evento de múltiples días**: Si el evento abarca varios días, se muestra la información de duración total.

#### Participantes
- **Asignados**: Lista de usuarios asignados al evento. Cada asignado se muestra con:
  - Nombre completo (si está disponible).
  - Avatar o inicial del nombre.
  - Rol (User, Calendar Manager, Admin, etc.).

#### Indicadores Visuales
- **Color del calendario**: Un cuadrado o línea de color representa el calendario del evento.
- **Conflictos**: Si hay conflictos de horario con otros eventos, se indica visualmente.
- **Estado**: Eventos pueden mostrar indicadores de estado si están configurados.

### Interacciones con Eventos

#### Tocar un Evento
- Actualmente, tocar un evento no abre un modal de detalles, pero prepara la selección para acciones.
- Los eventos pueden editarse o eliminarse mediante los botones de acción en la tarjeta.

#### Botones de Acción (disponibles según permisos)
- **Editar**: Ícono de lápiz o botón "Editar". Solo aparece si tienes permisos para editar el evento (eres manager del calendario).
- **Eliminar**: Ícono de papelera o botón "Eliminar". Solo aparece si tienes permisos para eliminar eventos.
- Estos botones se muestran o se ocultan según tu rol y permisos en el calendario del evento.

### Navegación Entre Eventos con Fechas

#### Navegador de Fechas (Modo Día)
- Aparece debajo del mes cuando hay eventos en el mes actual.
- Muestra:
  - **Flecha izquierda (◀)**: Navega a la última fecha anterior con eventos.
  - **Flecha derecha (▶)**: Navega a la próxima fecha posterior con eventos.
- Al tocar una flecha, la vista se actualiza al día seleccionado automáticamente.
- Las flechas se desactivan si no hay fechas disponibles en esa dirección.

#### Cambio de Mes
- Usa los botones "◀" y "▶" del navegador de meses.
- La lista de eventos se actualiza automáticamente al nuevo mes.
- Si el mes no tiene eventos, la app busca automáticamente el próximo mes con eventos y salta a ese mes.

#### Animaciones de Transición
- Al cambiar de fecha o mes, la lista de eventos se desliza suavemente hacia adentro o hacia afuera.
- La dirección de la animación indica si estás avanzando o retrocediendo en el tiempo (hacia adelante o hacia atrás).

### Filtrado de Eventos

#### Por Calendarios
- Los eventos se filtran automáticamente según los calendarios seleccionados en el drawer.
- Si deseleccionas un calendario, sus eventos desaparecen de la vista inmediatamente.
- Puedes seleccionar/deseleccionar múltiples calendarios para ver diferentes combinaciones.

#### Por Tipo (según modo de vista)
- **Modo Día**: Solo eventos del día seleccionado.
- **Modo Mes**: Solo eventos del mes seleccionado.
- **Modo Asignados**: Solo eventos donde apareces como asignado.

#### Mensaje de Filtrado
- Si hay eventos en el mes pero ninguno coincide con tus calendarios seleccionados, aparece un mensaje:
  "Selecciona un calendario para ver los eventos".

### Actualización de Eventos
- **Actualización automática por notificaciones**: Si recibes una notificación push sobre un evento, la pantalla se actualiza automáticamente.
- **Actualización manual**: Desliza hacia abajo en la lista de eventos para refrescar los datos.
- **Actualización al cambiar mes**: La app carga automáticamente los eventos del nuevo mes.

### Notas Importantes
- El evento más antiguo aparece primero en modo mes y asignados.
- Los eventos se cargan desde el servidor y se cachean localmente para mejor rendimiento.
- Si pierdes conexión a internet, los eventos recientemente mostrados seguirán siendo visibles, pero las actualizaciones no se reflejarán hasta reconectar.
- Los conflictos de horario se detectan automáticamente y se muestran en la tarjeta del evento.

## 6. Creación y Edición de Eventos

La creación y edición de eventos es una funcionalidad central de la app. El proceso es flexible, permitiendo crear eventos rápidamente o con detalles completos según necesites. Ambas operaciones utilizan el mismo formulario modal, con algunas diferencias importantes.

### Requisitos para Crear Eventos
- **Permisos requeridos**: 
  - Debes tener rol de **Administrador (Admin)** o **Calendar Manager** en al menos un calendario.
  - Si eres usuario normal, el botón flotante de "+" no será visible.
- **Acceso al formulario**:
  - Toca el botón flotante azul con el ícono "+" en la esquina inferior derecha de la pantalla principal.
  - El botón solo aparece si tienes permisos suficientes.

### Formulario de Creación/Edición de Eventos

El formulario modal se abre desde la parte inferior de la pantalla. Contiene los siguientes campos:

#### 1. Campo de Calendario (Requerido)
- **Descripción**: Selecciona el calendario en el que deseas crear o editar el evento.
- **Comportamiento**:
  - Solo aparecen los calendarios donde tienes permisos de manager.
  - Este es un campo obligatorio para crear un evento.
  - Al cambiar de calendario, se limpian automáticamente los asignados (para evitar asignaciones inválidas).
- **Validación**: Si intentas guardar sin seleccionar un calendario, aparecerá un mensaje: "Calendar is required".

#### 2. Campo de Asignados (Opcional)
- **Descripción**: Selecciona uno o múltiples usuarios para asignar al evento.
- **Comportamiento**:
  - Se desbloquea solo después de seleccionar un calendario.
  - Muestra "Selecciona un calendario primero" si no hay calendario seleccionado.
  - Toca el campo para abrir un selector de usuarios en una hoja modal.
- **Filtrado de usuarios**:
  - Se muestran solo usuarios que son miembros del calendario seleccionado o administradores.
  - Si el calendario es público u oculto, se muestran todos los usuarios disponibles.
- **Múltiples asignados**:
  - Puedes seleccionar varios usuarios a la vez.
  - Los asignados aparecen como "chips" (etiquetas) debajo del campo.
  - Si hay más de 5 asignados, aparece un botón "..." para expandir/contraer la lista.
- **Grupos de usuarios**:
  - Además de usuarios individuales, puedes seleccionar grupos de usuarios.
  - Al seleccionar un grupo, se añaden todos los miembros del grupo como asignados.
- **Remover asignados**:
  - Toca la "X" en cualquier chip para remover un asignado específico.

#### 3. Campo de Título (Requerido si no hay asignados)
- **Descripción**: Nombre o descripción corta del evento.
- **Validación**: 
  - Si no hay asignados, el título es obligatorio.
  - Si hay al menos un asignado, el título puede estar vacío (la app lo permitirá).
- **Máximo de caracteres**: No hay límite específico, pero se recomienda ser conciso.

#### 4. Campo de Descripción (Opcional)
- **Descripción**: Detalles adicionales sobre el evento.
- **Comportamiento**:
  - Permite múltiples líneas (máximo 2 líneas visibles por defecto).
  - No es obligatorio para guardar el evento.
  - Puedes escribir instrucciones, notas o contexto adicional.

#### 5. Fecha y Hora de Inicio (Requeridas)
- **Fecha de inicio**:
  - Selecciona la fecha en la que comienza el evento.
  - Se abre un selector de fecha al tocar el campo.
  - Puedes elegir cualquier fecha desde el año 2000 hasta 2100.
- **Hora de inicio** (solo si no es "todo el día"):
  - Selecciona la hora en la que comienza el evento.
  - Se abre un selector de hora en formato 12 horas (AM/PM).
  - Puedes seleccionar cualquier hora y minuto.
- **Valor predeterminado**:
  - Para nuevos eventos: Fecha actual a las 10:00 AM.
  - Para eventos editados: Se mantiene la fecha/hora original.

#### 6. Fecha y Hora de Finalización (Requeridas)
- **Fecha de finalización**:
  - Selecciona la fecha en la que termina el evento.
  - **Bloqueo importante**: La fecha de finalización NO puede ser anterior a la fecha de inicio.
  - Si intentas establecer una fecha de finalización anterior, la app ajustará automáticamente la fecha al mismo día del inicio.
- **Hora de finalización** (solo si no es "todo el día"):
  - Selecciona la hora en la que termina el evento.
  - **Bloqueo importante**: La hora de finalización NO puede ser anterior a la hora de inicio en el mismo día.
  - Si configuras una hora de finalización anterior a la de inicio, la app ajustará automáticamente la hora respetando la duración original del evento.
- **Mantenimiento de duración**:
  - Cuando editas un evento existente y cambias la fecha o hora de inicio, la app intenta mantener la duración original.
  - Ejemplo: Si un evento duraba 2 horas y cambias la hora de inicio a las 14:00, el final se ajustará a las 16:00.
- **Valor predeterminado**:
  - Para nuevos eventos: 1 hora después del inicio.
  - Para eventos editados: Se mantiene la fecha/hora original.

#### 7. Opción "Todo el Día" (Toggle)
- **Descripción**: Convierte el evento en un evento de todo el día, sin horarios específicos.
- **Comportamiento al activar**:
  - Los campos de hora de inicio y fin desaparecen automáticamente.
  - La hora de inicio se establece a las 00:00 (medianoche).
  - La hora de finalización se establece a las 23:59:59 (último segundo del día).
  - Solo se muestran los campos de fecha.
- **Ventajas de usar "todo el día"**:
  - Ideal para eventos sin hora específica (cumpleaños, días festivos, milestones).
  - Simplifica la interfaz cuando la hora no es relevante.
  - Los eventos de todo el día se muestran de manera especial en la lista de eventos.
- **Cambiar de todo el día a con hora**:
  - Al desactivar el toggle, reaparecen los campos de hora.
  - La hora se restablece a los valores anteriores si existe ese historial, o a valores predeterminados.

### Validación de Disponibilidad (Detección de Conflictos)
- **Funcionamiento automático**:
  - Cuando seleccionas asignados, la app verifica automáticamente su disponibilidad en el rango de fechas/horas.
  - También se verifica cuando cambias fechas, horas o asignados.
- **Indicador de conflictos**:
  - Si hay conflictos, aparece una advertencia en naranja con un ícono de alerta.
  - El mensaje especifica quién tiene conflictos y en qué calendarios.
  - Ejemplos de mensajes:
    - "Juan Pérez has a conflict with: Reuniones de Equipo"
    - "Multiple users have conflicts: Juan Pérez, María García"
- **Importancia**: Los conflictos son advertencias, no bloqueos. Puedes guardar el evento aunque haya conflictos.
- **Cálculo de conflictos**: La app excluye el evento actual (si estás editando) para evitar marcar conflictos falsos.

### Guardar vs. Guardar y Copiar

#### Botón "Guardar" (Botón azul)
- **Funcionamiento**:
  - Guarda el evento en el calendario seleccionado.
  - Cierra el formulario modal automáticamente.
  - Retorna a la pantalla principal, que se actualiza con el nuevo evento.
- **Para nuevos eventos**: Se envía una solicitud POST al servidor con los datos del evento.
- **Para eventos editados**: Se envía una solicitud PUT con los datos actualizados.
- **Después de guardar**: 
  - Si el evento es en una fecha diferente a la actual, la vista puede cambiar a esa fecha.
  - Aparece un mensaje de confirmación: "Evento guardado" o "Evento actualizado".

#### Botón "Guardar y Copiar" (Botón de contorno)
- **Funcionamiento**:
  - Guarda el evento actual en el servidor (igual que "Guardar").
  - Cierra el modal, pero reabre un nuevo formulario pre-rellenado con los datos del evento recién creado.
  - Permite crear rápidamente eventos similares.
- **Datos que se copian**:
  - Título, descripción, calendario, asignados (todos los detalles del evento guardado).
- **Datos que NO se copian**:
  - ID del evento (se genera uno nuevo).
  - Fecha: Se copia la fecha, pero puedes cambiarla inmediatamente.
  - Hora: Se mantiene la misma hora de inicio.
- **Casos de uso**:
  - Crear eventos recurrentes manualmente.
  - Crear múltiples eventos similares en diferentes fechas.
  - Duplicar reuniones o actividades.
- **Cómo salir del modo "copiar"**:
  - Toca "Guardar" para guardar la copia final.
  - Toca "Cancelar" para descartar la copia y cerrar el formulario.

#### Botón "Cancelar" (Botón de texto)
- Cierra el formulario sin guardar cambios.
- Cualquier dato ingresado se pierde.
- Retorna a la pantalla principal sin actualizar eventos.

### Edición de Eventos Existentes

#### Acceso al formulario de edición
- Toca el ícono de lápiz (editar) en la tarjeta de un evento.
- Solo aparece si tienes permisos para editar el evento (eres manager del calendario).

#### Diferencias en el formulario
- El modal se abre con todos los campos pre-rellenados con los datos actuales del evento.
- El título dice "Editar evento" en lugar de "Crear evento".
- El botón "Guardar y Copiar" está disponible para duplicar el evento.
- Las validaciones y restricciones de fechas funcionan igual que en la creación.

#### Después de editar
- La pantalla se actualiza automáticamente con los cambios.
- Si cambias la fecha del evento, la vista puede cambiar a esa fecha.
- Aparece un mensaje de confirmación: "Evento actualizado".

### Limitaciones y Restricciones Importantes

1. **No puedes crear eventos sin calendario**: El campo de calendario es obligatorio.
2. **No puedes guardar sin validación**: El formulario valida todos los campos antes de permitirte guardar.
3. **La fecha de fin no puede ser anterior a la de inicio**: La app ajustará automáticamente para cumplir esta regla.
4. **La hora de fin no puede ser anterior a la de inicio (mismo día)**: La app ajustará automáticamente.
5. **No puedes cambiar el calendario de un evento existente durante la edición**: El campo de calendario es de solo lectura en la edición.
6. **Los asignados deben ser miembros válidos del calendario**: La app filtra automáticamente usuarios no válidos.

### Validaciones del Formulario
- **Título requerido**: Si no hay asignados, el título es obligatorio.
- **Calendario requerido**: Siempre es obligatorio seleccionar un calendario.
- **Campos vacíos**: No se permite guardar con campos incompletos (excepto descripción).
- **Fechas válidas**: Las fechas deben estar en rango válido (2000-2100).

### Solución de Problemas

- **El formulario dice "Selecciona un calendario primero"**: Debes seleccionar un calendario antes de poder asignar usuarios.
- **No veo el botón de "+"**: No tienes permisos suficientes. Contacta a un administrador para obtener rol de manager.
- **Los cambios de fecha se ajustan automáticamente**: La app está cumpliendo las restricciones de fecha/hora. Verifica que la fecha de fin sea posterior a la de inicio.
- **Aparece advertencia de conflictos**: Verifica la disponibilidad de los asignados. Puedes guardar igual si lo deseas.
- **El evento no se guarda**: Verifica que todos los campos obligatorios estén completos y que haya conexión a internet.

## 7. Eliminación de Eventos

La eliminación de eventos es una operación irreversible que requiere confirmación del usuario. Solo los usuarios con permisos suficientes pueden eliminar eventos.

### Requisitos para Eliminar Eventos
- **Permisos requeridos**: 
  - Debes ser **Administrador (Admin)** del sistema, o
  - Debes ser **Calendar Manager** del calendario al que pertenece el evento.
- **Acceso al botón de eliminar**:
  - El ícono de papelera (eliminar) solo aparece en la tarjeta del evento si tienes permisos para eliminarlo.
  - Si no tienes permisos, el botón no será visible.

### Cómo Eliminar un Evento

#### Paso 1: Localiza el Evento
- En la lista de eventos, encuentra el evento que deseas eliminar.
- Verifica que el ícono de papelera esté visible en la tarjeta del evento.

#### Paso 2: Toca el Botón de Eliminar
- Toca el ícono de papelera en la tarjeta del evento.
- Se abrirá un diálogo de confirmación.

#### Paso 3: Confirma la Eliminación
- Se mostrará un diálogo modal con:
  - **Título**: "¿Eliminar evento?"
  - **Mensaje**: "¿Estás seguro de que deseas eliminar [Nombre del evento]?"
  - **Dos botones**:
    - "Cancelar" (lado izquierdo): Descarta la eliminación y cierra el diálogo.
    - "Eliminar" (lado derecho, en rojo): Confirma la eliminación irreversible.

#### Paso 4: Evento Eliminado
- Si confirmas, el evento se elimina del servidor.
- La lista de eventos se actualiza automáticamente.
- Aparece un mensaje de confirmación: "[Nombre del evento] eliminado".
- El evento desaparece de todas las vistas (Día, Mes, Asignados).

### Operaciones Importantes

#### Reversibilidad
- **La eliminación es irreversible**: Una vez eliminado, el evento no puede recuperarse.
- No existe una papelera o historial de eliminación.
- Si eliminas un evento por error, deberás crear uno nuevo manualmente.

#### Sincronización
- La eliminación se realiza en el servidor, no localmente.
- Si pierdes conexión a internet justo después de confirmar la eliminación, el evento puede eliminarse del servidor pero no reflejarse en tu app hasta reconectar.
- Cuando reconectes, la app sincronizará y mostrará el estado correcto.

#### Impacto en Otros Usuarios
- Si el evento tiene múltiples asignados, la eliminación afecta a todos ellos.
- Otros usuarios verán que el evento desaparece cuando sus apps se sincronicen o refresquen.
- No se envía notificación especial a otros usuarios cuando se elimina un evento (aunque esto depende de la configuración del servidor).

### Permisos Detallados

#### Administrador (Admin)
- Puede eliminar cualquier evento de cualquier calendario.
- El ícono de eliminar siempre estará visible para eventos en calendarios donde es admin.

#### Calendar Manager
- Solo puede eliminar eventos de calendarios donde es designado como manager.
- El ícono de eliminar solo aparecerá en eventos de calendarios que maneja.
- No puede ver el botón de eliminar en eventos de calendarios donde no es manager.

#### Usuario Normal
- No tiene permiso para eliminar eventos.
- El ícono de papelera nunca será visible.
- Aunque intente eliminar directamente, el servidor rechazará la solicitud.

### Solución de Problemas

- **No veo el botón de eliminar**: No tienes permisos suficientes para eliminar este evento. Contacta a un administrador o calendar manager.
- **Accidentally eliminé un evento**: Desafortunadamente, la eliminación es irreversible. Tendrás que crear el evento nuevamente.
- **El evento aún aparece después de eliminar**: Intenta refrescar la pantalla deslizando hacia abajo. Si persiste, verifica tu conexión a internet.
- **Aparece un error al eliminar**: Puede deberse a problemas de conexión o permisos perdidos. Intenta nuevamente después de verificar tu conexión.

### Notas Importantes
- La eliminación se confirma mediante un diálogo específico para evitar eliminaciones accidentales.
- Los cambios de eliminación se propagan a través de notificaciones push a otros usuarios con la app abierta.
- Los eventos eliminados se limpian del historial de la app cuando se sincroniza.

## 8. Notificaciones y Actualizaciones

La app utiliza notificaciones push para mantener a los usuarios informados sobre cambios en calendarios y eventos en tiempo real. Las actualizaciones pueden ocurrir automáticamente o manualmente según el contexto.

### Notificaciones Push

#### Cómo Funcionan las Notificaciones
- Al iniciar sesión, la app se registra automáticamente en el servidor de notificaciones con un token FCM (Firebase Cloud Messaging).
- El servidor envía notificaciones cuando:
  - Se crea un evento y eres asignado.
  - Se edita un evento y eres asignado.
  - Se elimina un evento del que eras asignado.
  - Cambios significativos ocurren en calendarios a los que tienes acceso.

#### Recepción de Notificaciones
- Las notificaciones aparecen en el centro de notificaciones de tu dispositivo.
- Si la app está abierta, se puede actualizar automáticamente sin mostrar una alerta visible.
- Si la app está cerrada, verás una notificación estándar del dispositivo que puedes tocar para abrir la app.

#### Contenido de las Notificaciones
- **Título**: Nombre del evento o tipo de cambio (ej: "Nuevo evento", "Evento actualizado").
- **Descripción**: Detalles adicionales (ej: nombre del evento, quién lo creó).
- **Acción**: Al tocar, la app se abre y navega al evento o la fecha correspondiente.

#### Permisos Necesarios
- **Android**: Requiere permiso "Notificaciones". Se solicita al instalar o al iniciar sesión por primera vez.
- **iOS**: Requiere permiso para notificaciones. Se solicita automáticamente al iniciar sesión.
- Si niegas el permiso, no recibirás notificaciones.

### Actualización Automática de Datos

#### Actualización por Notificaciones
- Cuando la app recibe una notificación sobre un evento:
  - Si la app está abierta, se actualiza automáticamente en segundo plano.
  - La lista de eventos se recarga sin cerrar ni cambiar tu vista actual.
  - Los datos se sincronizan sin interrupción visible.

#### Actualización Manual
- **Deslizar hacia abajo**: En cualquier momento, desliza hacia abajo en la lista de eventos para refrescar manualmente.
- **Cambiar de mes/fecha**: Al navegar a un nuevo mes o fecha, la app carga automáticamente los eventos de ese período.
- **Cambiar modo de vista**: Al cambiar entre Día, Mes o Asignados, se recargan los datos según el modo seleccionado.

#### Actualización al Abrir la App
- La app carga automáticamente los datos más recientes al iniciarse.
- Si tienes una sesión válida, se obtienen los calendarios y eventos actuales.
- Si la sesión ha expirado, intenta renovarla automáticamente.

#### Caché Local
- La app almacena eventos en caché localmente para rendimiento.
- Si pierdes conexión a internet, los eventos recientemente mostrados seguirán siendo visibles.
- Las actualizaciones de datos no se reflejarán hasta que recuperes la conexión.

### Manejo de Conflictos de Eventos

#### ¿Qué es un Conflicto de Eventos?
- Un conflicto ocurre cuando dos eventos se superponen en el tiempo y el mismo usuario está asignado a ambos.
- Ejemplo: Un usuario está asignado a una reunión de 10:00-11:00 y otra de 10:30-11:30.

#### Detección Automática de Conflictos
- La app detecta automáticamente conflictos cuando:
  - Creas un evento con asignados.
  - Editas un evento y cambias fecha/hora o asignados.
  - Añades nuevos asignados a un evento existente.
- La detección se realiza consultando el servidor sobre la disponibilidad de los asignados.

#### Indicación de Conflictos en el Formulario
- Cuando detecta conflictos, aparece una advertencia en naranja en el formulario de creación/edición.
- El mensaje especifica:
  - Quién tiene el conflicto (nombre del usuario).
  - Con qué eventos (nombre de los eventos conflictivos).
- Ejemplo: "Juan Pérez has a conflict with: Reuniones de Equipo"

#### Comportamiento ante Conflictos
- Los conflictos son **advertencias, no bloqueos**.
- Puedes guardar el evento aunque haya conflictos detectados.
- Es responsabilidad del usuario o manager resolver los conflictos.
- No hay validación de servidor que rechace eventos con conflictos.

#### Indicación en Tarjetas de Eventos
- En la lista de eventos, los eventos con conflictos pueden mostrar un ícono de alerta.
- Esto indica que hay solapamientos horarios con otros eventos del mismo usuario.
- Los conflictos se muestran en todos los modos de vista (Día, Mes, Asignados).

#### Visualización de Conflictos
- Los conflictos detectados son locales (en tu dispositivo).
- Otros usuarios pueden tener conflictos diferentes según sus asignaciones.
- La app no ofrece una vista centralizada de todos los conflictos, pero muestra advertencias en el contexto relevante.

### Sincronización de Múltiples Dispositivos
- Si inicias sesión en múltiples dispositivos con la misma cuenta:
  - Cada dispositivo recibe notificaciones independientemente.
  - Los cambios hechos en un dispositivo se reflejan en otros al refrescar.
  - Los calendarios seleccionados se guardan localmente por dispositivo.

### Notas Importantes
- Las notificaciones requieren conexión a internet.
- Si desactivas las notificaciones a nivel de sistema, la app no podrá enviar alertas.
- Las actualizaciones automáticas dependen de tener conexión estable.
- Los conflictos son informativos; cabe al manager resolver la asignación.

## 9. Cerrar Sesión y Seguridad

Cerrar sesión es importante para proteger tu cuenta y asegurar que tu información no sea accesible desde dispositivos compartidos. El proceso es simple pero irreversible.

### Cómo Cerrar Sesión

#### Método 1: Desde el Menú de Perfil (Recomendado)
1. En la pantalla principal, toca tu avatar (círculo con tu inicial o foto) en la esquina superior derecha.
2. Se abrirá un menú emergente que muestra:
   - Tu nombre de usuario.
   - Tu correo electrónico (si está disponible).
   - Opción "Cerrar Sesión".
3. Toca "Cerrar Sesión".
4. Confirma la acción si se solicita (algunas versiones pueden requerir confirmación).
5. Se cierra la sesión automáticamente y vuelves a la pantalla de login.

#### Método 2: Automático
- La app cierra sesión automáticamente si:
  - Tu sesión expira después de un período de inactividad.
  - Tu cuenta es eliminada desde el servidor.
  - Un administrador revoca tus permisos.

### Limpieza de Datos Locales

#### Qué se Elimina al Cerrar Sesión
- **Token de acceso**: Se elimina de forma segura.
- **Token de refresco**: Se elimina de forma segura.
- **Datos de usuario**: Nombre, email, avatar se eliminan.
- **Roles y permisos**: Se eliminan localmente.
- **Selección de calendarios**: Se restablece a valores predeterminados.
- **Preferencias de vista**: Se restablecen a vista "Día".
- **Caché de eventos**: Se limpia de la memoria.

#### Qué NO se Elimina
- **Datos del servidor**: Los eventos, calendarios y tu información siguen almacenados en el servidor.
- **Historial del dispositivo**: El sistema operativo puede mantener registros de acceso.

#### Limpieza Manual Adicional
- Si deseas limpiar más datos (caché de la app, datos residuales):
  - **Android**: Ve a Configuración > Aplicaciones > Calendario LSA > Almacenamiento > Limpiar caché.
  - **iOS**: Desinstala y reinstala la app (la desinstalación no elimina datos de servidor).

### Seguridad de la Información

#### Almacenamiento Seguro
- **Tokens de acceso**: Se almacenan en el almacenamiento seguro nativo del dispositivo (Keychain en iOS, Keystore en Android).
- **Información del usuario**: Se almacena en preferencias locales encriptadas.
- **Datos de sesión**: Se protegen mediante conexiones HTTPS.

#### Transmisión de Datos
- Todas las comunicaciones entre la app y el servidor utilizan **HTTPS** (conexión encriptada).
- Los tokens se transmiten de forma segura en encabezados de autorización.
- Las contraseñas nunca se almacenan localmente; solo se usan durante el login inicial.

#### Protección contra Acceso No Autorizado
- Si pierdes tu dispositivo, tu sesión en la app se puede terminar remotamente desde el servidor.
- Cambiar tu contraseña en la web invalidará tus sesiones en todos los dispositivos.
- Si inicias sesión desde una nueva ubicación, el servidor puede requerir verificación adicional (depende de la política del servidor).

#### Mejor Práctica de Seguridad
- Siempre cierra sesión en dispositivos compartidos.
- No compartas tu contraseña con nadie.
- Usa contraseñas fuertes y únicas para tu cuenta.
- Si sospechas actividad no autorizada, cambia tu contraseña inmediatamente.
- Mantén tu dispositivo actualizado con las últimas versiones de seguridad.

### Reactivación de Sesión
- Para volver a usar la app después de cerrar sesión:
  1. Abre la app.
  2. Inicia sesión nuevamente con tus credenciales (usuario/contraseña, Google o Apple).
  3. Tu sesión será renovada y accederás a todos tus calendarios y eventos.

### Notas Importantes
- Cerrar sesión es irreversible hasta que inicies sesión nuevamente.
- No hay opción de "suspender" sesión; solo cerrar completamente.
- Los datos del servidor nunca se eliminan por cerrar sesión localmente.

## 10. Solución de Problemas

Esta sección cubre errores comunes, soluciones rápidas y cuándo contactar con soporte.

### Errores Comunes de Conexión

#### "Error de conexión. Verifica tu conexión a internet"
- **Causa**: La app no puede alcanzar el servidor.
- **Soluciones**:
  1. Verifica que tengas conexión WiFi o datos móviles activos.
  2. Intenta desactivar y reactivar el WiFi o modo de datos.
  3. Abre un navegador y visita cualquier sitio web para confirmar conexión.
  4. Intenta nuevamente en la app después de 30 segundos.
  5. Si persiste, el servidor podría estar en mantenimiento. Espera unos minutos.

#### "Timeout - La solicitud tardó demasiado"
- **Causa**: La conexión es lenta o el servidor tardó en responder.
- **Soluciones**:
  1. Verifica tu velocidad de conexión (intenta cargar un sitio web).
  2. Intenta en una ubicación con mejor señal.
  3. Cierra otras apps que usen muchos datos.
  4. Espera unos minutos y reintenta.

#### "No hay eventos" o lista vacía
- **Causa**: Puede deberse a calendarios no seleccionados o falta de datos.
- **Soluciones**:
  1. Abre el drawer y verifica que tengas calendarios seleccionados.
  2. Si no hay calendarios, verifica tu acceso con un administrador.
  3. Intenta cambiar de mes para ver si hay eventos en otros meses.
  4. Refresca la pantalla deslizando hacia abajo.

### Errores de Autenticación y Permisos

#### "Usuario o contraseña incorrectos"
- **Causa**: Las credenciales ingresadas no coinciden.
- **Soluciones**:
  1. Verifica que escribiste correctamente tu usuario (sin espacios).
  2. Verifica que escribiste correctamente tu contraseña (distingue mayúsculas/minúsculas).
  3. Usa el botón del ojo para confirmar la contraseña antes de enviar.
  4. Si olvidaste la contraseña, usa la opción de recuperación en la página del servidor (no disponible en app).

#### "No tienes permisos para acceder"
- **Causa**: Tu cuenta no tiene acceso a la aplicación.
- **Soluciones**:
  1. Contacta a un administrador de la organización.
  2. Verifica que tu cuenta esté activa en el sistema.
  3. Intenta cerrar sesión e iniciar nuevamente.

#### "No puedo crear/editar/eliminar eventos"
- **Causa**: No tienes rol de manager o admin en los calendarios.
- **Soluciones**:
  1. Verifica el rol de tu cuenta con un administrador.
  2. Solicita ser agregado como manager a un calendario específico.
  3. Solo admins y managers pueden crear eventos.

### Problemas de Carga de Datos

#### "Los eventos no se actualizan"
- **Causa**: La app no está sincronizando con el servidor.
- **Soluciones**:
  1. Verifica conexión a internet.
  2. Refresca manualmente deslizando hacia abajo.
  3. Intenta cambiar de mes y volver al mes actual.
  4. Cierra la app completamente y abre nuevamente.

#### "Los cambios que hice no aparecen"
- **Causa**: Hay un problema de sincronización.
- **Soluciones**:
  1. Espera unos segundos y refresca la pantalla.
  2. Verifica que la solicitud se envió (busca mensaje de confirmación).
  3. Cierra y abre la app nuevamente.
  4. Si persiste, contacta con soporte.

#### "Los asignados no se guardan correctamente"
- **Causa**: Problema al seleccionar o enviar asignados.
- **Soluciones**:
  1. Verifica que el calendario permitiese los usuarios que seleccionaste.
  2. Intenta seleccionar nuevamente los asignados.
  3. Guarda primero sin asignados, luego edita para añadirlos.

### Problemas de Funcionamiento General

#### "La app se congela o es lenta"
- **Causa**: Problemas de rendimiento en el dispositivo.
- **Soluciones**:
  1. Cierra otras apps que estén corriendo.
  2. Reinicia tu dispositivo.
  3. Libera espacio en el almacenamiento del dispositivo.
  4. Actualiza la app a la última versión.
  5. Limpia el caché de la app (ver sección Limpieza de Datos).

#### "Los botones no responden"
- **Causa**: La app podría estar en estado inconsistente.
- **Soluciones**:
  1. Espera unos segundos (podría estar procesando).
  2. Toca nuevamente el botón.
  3. Cierra y abre la app nuevamente.

#### "El formulario de evento no se abre"
- **Causa**: Falta de permisos o error de carga.
- **Soluciones**:
  1. Verifica que tengas rol de manager o admin.
  2. Intenta seleccionar un calendario diferente.
  3. Cierra la app y abre nuevamente.
  4. Verifica que los calendarios estén cargando correctamente.

### Problemas con Notificaciones

#### "No recibo notificaciones"
- **Causa**: Notificaciones desactivadas o no registradas.
- **Soluciones**:
  1. Verifica que hayas permitido notificaciones en la instalación.
  2. Ve a Configuración > Notificaciones > Calendario LSA y activa.
  3. **Android**: Configuración > Aplicaciones > Calendario LSA > Notificaciones > Activar.
  4. **iOS**: Configuración > Notificaciones > Calendario LSA > Permitir notificaciones.
  5. Cierra la app y abre nuevamente para re-registrarse.

#### "Recibo notificaciones de eventos antiguos"
- **Causa**: Sincronización retrasada o eventos no actualizados.
- **Soluciones**:
  1. Es normal recibir notificaciones retrasadas en conexiones lentas.
  2. Refresca la pantalla para sincronizar.
  3. Si continúa, contacta con soporte.

### Reinicio de la App

#### Cuándo Reiniciar
- Después de varios errores consecutivos.
- Si la app se congela o no responde.
- Si los cambios no se reflejan después de refrescar.

#### Cómo Reiniciar
1. **Cierre forzoso**:
   - **Android**: Mantén presionado el botón de inicio > Aplicaciones recientes > Desliza la app hacia arriba.
   - **iOS**: Desliza desde la parte inferior (o arriba en iPhone X+) > Encuentra la app > Desliza hacia arriba.
2. **Espera unos segundos**.
3. **Abre la app nuevamente** tocando el ícono en la pantalla de inicio.

#### Reinicio del Dispositivo
- Si los reinicos de app no resuelven el problema:
  1. Apaga completamente tu dispositivo.
  2. Espera 10 segundos.
  3. Enciende nuevamente.
  4. Abre la app.

## 11. Configuraciones Avanzadas

Esta sección cubre opciones de configuración disponibles dentro de la app para personalizar tu experiencia.

### Idioma de la App

#### Cambio de Idioma
- **Idiomas disponibles**: Español (es) e Inglés (en).
- **Cómo cambiar**:
  1. La app detecta automáticamente el idioma de tu dispositivo.
  2. Si tu dispositivo está en español, la app mostrará todo en español.
  3. Si está en inglés, mostrará todo en inglés.
  4. **No hay opción dentro de la app para cambiar idioma manualmente**.
- **Para cambiar**:
  1. Ve a Configuración de tu dispositivo > Idioma y región.
  2. Selecciona español (es) o inglés (en).
  3. Cierra la app completamente y abre nuevamente.
  4. La app se mostrará en el nuevo idioma.

#### Elementos Afectados por Idioma
- Títulos y etiquetas de campos.
- Mensajes de error y confirmación.
- Nombres de botones (Guardar, Cancelar, Eliminar, etc.).
- Tooltips y ayuda in-app.
- Formatos de fecha (se ajustan según locale del SO).

#### Notas de Idioma
- Algunos nombres de eventos, calendarios y usuarios pueden estar en otros idiomas (depende de quién los creó).
- Los nombres de eventos no se traducen automáticamente; son datos del usuario.

### Versión de la App

#### Ver la Versión Actual
- **En la pantalla de login**: En la parte inferior, muestra "v" seguido del número de versión (ej: v1.0.0).
- **En el drawer**: En la parte inferior del drawer lateral, también aparece la versión (ej: v1.0.0).


#### Actualizaciones
- **Actualizaciones automáticas**:
  - **Android**: Se actualizan automáticamente a través de Google Play (si está configurado).
  - **iOS**: Se actualizan automáticamente a través de App Store (si está configurado).
- **Actualizaciones manuales**:
  - Abre Google Play (Android) o App Store (iOS).
  - Busca "Calendario LSA" o "Calendario la Senda".
  - Toca "Actualizar" si está disponible.
- **Verificar disponibilidad de actualización**:
  - Abre la tienda de apps (Google Play o App Store).
  - Busca la app.
  - Si dice "Actualizar" hay una nueva versión disponible.

#### Importancia de Actualizar
- Las nuevas versiones incluyen correcciones de seguridad.
- Mejoramientos de rendimiento y nuevas características.
- Compatibilidad con nuevas versiones de Android/iOS.
- Se recomienda actualizar tan pronto como sea posible.

### Información del Usuario

#### Perfil de Usuario
- **Acceso**: Toca tu avatar en la esquina superior derecha de la pantalla principal.
- **Información mostrada**:
  - Nombre de usuario.
  - Correo electrónico registrado.
  - Opción de cerrar sesión.

#### Datos de Perfil
- **Tu nombre**: Se asigna al iniciar sesión (usuario, Google o Apple).
- **Tu email**: Se registra según el método de autenticación.
- **Tu avatar**: Se obtiene de Google (si usaste Google login) o es una inicial.
- **Tu rol**: Administrador, Calendar Manager, Usuario Normal (no se muestra en la app, pero afecta permisos).