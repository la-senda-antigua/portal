# ⛪ Guía de Administración - Sitio Web La Senda Antigua

Este sitio web es dinámico y se controla exclusivamente a través de un archivo de configuración centralizado. No es necesario modificar el código fuente para actualizar contenidos, gestionar menús o crear nuevas páginas.

## 📂 Archivo de Configuración
Todo el contenido vive en:
`src/assets/app.config.json`

---

## 💡 Estructura y Reglas del JSON

Para asegurar el correcto funcionamiento del sitio, se deben seguir estas normas de sintaxis:
1.  **Textos:** Deben estar siempre encerrados en comillas dobles (`" "`).
2.  **Comas:** Se debe colocar una coma al final de cada propiedad, excepto en la última de cada bloque.
3.  **Listas (`[ ]`):** Se utilizan para agrupar elementos similares (como las páginas o los párrafos de un bloque).
4.  **Objetos (`{ }`):** Se utilizan para definir las propiedades de un componente específico.
5.  **Valores Lógicos:** Se utiliza `true` para activar y `false` para desactivar funciones.

---

## 📄 Configuración de Páginas (`pages`)

Cada página es un objeto dentro de la lista `pages`. 

### Propiedades de Navegación por Página:
Se puede personalizar el menú superior según la página activa:
*   **`text-color`**: `"light"` o `"dark"`.
*   **`background-color`**: Opciones: `"none"` (transparente) o `"system"` (color sólido del tema).
*   **`use-shadow`**: `true` para proyectar una sombra bajo el menú.

---

## 🧩 Catálogo de Secciones (Componentes)

Se pueden copiar y pegar estos bloques dentro de la lista de `sections` de cualquier página.

### 1. Carrusel (`carousel`)
Se utiliza para mostrar una galería de imágenes rotativas en la cabecera.
*   **Propiedades:**
    *   **`auto-rotate-ms`**: Tiempo en milisegundos entre diapositivas (ej. `7000`).
    *   **`loop`**: Valor booleano (`true` o `false`) para reiniciar la secuencia automáticamente.

```json
{
  "carousel": {
    "auto-rotate-ms": 7000,
    "loop": true,
    "slides": [ ... ]
  }
}
```

### 2. Imagen con Texto Flotante (`background-image-with-floating-text`)
Se emplea como fondo de impacto con información superpuesta.
*   **`floating-description`**: Contiene la `position` y el bloque de texto.
*   **`button`**: Se puede incluir un enlace con `target` (`"_blank"` para nueva pestaña o `"_self"` para la misma).

```json
{
  "background-image-with-floating-text": {
    "title": "Título de la sección",
    "background-image": "assets/images/foto.jpg",
    "background-position": "center",
    "floating-description": {
      "position": "left",
      "description-block": {
        "text-color": "#ffffff",
        "lines": ["Línea de texto 1", "Línea 2"]
      }
    }
  }
}
```

### 3. Bloque de Descripción (`description-block`)
Se utiliza para textos informativos simples o destacados.
*   **Prefijos de texto**:
    *   `QUOTE `: Aplica un estilo de cita resaltada.
    *   `REF `: Aplica un estilo de referencia bíblica o fuente.

```json
{
  "description-block": {
    "lines": ["Párrafo normal", "QUOTE Cita destacada", "REF Referencia"],
    "text-align": "center"
  },
  "background-color": "#f5f5f5"
}
```

### 4. Tarjeta de Imagen (`image-card`)
Muestra una imagen junto a un bloque de texto informativo.
*   **`image-position`**: `"left"` o `"right"`.
*   **`background-size`**: `"cover"` (llena el espacio) o `"contain"` (muestra la imagen completa).

```json
{
  "image-card": {
    "title": "Título de la tarjeta",
    "image": "assets/images/foto.jpg",
    "image-position": "left",
    "background-size": "cover",
    "description": {
      "lines": ["Contenido de la tarjeta"],
      "button": { "text": "Leer más", "link": "/url" }
    }
  }
}
```

