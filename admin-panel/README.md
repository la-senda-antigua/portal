# 📖 Manual de Usuario - Admin Panel (La Senda Antigua)

Este manual es una guía práctica para el uso del panel administrativo. Está estructurado de acuerdo a las secciones principales del sistema.

---

## 1. 📡 broadcast
*   Gestión y monitoreo de las transmisiones en vivo.
*   Configuración de señales y estados de emisión.

## 2. 🎬 media
Esta sección centraliza el contenido multimedia del portal y se divide en:
*   **preachers:** Registro y gestión de los oradores o expositores.
*   **sermons:** Administración de videos de las prédicas y sus datos.
*   **playlists:** Gestión de listas de reproducción personalizadas.
*   **courses:** Gestión de videos de enseñanzas y lecciones de la academia.
*   **gallery:** Videos de eventos y contenido especial.

## 3. 🗓️ calendars
*   Gestión de la agenda institucional.
*   Visualización y programación de eventos en **vista mensual**.
*   Interfaz interactiva para organizar fechas importantes de la congregación.

## 4. 👥 users
*   Administración de cuentas con acceso al panel.
*   Control de roles y permisos del equipo administrativo.
*   Acceso gestionado vía Google Auth.

---

## 📘 Guía Detallada: broadcast

Esta sección controla la señal en vivo del sitio web principal. Permite proyectar un video en directo o mostrar un mensaje informativo a los visitantes.

### 📡 Cómo iniciar la transmisión
1. Dentro de la sección **broadcast**, se localiza el área de entrada de datos.
2. Se ingresa el código **embed** de Rumble o, en su defecto, un mensaje de texto que se desee mostrar en el sitio web.
3. Se presiona el botón **Go Live**.

<image alt="pantalla_broadcast_inicial">

### ⏱️ Gestión del tiempo en vivo
Una vez que la transmisión está activa, el sistema presenta las siguientes características:

*   **Contador regresivo:** Se inicia automáticamente un cronómetro de **2:30 horas**. Al agotarse el tiempo, la transmisión finaliza en el sitio web.
*   **Extensión de tiempo:** Aparece un botón para agregar **30 minutos extra**. Este botón puede presionarse tantas veces como sea necesario para prolongar la duración del vivo.

<image alt="pantalla_broadcast_en_vivo">

### 🛑 Cómo finalizar o cambiar el estado
*   Para detener la señal antes de que el contador llegue a cero, se utiliza el botón de finalizar (si está disponible en la interfaz) o se limpia el contenido.
*   Si se desea cambiar el video o el mensaje mientras se está en vivo, se actualiza el campo de texto y se guardan los cambios.

---

## 📘 Guía Detallada: media > playlists

Esta sección permite crear y administrar las listas de reproducción que agrupan el contenido de video en el sitio web.

### ➕ Cómo agregar una nueva playlist
1. Dentro de la sección **media**, se encuentra la opción **playlists**.
2. Se utiliza el botón con el signo más (**+**) para abrir el formulario de creación.
3. Se completan los datos requeridos:
   * **Título:** Nombre de la lista de reproducción (ej. "Serie de Santidad").
   * **Imagen:** URL de la imagen de portada para la lista.
4. Se presiona el botón de guardar.

<image alt="pantalla_crear_playlist">

### 📝 Cómo modificar una playlist
1. Se localiza la lista en el listado principal.
2. Se selecciona el botón de **Editar** (icono de lápiz).
3. Se actualizan los datos y se guardan los cambios.

<image alt="pantalla_editar_playlist">

### 🗑️ Cómo eliminar una playlist
1. Se presiona el icono de **Eliminar** (bote de basura) en la fila correspondiente.
2. Se confirma la acción en la ventana emergente.

---

## 📘 Guía Detallada: media > preachers

Esta sección permite administrar a los predicadores que aparecerán vinculados a los sermones y cursos.

