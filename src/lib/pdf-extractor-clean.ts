import pdf from 'pdf-parse';

interface FileInfo {
  name: string;
  size: number;
  pages: number;
}

interface ExtractionResult {
  success: boolean;
  extractedText?: string;
  fileInfo?: FileInfo;
  processingTime?: number;
  error?: string;
}

interface ProcessOptions {
  fileName: string;
  fileSize: number;
  projectPhaseId: number;
}

/**
 * Extractor de PDF limpio y simple usando solo JavaScript
 */
class CleanPDFExtractor {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-jose.up.railway.app/webhook-test/pdfexca';
  }

  /**
   * Extrae texto limpio del PDF usando pdf-parse
   */
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      console.log('📄 Iniciando extracción de texto con pdf-parse...');
      
      const data = await pdf(buffer);
      
      console.log('📊 Información del PDF:', {
        pages: data.numpages,
        info: data.info,
        textLength: data.text.length
      });

      // Limpiar el texto extraído
      let cleanText = this.cleanExtractedText(data.text);
      
      console.log('✅ Texto extraído exitosamente:', {
        originalLength: data.text.length,
        cleanLength: cleanText.length,
        pages: data.numpages,
        preview: cleanText.substring(0, 200) + '...'
      });

      return cleanText;
      
    } catch (error) {
      console.error('❌ Error extrayendo texto del PDF:', error);
      throw new Error(`Error en extracción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Limpia el texto extraído del PDF
   */
  private cleanExtractedText(text: string): string {
    if (!text) return '';

    // Normalizar espacios y saltos de línea
    let cleanText = text
      .replace(/\r\n/g, '\n')           // Normalizar saltos de línea
      .replace(/\r/g, '\n')             // Normalizar saltos de línea
      .replace(/\n{3,}/g, '\n\n')       // Máximo 2 saltos de línea consecutivos
      .replace(/[ \t]+/g, ' ')          // Normalizar espacios
      .replace(/^\s+|\s+$/g, '')        // Quitar espacios al inicio y final
      .replace(/\n /g, '\n')            // Quitar espacios después de saltos de línea
      .replace(/ \n/g, '\n');           // Quitar espacios antes de saltos de línea

    // Limpiar caracteres especiales problemáticos pero conservar acentos
    cleanText = cleanText
      .replace(/[^\x20-\x7E\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\n\r\t]/g, '')
      .trim();

    return cleanText;
  }

  /**
   * Estima el número de páginas basado en el tamaño del archivo
   */
  private estimatePages(fileSize: number): number {
    // Estimación aproximada: 1 página ≈ 50KB
    return Math.max(1, Math.ceil(fileSize / (50 * 1024)));
  }

  /**
   * Envía el texto extraído a n8n webhook
   */
  async sendTextToN8N(text: string, fileInfo: FileInfo): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📤 Enviando texto a n8n webhook...');
      
      const payload = {
        text: text,
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        pages: fileInfo.pages,
        timestamp: new Date().toISOString(),
        textLength: text.length
      };

      console.log('📋 Payload para n8n:', {
        textLength: payload.textLength,
        fileName: payload.fileName,
        pages: payload.pages,
        timestamp: payload.timestamp
      });

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorText = await response.text();
          errorDetails = errorText ? ` - ${errorText}` : '';
        } catch (e) {
          // Ignorar errores al leer respuesta
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorDetails}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = await response.text();
      }
      
      console.log('✅ Texto enviado a n8n exitosamente:', result);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error enviando a n8n:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Procesa el PDF y envía el texto limpio a n8n
   */
  async processAndSendPDF(buffer: Buffer, options: ProcessOptions): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Iniciando procesamiento del PDF:', {
        fileName: options.fileName,
        fileSize: `${(options.fileSize / 1024 / 1024).toFixed(2)} MB`,
        projectPhaseId: options.projectPhaseId
      });
      
      // Extraer texto del PDF
      const extractedText = await this.extractTextFromPDF(buffer);
      
      if (!extractedText || extractedText.length < 10) {
        throw new Error('No se pudo extraer texto válido del PDF');
      }
      
      // Crear información del archivo
      const fileInfo: FileInfo = {
        name: options.fileName,
        size: options.fileSize,
        pages: this.estimatePages(options.fileSize)
      };
      
      // Enviar a n8n
      const webhookResult = await this.sendTextToN8N(extractedText, fileInfo);
      
      const processingTime = Date.now() - startTime;
      
      if (!webhookResult.success) {
        return {
          success: false,
          error: `Error enviando a n8n: ${webhookResult.error}`,
          processingTime
        };
      }
      
      console.log('✅ Procesamiento completado exitosamente:', {
        textLength: extractedText.length,
        processingTime: `${processingTime}ms`,
        pages: fileInfo.pages
      });
      
      return {
        success: true,
        extractedText,
        fileInfo,
        processingTime
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Error en procesamiento completo:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        processingTime
      };
    }
  }
}

export default CleanPDFExtractor;
