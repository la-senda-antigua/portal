## Fase 1: Configuración de Firebase
- [x] **Crear Proyecto en Firebase Console**: Ir a console.firebase.google.com y crear un nuevo proyecto.
- [x] **Configurar Apps**: Añadir la app de Android (y iOS si aplica) en el proyecto de Firebase para obtener los identificadores.
- [x] **Obtener Credenciales para Frontend**:
    - [x] Descargar `google-services.json` (para Android).
    - [x] Descargar `GoogleService-Info.plist` (para iOS).
- [x] **Obtener Credenciales para Backend**:
    - [x] Ir a *Project Settings* -> *Service accounts*.
    - [x] Generar nueva clave privada (Private Key). Esto descargará un archivo `.json`.
    - [x] Guardar este JSON de forma segura en el servidor backend (ej. en una carpeta `Keys/` o usar User Secrets).

## Fase 2: Base de Datos 
- [x] **Crear Tabla para Registro de Dispositivos**: 
    ```sql        
        CREATE TABLE `UserDevices` (
            `Id` INT NOT NULL AUTO_INCREMENT,
            `Username` VARCHAR(320) NOT NULL,
            `FirebaseToken` VARCHAR(512) NOT NULL,
            `Platform` VARCHAR(50) DEFAULT NULL,
            `LastLogin` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`Id`),
            UNIQUE KEY `UQ_FirebaseToken` (`FirebaseToken`),
            KEY `IX_Username` (`Username`)
        );

        CREATE TABLE `NotificationLogs` (
            `Id` INT NOT NULL AUTO_INCREMENT,
            `EventId` CHAR(36) NOT NULL,
            `Username` VARCHAR(320) NOT NULL,
            `NotificationType` VARCHAR(50) NOT NULL,
            `SentAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`Id`),
            UNIQUE KEY `UQ_Event_Username_Type` (`EventId`, `Username`, `NotificationType`),
            KEY `IX_NotificationLogs_Username` (`Username`)
        );
    ```
- [x] **Actualizar Modelo en .NET**:
    - [x] **Crear Entidad**: Crear la clase `UserDevice.cs` en tu carpeta de entidades y agregar `public virtual DbSet<UserDevice> UserDevices { get; set; }` en tu `UserDbContext`.
- [x] **Ajuste de Modelo (Decisión de negocio actual)**:
    - [x] Guardar y consultar dispositivos por `username` (cuenta compartida), no por persona individual.
    - [x] Mantener `UNIQUE` sobre `FirebaseToken` para evitar duplicados del mismo dispositivo.
    - [x] `NotificationLogs` alineado por `username` (`UNIQUE(EventId, Username, NotificationType)`).

## Fase 3: Backend API (.NET Core) - Gestión de Dispositivos
- [x] **Instalar SDK**: Instalar paquete NuGet `FirebaseAdmin` en el proyecto API.
- [x] **Inicializar Firebase**: En `Program.cs` o `Startup.cs`, configurar la instancia de Firebase usando el JSON descargado en la Fase 1.
    - [x] Inicialización desde `FirebaseKey` en `appsettings`.
    - [x] Sin afectar login OAuth (Google/Apple siguen fuera de Firebase Auth).
- [x] **Endpoint de Registro (Login)**:
    - [x] Crear/Modificar endpoint (ej. `POST /notifications/register-device`).
    - [x] Recibe: `fcmToken`, `platform`.
    - [x] El usuario se identifica por `username` del token JWT (no enviado en body).
    - [x] Lógica: Buscar si el `fcmToken` ya existe. Si existe, actualizar `username` y `LastLogin`. Si no, crear nuevo registro.
    - [x] Regla de negocio: Un mismo `username` puede tener múltiples dispositivos (múltiples `fcmToken`).
- [x] **Endpoint de Eliminación (Logout)**:
    - [x] Crear/Modificar endpoint (ej. `POST /notifications/unregister-device`).
    - [x] Recibe: `fcmToken`.
    - [x] Lógica: Eliminar el registro de la tabla `UserDevices` que coincida con ese token y el `username` del usuario actual.
- [x] **Endpoint de Envío Manual**:
    - [x] Crear endpoint `POST /notifications/send`.
    - [x] Recibe: `title`, `body` y `username` opcional.
    - [x] Si no se envía `username`, usa el `username` del JWT.
    - [x] Envía push a todos los tokens registrados del `username` objetivo.
    - [x] Seguridad: solo `Admin` puede enviar a un `username` distinto al propio.

## Fase 4: Backend Worker (Lógica de Negocio)
- [ ] **Crear Background Service**: Implementar una clase que herede de `BackgroundService` (o usar Hangfire/Quartz si ya lo tienes).
- [ ] **Definir Cronograma**: Configurar para que corra, por ejemplo, una vez al día a las 8:00 AM.
- [ ] **Lógica de Consulta (Query)**:
    - [ ] Calcular fecha objetivo: `DateTime targetDate = DateTime.Now.AddDays(14).Date;`
    - [ ] Consultar eventos usando EF Core:
      ```csharp
      var events = dbContext.Events
          .Include(e => e.Assignees)
          .Where(e => e.StartDate.Date == targetDate)
          .ToList();
      ```
- [ ] **Lógica de Envío**:
    - [ ] Iterar sobre los eventos encontrados.
    - [ ] Para cada evento, obtener los `username` involucrados y deduplicarlos antes de enviar (para no repetir push en cuentas compartidas).
    - [ ] Por cada `username` deduplicado, buscar todos sus tokens en `UserDevices`.
    - [ ] Construir el mensaje `MulticastMessage` de Firebase con título y cuerpo.
    - [ ] Enviar usando `FirebaseMessaging.DefaultInstance.SendMulticastAsync(...)`.
    - [ ] Manejar respuesta: Si Firebase reporta que un token es inválido (el usuario desinstaló la app), eliminarlo de la BD.

## Fase 5: Frontend (Flutter)
- [x] **Instalar Dependencias**: Agregar `firebase_core` y `firebase_messaging` en `pubspec.yaml`.
- [x] **Configuración Nativa**:
    - [x] Android: Colocar `google-services.json` en `android/app/`.
    - [x] Android: Modificar `build.gradle.kts` (Nivel App).
    - [x] Android: Agregar permiso `POST_NOTIFICATIONS` en `AndroidManifest.xml`.
    - [x] iOS: Colocar `GoogleService-Info.plist` en `ios/Runner/`.
    - [x] iOS: Configurar Push Notification Capability en Xcode y Apple Developer Portal.
    - [x] iOS: Generar y subir certificado APNs (.p12) a Firebase Console (Dev & Prod).
- [x] **Lógica de Token**:
    - [x] Crear servicio para obtener el token: `FirebaseMessaging.instance.getToken()` en `firebase_service.dart`.
    - [x] Llamar al endpoint del Backend `register-device` justo después del Login exitoso.
    - [x] Llamar al endpoint del Backend `unregister-device` justo antes de hacer Logout y borrar datos locales.
    - [x] Soportar múltiples dispositivos por usuario: cada instalación/sesión activa registra su propio `fcmToken` (incluye `onTokenRefresh`).
- [ ] **Recepción de Mensajes**:
    - [x] Configurar callbacks para cuando la app está en primer plano (Foreground).
    - [x] Configurar callbacks para cuando la app está en segundo plano/cerrada (Background/Terminated).

## Resumen de Flujo de Datos
1. **Usuario Loguea** -> App obtiene Token FCM -> App envía Token a Backend -> Backend guarda token asociado al `username`.
2. **Pasan los días...**
3. **Worker Diario** -> Detecta evento en 14 días -> Busca usuarios asignados -> Resuelve el `username` de cada asignado -> Busca todos los tokens de ese `username` -> Manda PUSH a Firebase -> Firebase manda al celular.
4. **Usuario recibe Notificación** -> "Tu evento X comienza en 2 semanas".
5. **Usuario Logout** -> App envía Token a Backend -> Backend borra Token de MySQL -> Usuario deja de recibir notificaciones.
6. **Multi-dispositivo** -> El mismo `username` puede mantener varios `fcmToken` activos (celular personal, tablet, etc.).
7. **Cuenta compartida** -> Si Pedro, Luis y Hugo usan el mismo `username`, las notificaciones de eventos asociados a ese `username` llegan a todos sus dispositivos.

## Estado Actual (26-02-2026)
- [x] Definido modelo de negocio por `username` compartido.
- [x] Entidades y mapeo EF alineados a `username` (`UserDevice` y `NotificationLog`).
- [x] Inicialización de Firebase Admin en backend completada.
- [x] Ejecutar script en MySQL para crear tablas.
- [x] Implementar `register-device`.
- [x] Implementar `unregister-device`.
- [x] Implementar endpoint de envío manual (`/notifications/send`).
- [x] Conectar llamadas desde Flutter (post-login / pre-logout).