### 5. Versículo del Día (`verse-of-the-day`)
Componente especializado para mostrar textos bíblicos.
*   **`show-background-image`**: `true` o `false`.
*   **`overlay-color`**: Color que cubre la imagen para mejorar la lectura del texto.

```json
{
  "verse-of-the-day": {
    "title": "El verso del día",
    "text-align": "center",
    "show-background-image": true,
    "copyright": "REINA-VALERA 1960"
  }
}
```

### 6. Mapa y Horarios (`map-widget`)
Se emplea para mostrar la ubicación y tablas de horarios de servicios.
*   **`src`**: Enlace de incrustación (Embed) de Google Maps.

```json
{
  "map-widget": {
    "src": "https://www.google.com/maps/...",
    "title": "Nuestra ubicación",
    "table": {
      "rows": [
        { "columns": [{ "text": "Martes" }, { "text": "7:30 p.m." }] }
      ]
    }
  }
}
```

### 7. Enlaces Rápidos (`quick-links`)
Fila de iconos con accesos directos. Los iconos deben residir en `assets/icons/`.

```json
{
  "quick-links": {
    "title": "Explora:",
    "links": [
      { "icon": "icono.png", "path": "/ruta-interna", "label": "Inicio" }
    ]
  }
}
```

### 8. Secciones Dinámicas de Video
Existen componentes que listan contenido automáticamente desde la base de datos:
*   **`recent-services`**: Muestra los cultos más recientes.
*   **`bible-courses`**: Muestra estudios agrupados por tipo.
*   **`video-gallery`**: Muestra la galería histórica de videos.
*   **`search-box`**: Configuración del buscador dentro de estas secciones. Opciones de `position`: `"center"`, `"left"`.

---

## 🖼️ Manejo de Archivos Multimedia

Para asegurar la calidad visual y el rendimiento del sitio:

1.  **Ubicación**: Las imágenes deben almacenarse en `src/assets/images/`.
2.  **Nomenclatura**: Se deben evitar espacios, eñes o tildes. Se recomienda el uso de guiones bajos o medios (ej. `misiones_guatemala.jpg`).
3.  **Formatos**: Se recomienda JPG o WebP para fotografías y PNG para elementos con transparencia.
4.  **Optimización**: Se sugiere que las imágenes para fondos no excedan los 1920px de ancho y que su peso esté optimizado para web.

---

## 🧭 Menú de Navegación (`navigation`)
Define la estructura del menú superior global.
*   **`options`**: Lista de enlaces. Se puede crear un submenú añadiendo una propiedad `options` dentro de un elemento.
*   **`button`**: Define el botón destacado al final del menú.

```json
"navigation": {
  "options": [
    { "text": "Inicio", "link": "/home" },
    { 
      "text": "Iglesia", 
      "options": [ { "text": "Servicios", "link": "/services" } ]
    }
  ]
}
```

---

## 📢 Notificación en Vivo (`live`)
Controla la barra de aviso de transmisiones en tiempo real.
*   **`background-color`**: Se recomienda un color contrastante para llamar la atención del usuario.

---

## 🛠️ Información Técnica

Este proyecto ha sido desarrollado con **Angular CLI 15.2.7**.

### Entorno de Desarrollo
1. Ejecutar `npm install` para instalar las dependencias necesarias.
2. Ejecutar `ng serve` para iniciar el servidor local en `http://localhost:4200/`.

### Generación de Producción
Para compilar el sitio y prepararlo para el servidor:
`ng build`
Los archivos generados se ubicarán en la carpeta `dist/`.


## 🧩 Catálogo de Secciones (Componentes)

Puedes copiar y pegar estos bloques dentro de la lista de `sections` de cualquier página.

### 1. Carrusel (Carousel)
Para la cabecera con imágenes que rotan.
```json
{
  "carousel": {
    "auto-rotate-ms": 7000,
    "slides": [
      {
        "background-image-with-floating-text": {
          "title": "Título del Slide",
          "background-image": "assets/images/tu-foto.jpg",
          "floating-description": {
            "position": "left",
            "description-block": {
              "lines": ["Primera línea", "Segunda línea"],
              "button": { "text": "Click aquí", "link": "/destino" }
            }
          }
        }
      }
    ]
  }
}
```

