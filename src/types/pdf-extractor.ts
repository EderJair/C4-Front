/**
 * Tipos específicos para el sistema de extracción de PDF
 */

export interface PDFFileInfo {
  name: string;
  size: number;
  pages: number;
}

export interface PDFExtractionResult {
  success: boolean;
  extractedText?: string;
  fileInfo?: PDFFileInfo;
  processingTime?: number;
  error?: string;
  n8nResponse?: any; // Respuesta del webhook n8n
}

export interface PDFProcessOptions {
  fileName: string;
  fileSize: number;
  projectPhaseId: number;
}

export interface PDFWebhookPayload {
  text: string;
  fileName: string;
  fileSize: number;
  pages: number;
  timestamp: string;
  textLength: number;
}

export interface PDFWebhookResponse {
  success: boolean;
  error?: string;
  n8nResponse?: any; // Respuesta del webhook n8n
}
