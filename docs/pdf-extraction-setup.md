# Configuración del Sistema de Extracción de PDF

## Estructura del Proyecto

### Carpetas principales:
- `src/lib/` - Librerías y utilitarios
- `src/app/api/excavation/` - API endpoints para excavaciones
- `src/components/excavation/` - Componentes de UI para excavaciones
- `src/types/` - Tipos de TypeScript

### Archivos clave:
- `src/lib/pdf-extractor-clean.ts` - Extractor PDF limpio con JavaScript puro
- `src/app/api/excavation/process-pdf/route.ts` - Endpoint para procesar PDFs
- `.env.local` - Configuración del webhook de n8n

## Configuración

### Variables de entorno requeridas:
```bash
N8N_WEBHOOK_URL=https://n8n-jose.up.railway.app/webhook-test/pdfexca
```

### Dependencias principales:
- `pdf-parse` - Extracción de texto de PDFs
- `next` - Framework de React
- `typescript` - Tipos y desarrollo

## Flujo de procesamiento:

1. **Upload PDF** → Frontend envía archivo
2. **Validación** → Verifica tipo y tamaño
3. **Extracción** → pdf-parse extrae texto limpio
4. **Limpieza** → Normaliza espacios y caracteres
5. **Envío n8n** → Webhook recibe texto procesado
6. **Respuesta** → Frontend recibe confirmación

## Características:

✅ **JavaScript puro** - Sin dependencias de Python
✅ **Texto limpio** - Extracción sin caracteres corruptos
✅ **Producción ready** - Compatible con Vercel, Railway, etc.
✅ **Bien estructurado** - Código organizado en carpetas
✅ **Logs detallados** - Seguimiento completo del proceso
✅ **Manejo de errores** - Validación y recuperación

## Deployment:

El proyecto está listo para despliegue en cualquier plataforma Node.js:
- Vercel (recomendado para Next.js)
- Railway
- Netlify
- AWS Lambda
- Google Cloud Functions

No requiere Python ni dependencias del sistema.
