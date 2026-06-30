# La Senda Antigua - Portal

Repositorio centralizado para los proyectos de **La Senda Antigua**: App Móvil, Panel Administrativo y Sitio Web.

## 📚 Documentación

- **[📱 Guía de la App Móvil](docs/APP_USER_GUIDE.md)** - Manual completo para usuarios de la aplicación de calendario
- **[⚙️ Guía del Panel Administrativo](docs/ADMIN_PANEL_USER_GUIDE.md)** - Instrucciones para gestionar contenido y configuración
- **[🌐 Guía del Sitio Web](docs/WEBSITE_USER_GUIDE.md)** - Documentación de administración del sitio web

---

## 📦 Proyectos

### 📱 App Móvil (`lsa_calendar_app/`)
Aplicación Flutter para gestión de calendarios y eventos de la organización.

**Publicación:** Manual
- Requiere compilación y publicación en Google Play Store y App Store
- Ver [APP_USER_GUIDE.md](docs/APP_USER_GUIDE.md) para más detalles

### ⚙️ Panel Administrativo (`admin-panel/`)
Aplicación Angular para la gestión de contenido y configuración del portal.

**Publicación:** Automática
- Cualquier PR aprobado a `development` se deploya automáticamente
- Los cambios se reflejan en el ambiente de staging

### 🌐 Sitio Web (`lsa-website/`)
Sitio web público de La Senda Antigua, construido con Angular.

**Publicación:** Automática
- Cualquier PR aprobado a `development` se deploya automáticamente
- Los cambios se reflejan en el ambiente de staging

### 🔧 API Backend (`lsa-web-apis/`)
API REST en .NET Core que gestiona toda la lógica backend del sistema.

---

## 🔄 Git Flow

### Ramas principales
- `main` - Producción
- `development` - Staging y desarrollo

### Flujo de trabajo
1. Crea una rama basada en `development` (o la rama de feature asignada)
2. Realiza tus cambios y haz push a tu rama
3. Crea un PR hacia `development` (o la rama de feature asignada)
4. Solicita revisión a los miembros del equipo
5. Una vez aprobado, el merge automáticamente genera el deployment

### ⚠️ Importante
- No hagas merge desde ramas externas a tu rama de trabajo sin revisar los cambios
- Siempre verifica que tus cambios sean compatibles antes de hacer merge
    
