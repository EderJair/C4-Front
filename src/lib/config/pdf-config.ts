/**
 * Configuración del sistema de extracción de PDF
 */

export const PDF_CONFIG = {
  // Límites de archivo
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_TEXT_LENGTH: 10,
  
  // Webhook de n8n
  DEFAULT_WEBHOOK_URL: 'https://n8n-jose.up.railway.app/webhook-test/pdfexca',
  
  // Configuración de procesamiento
  PROCESSING_TIMEOUT: 30000, // 30 segundos
  MAX_BUFFER_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Configuración de texto
  TEXT_CLEANUP: {
    MAX_CONSECUTIVE_NEWLINES: 2,
    PRESERVE_UNICODE_RANGES: [
      '\x20-\x7E',     // ASCII básico
      '\u00C0-\u017F', // Latín extendido A
      '\u0100-\u024F', // Latín extendido B
      '\u1E00-\u1EFF', // Latín extendido adicional
    ]
  },
  
  // Mensajes de respuesta
  MESSAGES: {
    SUCCESS: 'PDF procesado exitosamente con JavaScript puro y texto limpio enviado a n8n',
    ERROR_FILE_TOO_LARGE: 'El archivo excede el límite de 10MB',
    ERROR_INVALID_TYPE: 'Solo se permiten archivos PDF',
    ERROR_NO_TEXT: 'No se pudo extraer texto válido del PDF',
    ERROR_WEBHOOK: 'Error enviando a n8n',
    ERROR_PROCESSING: 'Error interno del servidor al procesar el PDF'
  }
} as const;

export type PDFConfig = typeof PDF_CONFIG;