### ➕ Cómo agregar un nuevo predicador
1. Dentro de la sección **media**, se encuentra la opción **preachers**.
2. Se utiliza el botón con el signo más (**+**) para iniciar el registro.
3. En la pantalla emergente, se completan los campos requeridos:
   * **Nombre:** El nombre del expositor.
   * **Imagen:** URL de la fotografía.
4. El proceso finaliza haciendo clic en el botón de guardar.

<image alt="pantalla_crear_predicador">

### 📝 Cómo modificar un predicador
1. Dentro del listado principal, se localiza al predicador.
2. Se selecciona el botón de **Editar** (icono de lápiz).
3. Se realizan los cambios en el nombre o la URL de la imagen y se guardan.

<image alt="pantalla_editar_predicador">

### 🗑️ Cómo eliminar un predicador
1. En el listado, se presiona el icono de **Eliminar** (bote de basura).
2. Se confirma la acción en la ventana emergente.

<image alt="pantalla_eliminar_predicador">


> **Regla de integridad:** No es posible eliminar a un predicador que tenga **sermones** o **lecciones de cursos** asociados. Si intentas borrarlo y el sistema lo impide, deberás primero eliminar o reasignar todo su contenido vinculado.

---

## 📘 Guía Detallada: media > (sermons, courses y gallery)

Estas secciones se utilizan para gestionar el contenido en video del portal (prédicas, enseñanzas de la academia y videos de eventos). El procedimiento de administración es el mismo para las tres.

### ➕ Cómo agregar un nuevo video
1. Dentro de la sección **media**, se encuentra la opción correspondiente (**sermons**, **courses** o **gallery**).
2. Se hace clic en el botón con el signo más (**+**).
3. En el formulario, se ingresa la siguiente información:
   * **Título:** El nombre del video o tema central.
   * **Predicador:** Selección del orador (Visible solo en **sermons** y **courses**).
   * **Playlist:** Selección de la lista a la que pertenece el video (Obligatorio en **courses** para su visualización en la web).
   * **Fecha:** Fecha en la que se impartió el mensaje.
   * **Video:** Código **embed** del video (procedente de Rumble).
4. Se presiona el botón de guardar.

<image alt="pantalla_crear_video">

### 📝 Cómo modificar un registro
1. Se localiza el elemento en la lista principal.
2. Se utiliza el botón de **Editar** (icono de lápiz).
3. Se realizan los ajustes en los datos o el código del video y se guardan los cambios.

<image alt="pantalla_editar_video">

### 🗑️ Cómo eliminar un registro
1. Se presiona el icono de **Eliminar** (bote de basura) en la fila correspondiente.
2. Se confirma la acción en el mensaje de seguridad.

<image alt="pantalla_eliminar_video">

---

## 📘 Guía Detallada: calendars

Esta sección permite gestionar la agenda institucional mediante la organización de grupos y eventos específicos.

### 📂 Gestión de Grupos (Calendarios)
Los calendarios se manejan como "grupos" (por ejemplo: Músicos, Líderes, etc.) y se administran desde la **barra lateral izquierda**.

1. **Creación/Edición de Grupos:** Se utiliza la barra lateral para añadir nuevos grupos o modificar los existentes. Los campos principales son:
   * **Nombre:** Etiqueta del grupo.
   * **Color:** Identificador visual para los eventos en la cuadrícula.
   * **Privacidad y Permisos:** Configuración de visibilidad (público/oculto) y asignación de **Managers** (quienes pueden editar) y **Members** (quienes solo pueden visualizar).
2. **Visibilidad:** Es posible activar o desactivar la visualización de cada grupo haciendo clic en el selector junto a su nombre en la barra lateral.

<image alt="pantalla_sidebar_calendarios">

### 🗓️ Gestión de Eventos
El sistema utiliza exclusivamente una **vista mensual**. 

