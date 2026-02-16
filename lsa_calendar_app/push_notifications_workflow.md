## Fase 1: Configuración de Firebase
- [ ] **Crear Proyecto en Firebase Console**: Ir a console.firebase.google.com y crear un nuevo proyecto.
- [ ] **Configurar Apps**: Añadir la app de Android (y iOS si aplica) en el proyecto de Firebase para obtener los identificadores.
- [ ] **Obtener Credenciales para Frontend**:
    - [x] Descargar `google-services.json` (para Android).
    - [ ] Descargar `GoogleService-Info.plist` (para iOS).
- [ ] **Obtener Credenciales para Backend**:
    - [ ] Ir a *Project Settings* -> *Service accounts*.
    - [ ] Generar nueva clave privada (Private Key). Esto descargará un archivo `.json`.
    - [ ] Guardar este JSON de forma segura en el servidor backend (ej. en una carpeta `Keys/` o usar User Secrets).

## Fase 2: Base de Datos 
- [ ] **Crear Tabla para Registro de Dispositivos**: 
    ```sql
    CREATE TABLE `UserDevices` (
      `Id` INT NOT NULL AUTO_INCREMENT,
      `UserId` CHAR(36)NOT NULL,
      `FirebaseToken` VARCHAR(512) NOT NULL,
      `Platform` VARCHAR(50) DEFAULT NULL, /* Ej: 'Android', 'iOS' */
      `LastLogin` DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`Id`),
      UNIQUE KEY `UQ_FcmToken` (`FcmToken`),
      INDEX `IX_UserId` (`UserId`)
      CONSTRAINT `FK_UserDevices_Users` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE 
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ```
- [ ] **Actualizar Modelo en .NET**:
    - [ ] **Crear Entidad**: Crear la clase `UserDevice.cs` en tu carpeta de entidades y agregar `public virtual DbSet<UserDevice> UserDevices { get; set; }` en tu `UserDbContext`.
- [ ] **Tabla de Historial**: Crear tabla `NotificationLogs` para evitar envíos duplicados.
    ```sql
    CREATE TABLE `NotificationLogs` (
      `Id` INT NOT NULL AUTO_INCREMENT,
      `EventId` Char(36) NOT NULL,
      `UserId` CHAR(36) NOT NULL,
      `NotificationType` VARCHAR(50) NOT NULL, /* Ej: 'TwoWeeksReminder' */
      `SentAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`Id`),
      UNIQUE KEY `UQ_Event_User_Type` (`EventId`, `UserId`, `NotificationType`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ```

## Fase 3: Backend API (.NET Core) - Gestión de Dispositivos
- [ ] **Instalar SDK**: Instalar paquete NuGet `FirebaseAdmin` en el proyecto API.
- [ ] **Inicializar Firebase**: En `Program.cs` o `Startup.cs`, configurar la instancia de Firebase usando el JSON descargado en la Fase 1.
- [ ] **Endpoint de Registro (Login)**:
    - [ ] Crear/Modificar endpoint (ej. `POST /api/notifications/register-device`).
    - [ ] Recibe: `fcmToken`, `platform`.
    - [ ] Lógica: Buscar si el token ya existe. Si existe, actualizar el `UserId` y `LastLogin`. Si no, crear nuevo registro.
- [ ] **Endpoint de Eliminación (Logout)**:
    - [ ] Crear/Modificar endpoint (ej. `POST /api/notifications/unregister-device`).
    - [ ] Recibe: `fcmToken`.
    - [ ] Lógica: Eliminar el registro de la tabla `UserDevices` que coincida con ese token y el usuario actual.

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
    - [ ] Para cada `Assignee` del evento, buscar sus tokens en `UserDevices`.
    - [ ] Construir el mensaje `MulticastMessage` de Firebase con título y cuerpo.
    - [ ] Enviar usando `FirebaseMessaging.DefaultInstance.SendMulticastAsync(...)`.
    - [ ] Manejar respuesta: Si Firebase reporta que un token es inválido (el usuario desinstaló la app), eliminarlo de la BD.

## Fase 5: Frontend (Flutter)
- [x] **Instalar Dependencias**: Agregar `firebase_core` y `firebase_messaging` en `pubspec.yaml`.
- [ ] **Configuración Nativa**:
    - [x] Android: Colocar `google-services.json` en `android/app/`.
    - [x] Android: Modificar `build.gradle.kts` (Nivel App).
    - [ ] Android: Modificar `build.gradle` (Nivel Proyecto).
    - [ ] iOS: Colocar `GoogleService-Info.plist` en `ios/Runner/`. Configurar Capabilities en Xcode.
- [ ] **Lógica de Token**:
    - [ ] Crear servicio para obtener el token: `FirebaseMessaging.instance.getToken()`.
    - [ ] Llamar al endpoint del Backend `register-device` justo después del Login exitoso.
    - [ ] Llamar al endpoint del Backend `unregister-device` justo antes de hacer Logout y borrar datos locales.
- [ ] **Recepción de Mensajes**:
    - [ ] Configurar callbacks para cuando la app está en primer plano (Foreground).
    - [ ] Configurar callbacks para cuando la app está en segundo plano/cerrada (Background/Terminated).

## Resumen de Flujo de Datos
1. **Usuario Loguea** -> App obtiene Token FCM -> App envía Token a Backend -> Backend guarda en MySQL.
2. **Pasan los días...**
3. **Worker Diario** -> Detecta evento en 14 días -> Busca usuarios asignados -> Busca tokens de esos usuarios -> Manda PUSH a Firebase -> Firebase manda al celular.
4. **Usuario recibe Notificación** -> "Tu evento X comienza en 2 semanas".
5. **Usuario Logout** -> App envía Token a Backend -> Backend borra Token de MySQL -> Usuario deja de recibir notificaciones.