### 2. Bloque de Texto (Description Block)
Ideal para información general o citas bíblicas.
*   Usa el prefijo `QUOTE ` para resaltar texto.
*   Usa el prefijo `REF ` para la referencia bíblica.
```json
{
  "description-block": {
    "lines": [
      "Un párrafo normal.",
      "QUOTE Este texto saldrá resaltado como cita.",
      "REF Salmos 23:1"
    ]
  },
  "background-color": "#f5f5f5",
  "text-align": "center"
}
```

### 3. Tarjeta con Imagen (Image Card)
Muestra una foto a un lado (izquierdo o derecho) y texto al otro.
```json
{
  "image-card": {
    "title": "Título de la obra",
    "image": "assets/images/foto.jpg",
    "image-position": "right",
    "description": {
      "lines": ["Explicación de la sección."],
      "button": { "text": "Donar", "link": "https://..." }
    }
  }
}
```

### 4. Versículo del Día (Verse of the Day)
```json
{
  "verse-of-the-day": {
    "title": "El verso del día",
    "copyright": "REINA-VALERA 1960",
    "show-background-image": true
  }
}
```

### 5. Mapa y Horarios (Map Widget)
Para la dirección física y el cuadro de horarios.
```json
{
  "map-widget": {
    "src": "URL_DE_GOOGLE_MAPS_EMBED",
    "title": "Nuestra ubicación",
    "subtitle": "Dirección completa aquí",
    "table": {
      "rows": [
        { "columns": [{ "text": "Domingos" }, { "text": "10:00 AM" }] }
      ]
    }
  }
}
```

### 6. Enlaces Rápidos (Quick Links)
Fila de botones con iconos.
```json
{
  "quick-links": {
    "title": "Explora más:",
    "links": [
      {
        "icon": "nombre_icono.png", // debe estar en assets/icons/
        "path": "/contacto", // link interno
        "label": "Escríbenos"
      }
    ]
  }
}
```

### 7. Secciones de Video Automáticas
Estas secciones cargan automáticamente los videos de la base de datos:
*   **`recent-services`**: Los últimos cultos subidos.
*   **`bible-courses`**: Estudios filtrados por curso.
*   **`video-gallery`**: Una cuadrícula de videos antiguos.

### 8. Imagen de Fondo con Texto Flotante (Background Image with Floating Text)
Esta sección se usa mucho para encabezados de página o bloques destacados (ej. página de Misiones o Galería).
```json
{
  "background-image-with-floating-text": {
    "title": "Título Principal",
    "background-image": "assets/images/fondo.jpg",
    "background-color": "#3f4a49",
    "floating-description": {
      "position": "center", // puede ser: left, center, right
      "description-block": {
        "lines": ["Línea 1 de texto", "Línea 2"],
        "text-color": "#ffffff"
      }
    }
  }
}
```

---

## 🧭 Menú Superior (Navigation)
Para agregar o quitar pestañas del menú:
```json
"navigation": {
  "options": [
    { "text": "Inicio", "link": "/home" },
    { 
      "text": "Nosotros", 
      "options": [ // Esto crea un submenú
        { "text": "Pastores", "link": "/pastors" }
      ]
    }
  ],
  "button": { "text": "CONTRIBUIR", "link": "/contribute" }
}
```

---

## 📢 Transmisión en Vivo (Live)
Controla la barra de alerta que aparece cuando la iglesia está transmitiendo.
```json
"live": {
  "title": "Estamos transmitiendo en vivo",
  "notification": "Haz clic aquí para unirte",
  "background-color": "#3f4a49"
}
```

---

## 🛠️ Desarrollo Técnico

Este proyecto utiliza **Angular CLI 15.2.7**.

### Instalación y Servidor Local
1. Ejecuta `npm install` para bajar las librerías.
2. Ejecuta `ng serve` para ver el sitio en `http://localhost:4200/`.

### Generar versión final (Build)
Para subir cambios al servidor:
`ng build`
Los archivos resultantes estarán en la carpeta `dist/`.

Para más ayuda, consulta la documentación de Angular CLI.