1. **Creación de un evento:** 
   * Se puede utilizar el botón **Agregar evento**.
   * También es posible hacer clic directamente sobre un día específico en el calendario.
2. **Formulario de evento:** Se deben completar los siguientes datos:
   * **Título:** Nombre de la actividad.
   * **Grupo:** Selección obligatoria del calendario al que pertenece.
   * **Horario:** Definición de hora de inicio y fin (o marcar como "Todo el día").
   * **Descripción:** Detalles adicionales del evento.
   * **Assignees:** Selección de personas asignadas a dicha actividad.
3. **Edición rápida:** Los eventos se pueden arrastrar y soltar dentro de la cuadrícula mensual para cambiar su fecha rápidamente.

<image alt="pantalla_formulario_evento">

### ⚠️ Conflictos y Permisos
*   **Detección de Conflictos:** El sistema identifica eventos duplicados que coincidan en grupo, título y horario para evitar la saturación visual de la agenda.
*   **Roles de Edición:** Solo los administradores o los usuarios asignados como **Managers** de un grupo específico tienen permisos para crear, editar o mover eventos en ese calendario.
*   **Función de Copia:** Al guardar un evento, existe la opción de abrir inmediatamente un nuevo formulario con los mismos datos para facilitar el registro de actividades repetitivas.

---

## 📘 Guía Detallada: users

Esta sección permite la gestión de los administradores del panel y la organización de equipos de trabajo mediante grupos.

### 🔐 Acceso y Autenticación
El acceso al sistema está centralizado exclusivamente a través de **Google Auth**. 
* **Sin contraseñas:** No se crean ni gestionan contraseñas locales; el usuario utiliza su cuenta de Google.
* **Registro previo:** Para que un usuario pueda entrar, debe ser dado de alta en esta sección utilizando su dirección de correo electrónico de Google como su **User ID**.

### 👤 Gestión de Usuarios
En el listado principal se visualiza la información de los usuarios registrados, incluyendo sus nombres, roles, calendarios asignados y los grupos a los que pertenecen.

#### **Agregar o editar un usuario**
1. Dentro de la sección **users**, se utiliza el botón **Add User** (o el icono con el signo `+`).
2. En el formulario se deben completar los siguientes campos:
   * **User ID:** Debe coincidir exactamente con el correo de Google del usuario.
   * **Nombre y Apellido:** Datos de identificación.
   * **Roles:** Selección de los niveles de permiso dentro del panel.
   * **Calendars:** Asignación de calendarios específicos, definiendo si el usuario es **Manager** (con capacidad de edición) o **Member** (solo visualización).
   * **Groups:** Vinculación a grupos de trabajo existentes.
3. Se presiona el botón de guardar para confirmar.

<image alt="pantalla_formulario_usuario">

#### **Eliminar un usuario**
Como medida de seguridad para evitar eliminaciones accidentales:
1. Se presiona el icono de **Eliminar** (bote de basura) en la fila del usuario.
2. En la ventana de confirmación, se requiere **escribir manualmente el User ID** (correo) del usuario para habilitar el botón de borrado definitivo.

<image alt="pantalla_eliminar_usuario">

### 👥 Gestión de Grupos de Usuarios
Los grupos sirven para organizar al personal y facilitar la asignación de recursos o la visualización de equipos.

#### **Crear y editar grupos**
1. Se utiliza la opción **Add Group** para iniciar un nuevo equipo.
2. Para modificar uno existente, se selecciona el botón de edición sobre el grupo en la interfaz.
3. El sistema permite gestionar:
   * **Nombre del grupo:** Identificador descriptivo del equipo.
   * **Miembros:** Selección múltiple de los usuarios que integrarán el grupo.
4. Desde este formulario también es posible eliminar el grupo si ya no es necesario.

<image alt="pantalla_gestion_grupos">

---
*Nota: Este panel está optimizado para la gestión directa de contenidos de La Senda Antigua.*
