# Publicar STEM QR en Microsoft Store

Paquete listo para subir: **STEM QR 1.0.0** (APPX/MSIX + instalador local limpio).

## Estado actual del empaquetado

| Campo | Valor actual |
|--------|----------------|
| Versión | `1.0.0` |
| Display name | STEM QR |
| Application ID | `StemQR` |
| Identity name | `Stem.STEMQR` |
| Publisher | `CN=CCECE44A-7E72-4252-ACEA-59D29765B443` |
| Publisher display name | Stem |
| Package Family Name | `Stem.STEMQR_11wewj2255qep` |
| Store ID | `9PNT21J0RLMB` |
| Store URL | https://apps.microsoft.com/detail/9PNT21J0RLMB |
| MinVersion (Desktop) | `10.0.17763.0` |
| MaxVersionTested | `10.0.26100.0` |
| APPX | `release\STEM QR-1.0.0-win-x64.appx` |
| MSIX (misma build) | `release\STEM QR-1.0.0-win-x64.msix` |
| Instalador local | `release\STEM QR-1.0.0-win-x64.exe` |

> Partner Center acepta `.appx` o `.msix` (mismo paquete Store). Sube cualquiera de los dos.
> Identidad ya alineada con Partner Center (Stem / `Stem.STEMQR`).

## Checklist Partner Center

- [x] Cuenta en [Partner Center](https://partner.microsoft.com/dashboard)
- [x] Reservar nombre **STEM QR**
- [x] Identity Name / Publisher / Publisher display name en `electron-builder.yml`
- [x] Regenerar: `npm run build:store`
- [ ] Subir el `.msix` / `.appx` a Partner Center
- [ ] Capturas 1366×768 o 1920×1080 (claro y oscuro): Crear QR, Mis códigos, Plantillas, Imprimir, Ajustes
- [ ] Categoría: **Productividad**
- [ ] Clasificación por edad
- [ ] Política de privacidad (texto abajo; puedes publicarlo en GitHub Pages / Notion / tu web)
- [ ] Descripción corta y larga (textos listos abajo)

## Textos listos para pegar en la Store

### Descripción corta (ES)

Genera códigos QR personalizados en Windows: diseño, PDF, lote CSV y 100% local.

### Descripción larga (ES)

STEM QR es un generador de códigos QR para Windows pensado para uso local.

- Crea QR de URL, texto, WiFi, WhatsApp, email, contacto, evento, redes, menú, pago y más
- Estudio de diseño: colores, degradados, logo, iconos, formas, marcos y plantillas
- Avisos de escaneo y verificación real del QR para que el diseño se pueda leer
- Mis códigos: guarda, busca, carpetas, favoritos y respaldo JSON
- Imprimir en PDF (hojas A4/Carta) y exportar PNG, SVG, JPG, PDF y EPS
- Lote CSV → muchos QR en PDF o ZIP
- Funciona sin cuenta y sin nube: tus datos se quedan en tu PC
- Idiomas: español, inglés, portugués y francés

Ideal para negocios, eventos, menús, WiFi y materiales impresos.

### Short description (EN)

Create custom QR codes on Windows — design studio, PDF print, CSV batch, 100% local.

### Long description (EN)

STEM QR is a Windows QR code generator built for offline use.

- Many content types: URL, text, WiFi, WhatsApp, email, contact, event, social, menu, payment and more
- Design studio with colors, gradients, logo, icons, shapes, frames and templates
- Scan warnings plus live decode checks so your QR stays readable
- My codes archive with search, folders, favorites and JSON backup
- Print-ready PDF sheets and PNG / SVG / JPG / PDF / EPS export
- CSV batch export to PDF or ZIP
- No account and no cloud — everything stays on your PC
- Languages: Spanish, English, Portuguese and French

Great for businesses, events, menus, WiFi and print materials.

## Política de privacidad (borrador)

**STEM QR — Política de privacidad**

STEM QR es una aplicación de escritorio que funciona de forma local en tu equipo.

1. **Datos que procesa:** el contenido que escribes para generar códigos QR (URLs, texto, WiFi, contactos, etc.) y los estilos que configuras.
2. **Dónde se guarda:** en este dispositivo (por ejemplo, almacenamiento local de la app). No enviamos ese contenido a servidores nuestros.
3. **Cuenta / inicio de sesión:** no requiere cuenta.
4. **Telemetría / publicidad:** esta versión no incluye telemetría ni anuncios.
5. **Red:** la app está diseñada para uso offline. Funciones como abrir enlaces externos solo ocurren si tú las inicias.
6. **Contacto:** Enmanuel — actualiza este correo/web cuando publiques la política.

Última actualización: 16 de septiembre de 2026.

## Icono QR → búsqueda en Store

El icono (`npm run icons`) es un QR que apunta a:

`https://apps.microsoft.com/detail/9PNT21J0RLMB`

Usa `build/icon-store-qr.png` (o un export grande) para escanearlo; el icono de la barra de tareas es demasiado pequeño.

## Comandos

```bash
# Instalador local (NSIS)
npm run build:desktop

# Paquete Microsoft Store (APPX; copia también como .msix si hace falta)
npm run build:store
```

Salida: `release\` dentro del proyecto (`STEM QR-1.0.0-win-x64.appx` / `.msix` / `.exe`)

## Identidad actual en el proyecto

- Nombre para mostrar: STEM QR
- Application ID: StemQR
- Identity name: Stem.STEMQR
- Publisher display name: Stem
- Publisher: `CN=CCECE44A-7E72-4252-ACEA-59D29765B443`
- PFN: `Stem.STEMQR_11wewj2255qep`
- Store ID: `9PNT21J0RLMB`
- Store URL: https://apps.microsoft.com/detail/9PNT21J0RLMB
- MSA app Id: `e2c55634-1ec5-4979-98a5-8523a97e0b4b`
