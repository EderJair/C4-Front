# Configuración de n8n para Extracción de PDF

Esta guía te ayudará a configurar un workflow de n8n para recibir y procesar los datos extraídos del PDF.

## Workflow de n8n Recomendado

### 1. Webhook Node (Trigger)
- **HTTP Method:** POST
- **Path:** `/webhook/pdf-extraction`
- **Response:** JSON

### 2. Procesar Datos (Code Node)
```javascript
// Procesar los datos recibidos del PDF
const { extractedData, metadata } = $json;

// Validar y limpiar datos
const cleanData = {
  projectId: metadata.projectPhaseId,
  fileName: metadata.originalName,
  extractedAt: new Date().toISOString(),
  confidence: extractedData.confidence || 0,
  
  // Datos de excavación
  depth: extractedData.excavationDepth || null,
  area: extractedData.excavationArea || null,
  volume: extractedData.excavationVolume || null,
  soilType: extractedData.soilType || null,
  equipment: extractedData.equipment || [],
  
  // Costos
  laborHours: extractedData.laborHours || 0,
  materialCost: extractedData.materialCost || 0,
  equipmentCost: extractedData.equipmentCost || 0,
  laborCost: extractedData.laborCost || 0,
  
  // Fechas y estado
  startDate: extractedData.startDate || null,
  endDate: extractedData.endDate || null,
  status: extractedData.status || 'pending',
  notes: extractedData.notes || ''
};

return [cleanData];
```

### 3. Guardar en Base de Datos (Database Node)
- **Operation:** Insert
- **Table:** excavations
- **Columns:** Mapear los campos del cleanData

### 4. Notificar por Email (Email Node)
```html
<!DOCTYPE html>
<html>
<head>
  <title>PDF Procesado</title>
</head>
<body>
  <h2>PDF de Excavación Procesado</h2>
  <p><strong>Archivo:</strong> {{ $json.fileName }}</p>
  <p><strong>Confianza:</strong> {{ $json.confidence }}%</p>
  <p><strong>Proyecto:</strong> {{ $json.projectId }}</p>
  
  <h3>Datos Extraídos:</h3>
  <ul>
    <li><strong>Profundidad:</strong> {{ $json.depth }} m</li>
    <li><strong>Área:</strong> {{ $json.area }} m²</li>
    <li><strong>Volumen:</strong> {{ $json.volume }} m³</li>
    <li><strong>Tipo de Suelo:</strong> {{ $json.soilType }}</li>
    <li><strong>Equipos:</strong> {{ $json.equipment.join(', ') }}</li>
  </ul>
  
  <h3>Costos:</h3>
  <ul>
    <li><strong>Materiales:</strong> ${{ $json.materialCost }}</li>
    <li><strong>Equipos:</strong> ${{ $json.equipmentCost }}</li>
    <li><strong>Mano de Obra:</strong> ${{ $json.laborCost }} ({{ $json.laborHours }} hrs)</li>
  </ul>
  
  <p><strong>Notas:</strong> {{ $json.notes }}</p>
  
  <p><em>Procesado automáticamente el {{ $json.extractedAt }}</em></p>
</body>
</html>
```

### 5. Webhook de Respuesta (Response Node)
```json
{
  "success": true,
  "message": "Datos procesados exitosamente en n8n",
  "processedAt": "{{ $now }}",
  "dataId": "{{ $json.id }}"
}
```

## Variables de Entorno para n8n

Agrega estas variables a tu archivo .env.local:

```env
# URL del webhook de n8n
N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook/pdf-extraction

# Credenciales de tu base de datos (para n8n)
DATABASE_URL=postgresql://user:password@localhost:5432/excavations_db
```

## Ejemplo de Configuración de n8n

1. **Crear el workflow** en n8n
2. **Configurar el webhook** con la URL que pondrás en N8N_WEBHOOK_URL
3. **Probar el workflow** enviando datos de prueba
4. **Configurar la base de datos** para persistir los datos extraídos

## Alternativa: Servicios de Extracción de PDF

Si prefieres usar servicios externos en lugar de OpenAI:

### Google Cloud Vision API
```javascript
// En tu workflow de n8n
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

// Procesar PDF con Google Vision
const [result] = await client.documentTextDetection(pdfBuffer);
```

### AWS Textract
```javascript
// En tu workflow de n8n
const AWS = require('aws-sdk');
const textract = new AWS.Textract();

// Procesar PDF con AWS Textract
const result = await textract.analyzeDocument({
  Document: { Bytes: pdfBuffer },
  FeatureTypes: ['TABLES', 'FORMS']
}).promise();
```

### Azure Form Recognizer
```javascript
// En tu workflow de n8n
const { FormRecognizerClient } = require('@azure/ai-form-recognizer');

const client = new FormRecognizerClient(endpoint, credential);
const result = await client.beginRecognizeContent(pdfBuffer);
```

## Pruebas

Para probar el sistema:

1. **Sube un PDF** de prueba con datos de excavación
2. **Verifica los logs** en la consola del navegador
3. **Revisa n8n** para ver si recibe los datos
4. **Comprueba la base de datos** para ver los datos guardados

## Notas Importantes

- **Configurar OPENAI_API_KEY** es obligatorio para la extracción
- **N8N_WEBHOOK_URL** es opcional pero recomendado
- **Los datos se procesan en tiempo real** usando OpenAI
- **El sistema tiene fallbacks** en caso de errores
- **La confianza se calcula** basada en los campos extraídos
