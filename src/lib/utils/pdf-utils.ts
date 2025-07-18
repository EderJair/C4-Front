/**
 * Utilidades para el manejo de PDFs
 */

import { PDF_CONFIG } from '@/lib/config/pdf-config';

/**
 * Valida si un archivo es un PDF válido
 */
export function validatePDFFile(file: File): { isValid: boolean; error?: string } {
  // Validar tipo de archivo
  if (file.type !== 'application/pdf') {
    return { 
      isValid: false, 
      error: PDF_CONFIG.MESSAGES.ERROR_INVALID_TYPE 
    };
  }

  // Validar tamaño del archivo
  if (file.size > PDF_CONFIG.MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: PDF_CONFIG.MESSAGES.ERROR_FILE_TOO_LARGE 
    };
  }

  return { isValid: true };
}

/**
 * Formatea el tamaño del archivo en MB
 */
export function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Genera un ID único para el procesamiento
 */
export function generateProcessId(): string {
  return `pdf-process-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Estima el número de páginas basado en el tamaño del archivo
 */
export function estimatePages(fileSize: number): number {
  // Estimación aproximada: 1 página ≈ 50KB
  return Math.max(1, Math.ceil(fileSize / (50 * 1024)));
}

/**
 * Formatea el tiempo de procesamiento
 */
export function formatProcessingTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  return `${(milliseconds / 1000).toFixed(1)}s`;
}
