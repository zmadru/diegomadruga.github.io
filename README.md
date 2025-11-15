# Portfolio estático — sitio inicial

Plantilla inicial para un portfolio estático desplegable en GitHub Pages.

Estructura creada:

- `index.html` — Página principal
- `about.html` — Página "Sobre mí"
- `contact.html` — Página de contacto
- `projects/` — Carpeta con páginas de proyectos (`index.html`, `project1.html`)
- `css/style.css` — Estilos principales
- `js/main.js` — JavaScript mínimo

Para publicar en GitHub Pages (desde Windows PowerShell):

```powershell
git add .
git commit -m "Initial portfolio template"
git push origin main
```

Luego, en la UI de GitHub: `Settings` → `Pages` → seleccionar rama `main` y carpeta `/ (root)`.

Si quieres, puedo:
- Personalizar el contenido (texto, proyectos, enlaces)
- Añadir formularios de contacto funcionales o integrar enlaces a repositorios
- Crear un workflow de GitHub Actions para validaciones.
