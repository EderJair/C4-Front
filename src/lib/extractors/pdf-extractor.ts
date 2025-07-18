import { PDF_CONFIG } from '@/lib/config/pdf-config';
import { estimatePages } from '@/lib/utils/pdf-utils';
import type {
  PDFFileInfo,
  PDFExtractionResult,
  PDFProcessOptions,
  PDFWebhookPayload,
  PDFWebhookResponse
} from '@/types/pdf-extractor';

// Usar alias para evitar conflictos
type FileInfo = PDFFileInfo;
type ExtractionResult = PDFExtractionResult;
type ProcessOptions = PDFProcessOptions;

/**
 * Extractor de PDF limpio y simple usando solo JavaScript
 */
class CleanPDFExtractor {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || PDF_CONFIG.DEFAULT_WEBHOOK_URL;
  }

  /**
   * Extrae texto limpio del PDF usando análisis de buffer mejorado
   */
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      console.log('📄 Iniciando extracción de texto mejorada...');
      
      // Método 1: Intentar decodificar UTF-16 hex
      let extractedText = this.extractUTF16HexText(buffer);
      console.log('🔍 Método UTF-16 hex:', { length: extractedText.length, preview: extractedText.substring(0, 100) });
      
      if (!extractedText || extractedText.length < 30) {
        console.log('🔄 UTF-16 hex insuficiente, intentando texto legible...');
        extractedText = this.extractReadableText(buffer);
        console.log('🔍 Método texto legible:', { length: extractedText.length, preview: extractedText.substring(0, 100) });
      }
      
      if (!extractedText || extractedText.length < 30) {
        console.log('🔄 Texto legible insuficiente, intentando extracción de streams...');
        extractedText = this.extractFromStreams(buffer);
        console.log('🔍 Método streams:', { length: extractedText.length, preview: extractedText.substring(0, 100) });
      }
      
      if (!extractedText || extractedText.length < 30) {
        console.log('⚠️ Métodos avanzados fallaron, usando extracción básica filtrada...');
        extractedText = this.extractBasicTextFiltered(buffer);
        console.log('🔍 Método básico filtrado:', { length: extractedText.length, preview: extractedText.substring(0, 100) });
      }
      
      // Validar que no sea solo metadatos
      if (this.isOnlyMetadata(extractedText)) {
        console.log('⚠️ Solo metadatos detectados, intentando extracción alternativa...');
        extractedText = this.extractAlternativeText(buffer);
      }
      
      console.log('✅ Texto extraído exitosamente:', {
        textLength: extractedText.length,
        preview: extractedText.substring(0, 300) + '...'
      });

      return extractedText;
      
    } catch (error) {
      console.error('❌ Error extrayendo texto del PDF:', error);
      throw new Error(`Error en extracción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Detecta si el texto extraído es solo metadatos del PDF
   */
  private isOnlyMetadata(text: string): boolean {
    const metadataIndicators = [
      'PDF-1.', 'Linearized', 'startxref', 'EOF', 'xref',
      'Filter', 'FlateDecode', 'DeviceRGB', 'MediaBox',
      'CropBox', 'Resources', 'ExtGState', 'ProcSet',
      'Border', 'Contents', 'Subtype', 'Square',
      /\d+\s+\d+\s+obj/, // Objetos PDF
      /\d+\s+\d+\s+R/, // Referencias PDF
      /\d+\s+\d+\s+n/ // Tabla xref
    ];
    
    const lines = text.split('\n');
    let metadataLines = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        const isMetadata = metadataIndicators.some(indicator => {
          if (typeof indicator === 'string') {
            return trimmed.includes(indicator);
          } else {
            return indicator.test(trimmed);
          }
        });
        
        if (isMetadata) {
          metadataLines++;
        }
      }
    }
    
    // Si más del 70% son metadatos, considerarlo solo metadatos
    return metadataLines > (lines.length * 0.7);
  }

  /**
   * Extrae texto de streams PDF decodificados
   */
  private extractFromStreams(buffer: Buffer): string {
    try {
      const pdfString = buffer.toString('latin1');
      const streams: string[] = [];
      
      // Buscar contenido entre stream y endstream
      const streamPattern = /stream\s*(.*?)\s*endstream/gm;
      let match;
      
      while ((match = streamPattern.exec(pdfString)) !== null) {
        const streamContent = match[1];
        if (streamContent && streamContent.length > 20) {
          // Intentar decodificar el stream
          const decodedContent = this.decodeStreamContent(streamContent);
          if (decodedContent && decodedContent.length > 10) {
            streams.push(decodedContent);
          }
        }
      }
      
      let finalText = streams.join(' ');
      finalText = this.cleanExtractedText(finalText);
      finalText = this.filterTechnicalContent(finalText);
      
      return finalText;
      
    } catch (error) {
      console.error('Error extrayendo de streams:', error);
      return '';
    }
  }

  /**
   * Intenta decodificar contenido de stream
   */
  private decodeStreamContent(content: string): string {
    try {
      // Buscar texto legible en el stream
      const textPattern = /[A-Za-z\s]{10,}/g;
      const matches = content.match(textPattern);
      
      if (matches) {
        return matches.join(' ');
      }
      
      // Intentar decodificar como UTF-8
      try {
        const buffer = Buffer.from(content, 'latin1');
        const utf8Text = buffer.toString('utf8');
        if (utf8Text.length > 10 && /[A-Za-z]/.test(utf8Text)) {
          return utf8Text;
        }
      } catch (e) {
        // Continuar con otros métodos
      }
      
      return '';
      
    } catch (error) {
      return '';
    }
  }

  /**
   * Extracción básica con filtrado agresivo de metadatos
   */
  private extractBasicTextFiltered(buffer: Buffer): string {
    try {
      const pdfString = buffer.toString('utf8');
      
      // Filtrar líneas que son claramente metadatos
      const lines = pdfString.split('\n');
      const filteredLines: string[] = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Saltar líneas que son claramente metadatos
        if (this.isMetadataLine(trimmed)) {
          continue;
        }
        
        // Buscar texto legible en la línea
        const readableText = this.extractReadableFromLine(trimmed);
        if (readableText && readableText.length > 3) {
          filteredLines.push(readableText);
        }
      }
      
      let finalText = filteredLines.join(' ');
      finalText = this.cleanExtractedText(finalText);
      finalText = this.filterTechnicalContent(finalText);
      
      return finalText;
      
    } catch (error) {
      console.error('Error en extracción básica filtrada:', error);
      return '';
    }
  }

  /**
   * Determina si una línea es metadatos del PDF
   */
  private isMetadataLine(line: string): boolean {
    const metadataPatterns = [
      /^PDF-1\./,
      /^\d+\s+\d+\s+obj/,
      /^\d+\s+\d+\s+R/,
      /^\d+\s+\d+\s+n$/,
      /^(startxref|EOF|xref)$/,
      /^(Filter|FlateDecode|DeviceRGB|MediaBox|CropBox|Resources|ExtGState|ProcSet)$/,
      /^Border\s+\d+/,
      /^Contents\(/,
      /^Subtype\s+(Square|Text)/,
      /^Name\(/,
      /^Linearized\s+\d+/,
      /^L\s+\d+/,
      /^O\s+\d+/,
      /^E\s+\d+/,
      /^T\s+\d+/,
      /^Size\s+\d+/,
      /^Root\s+\d+/,
      /^Info\s+\d+/,
      /^h\s+[A-Za-z0-9,\s]+$/,
      /^V,VzcV/,
      /^Xop\d+/
    ];
    
    return metadataPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Extrae texto legible de una línea específica
   */
  private extractReadableFromLine(line: string): string {
    // Buscar secuencias de texto legible
    const readablePattern = /[A-Za-z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s\-_.,;:()]{5,}/g;
    const matches = line.match(readablePattern);
    
    if (matches) {
      return matches
        .filter(match => match.trim().length > 3)
        .join(' ')
        .trim();
    }
    
    return '';
  }

  /**
   * Método alternativo de extracción cuando otros fallan
   */
  private extractAlternativeText(buffer: Buffer): string {
    try {
      // Intentar con diferentes codificaciones
      const encodings = ['utf8', 'latin1', 'ascii', 'utf16le'];
      
      for (const encoding of encodings) {
        try {
          const text = buffer.toString(encoding as BufferEncoding);
          const extracted = this.extractReadableFromString(text);
          
          if (extracted && extracted.length > 50 && !this.isOnlyMetadata(extracted)) {
            console.log(`✅ Extracción exitosa con codificación: ${encoding}`);
            return extracted;
          }
        } catch (e) {
          continue;
        }
      }
      
      return 'No se pudo extraer texto legible del PDF';
      
    } catch (error) {
      console.error('Error en extracción alternativa:', error);
      return 'Error en extracción de texto';
    }
  }

  /**
   * Extrae texto legible de una cadena
   */
  private extractReadableFromString(text: string): string {
    const readablePattern = /[A-Za-z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s\-_.,;:()]{10,}/g;
    const matches = text.match(readablePattern);
    
    if (matches) {
      let result = matches
        .filter(match => match.trim().length > 5)
        .join(' ')
        .trim();
      
      result = this.cleanExtractedText(result);
      result = this.filterTechnicalContent(result);
      
      return result;
    }
    
    return '';
  }

  /**
   * Extrae y decodifica texto UTF-16 en formato hexadecimal
   */
  private extractUTF16HexText(buffer: Buffer): string {
    try {
      const pdfString = buffer.toString('utf8');
      const decodedTexts: Set<string> = new Set(); // Usar Set para evitar duplicados
      
      // Buscar patrones UTF-16 hex (feff seguido de códigos hex)
      const utf16Pattern = /feff([0-9a-fA-F]{32,})/g;
      let match;
      
      while ((match = utf16Pattern.exec(pdfString)) !== null) {
        const hexString = match[1];
        const decodedText = this.decodeUTF16Hex(hexString);
        if (decodedText && decodedText.length > 5) {
          decodedTexts.add(decodedText.trim());
        }
      }
      
      // Buscar también patrones sin feff pero con mayor selectividad
      const hexOnlyPattern = /([0-9a-fA-F]{40,})/g; // Mínimo 40 caracteres hex
      while ((match = hexOnlyPattern.exec(pdfString)) !== null) {
        const hexString = match[1];
        if (hexString.length % 4 === 0) { // Debe ser múltiplo de 4 para UTF-16
          const decodedText = this.decodeUTF16Hex(hexString);
          if (decodedText && decodedText.length > 10 && /[A-Za-z\s]/.test(decodedText)) {
            decodedTexts.add(decodedText.trim());
          }
        }
      }
      
      let finalText = Array.from(decodedTexts).join(' ');
      finalText = this.removeDuplicateContent(finalText);
      finalText = this.cleanExtractedText(finalText);
      finalText = this.filterTechnicalContent(finalText);
      
      return finalText;
      
    } catch (error) {
      console.error('Error decodificando UTF-16 hex:', error);
      return '';
    }
  }

  /**
   * Elimina contenido duplicado del texto extraído
   */
  private removeDuplicateContent(text: string): string {
    if (!text) return '';
    
    // Dividir en oraciones y párrafos
    const sentences = text.split(/[.!?]\s+/);
    const uniqueSentences: Set<string> = new Set();
    
    for (const sentence of sentences) {
      const cleaned = sentence.trim();
      if (cleaned.length > 10) {
        // Normalizar espacios para mejor comparación
        const normalized = cleaned.replace(/\s+/g, ' ').toLowerCase();
        
        // Solo agregar si no es muy similar a una oración existente
        let isDuplicate = false;
        for (const existing of uniqueSentences) {
          if (this.isSimilarText(normalized, existing.toLowerCase())) {
            isDuplicate = true;
            break;
          }
        }
        
        if (!isDuplicate) {
          uniqueSentences.add(cleaned);
        }
      }
    }
    
    return Array.from(uniqueSentences).join('. ');
  }

  /**
   * Determina si dos textos son similares (para detectar duplicados)
   */
  private isSimilarText(text1: string, text2: string): boolean {
    if (text1 === text2) return true;
    
    // Calcular similaridad simple
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    if (Math.abs(words1.length - words2.length) > 3) return false;
    
    const commonWords = words1.filter(word => 
      words2.includes(word) && word.length > 3
    );
    
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    return similarity > 0.7; // 70% de palabras en común
  }

  /**
   * Decodifica string hexadecimal a UTF-16
   */
  private decodeUTF16Hex(hexString: string): string {
    try {
      const result: string[] = [];
      
      // Procesar cada 4 caracteres hex (2 bytes) como un carácter UTF-16
      for (let i = 0; i < hexString.length; i += 4) {
        const hex = hexString.substr(i, 4);
        if (hex.length === 4) {
          const charCode = parseInt(hex, 16);
          if (charCode > 0 && charCode < 65536) {
            const char = String.fromCharCode(charCode);
            // Solo agregar caracteres legibles
            if (char.match(/[A-Za-z0-9\s\-_.,;:()\u00C0-\u017F]/)) {
              result.push(char);
            }
          }
        }
      }
      
      return result.join('');
      
    } catch (error) {
      console.error('Error decodificando hex:', error);
      return '';
    }
  }

  /**
   * Extrae solo texto legible del PDF
   */
  private extractReadableText(buffer: Buffer): string {
    try {
      const pdfString = buffer.toString('utf8');
      const readableTexts: string[] = [];
      
      // Buscar texto que contenga solo caracteres legibles
      const readablePattern = /[A-Za-z0-9\s\-_.,;:()]{5,}/g;
      let match;
      
      while ((match = readablePattern.exec(pdfString)) !== null) {
        const text = match[0].trim();
        if (text && text.length > 4 && !text.match(/^\d+$/)) {
          readableTexts.push(text);
        }
      }
      
      // Buscar texto específico en patrones PDF
      const textPatterns = [
        /\(([A-Za-z0-9\s\-_.,;:()]{3,})\)\s*Tj/g,
        /\(([A-Za-z0-9\s\-_.,;:()]{3,})\)/g
      ];
      
      textPatterns.forEach(pattern => {
        while ((match = pattern.exec(pdfString)) !== null) {
          const text = match[1].trim();
          if (text && text.length > 2 && !text.match(/^[\x00-\x1F\x7F-\xFF]+$/)) {
            readableTexts.push(text);
          }
        }
      });
      
      // Unir y limpiar texto
      let finalText = readableTexts.join(' ');
      finalText = this.cleanExtractedText(finalText);
      finalText = this.filterTechnicalContent(finalText);
      
      return finalText;
      
    } catch (error) {
      console.error('Error extrayendo texto legible:', error);
      return '';
    }
  }

  /**
   * Extracción básica como fallback
   */
  private extractBasicText(buffer: Buffer): string {
    try {
      const pdfString = buffer.toString('latin1');
      
      // Buscar strings que parezcan texto real
      const basicTexts: string[] = [];
      const basicPattern = /[A-Za-z]{3,}(?:\s+[A-Za-z]{2,})*/g;
      let match;
      
      while ((match = basicPattern.exec(pdfString)) !== null) {
        const text = match[0].trim();
        if (text && text.length > 3) {
          basicTexts.push(text);
        }
      }
      
      return basicTexts.join(' ').substring(0, 1000); // Limitar tamaño
      
    } catch (error) {
      console.error('Error en extracción básica:', error);
      return 'No se pudo extraer texto legible del PDF';
    }
  }

  /**
   * Limpia el texto extraído del PDF
   */
  private cleanExtractedText(text: string): string {
    if (!text) return '';

    // Eliminar caracteres de control y no imprimibles
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    
    // Eliminar números de objeto PDF y palabras clave técnicas
    text = text.replace(/\b\d+\s+\d+\s+R\b/g, ' ');
    text = text.replace(/\b(obj|endobj|stream|endstream|xref|trailer)\b/g, ' ');
    text = text.replace(/\b(Parent|Count|First|Last|Next|Prev|Title|Creator|Producer|ModDate|CreationDate)\b/g, ' ');
    
    // Eliminar códigos hexadecimales residuales
    text = text.replace(/[0-9a-fA-F]{8,}/g, ' ');
    
    // Eliminar repeticiones de palabras consecutivas
    text = text.replace(/\b(\w+)(\s+\1){2,}/g, '$1'); // Eliminar 3+ repeticiones consecutivas
    
    // Eliminar frases repetidas cortas
    text = text.replace(/\b(.{10,30})\s+\1\s+\1/g, '$1'); // Eliminar frases repetidas 3+ veces
    
    // Eliminar caracteres especiales problemáticos pero conservar acentos
    text = text.replace(/[^\x20-\x7E\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\n\r\t]/g, '');
    
    // Normalizar espacios y saltos de línea
    text = text
      .replace(/\r\n/g, '\n')           // Normalizar saltos de línea
      .replace(/\r/g, '\n')             // Normalizar saltos de línea
      .replace(/\n{3,}/g, '\n\n')       // Máximo 2 saltos de línea consecutivos
      .replace(/[ \t]+/g, ' ')          // Normalizar espacios
      .replace(/^\s+|\s+$/g, '')        // Quitar espacios al inicio y final
      .replace(/\n /g, '\n')            // Quitar espacios después de saltos de línea
      .replace(/ \n/g, '\n')            // Quitar espacios antes de saltos de línea
      .replace(/\\\\/g, '\\')           // Normalizar backslashes
      .replace(/\s+/g, ' ')             // Normalizar espacios múltiples
      .trim();

    // Filtrar líneas duplicadas y muy cortas
    const lines = text.split('\n');
    const uniqueLines = new Set<string>();
    const filteredLines: string[] = [];
    
    for (const line of lines) {
      const cleaned = line.trim();
      if (cleaned.length > 5 && /[A-Za-z]/.test(cleaned)) {
        const normalized = cleaned.toLowerCase().replace(/\s+/g, ' ');
        if (!uniqueLines.has(normalized)) {
          uniqueLines.add(normalized);
          filteredLines.push(cleaned);
        }
      }
    }

    return filteredLines.join('\n').trim();

    return text;
  }

  /**
   * Filtra contenido técnico de AutoCAD
   */
  private filterTechnicalContent(text: string): string {
    if (!text) return '';
    
    // Eliminar repeticiones de AutoCAD
    text = text.replace(/AutoCAD\s+SHX\s+Text\s*/gi, '');
    text = text.replace(/AutoCAD\s*/gi, '');
    text = text.replace(/\(Adobe[^)]*\)/gi, '');
    text = text.replace(/\(UCS[^)]*\)/gi, '');
    text = text.replace(/def\s+/gi, '');
    
    // Eliminar timestamps
    text = text.replace(/D:\d{14}/g, '');
    
    // Eliminar códigos técnicos repetitivos
    text = text.replace(/SHX\s+Text\s*/gi, '');
    text = text.replace(/\\\s+\\\s+/g, ' ');
    
    // Eliminar patrones de coordenadas o códigos
    text = text.replace(/\d+_\w+/g, '');
    text = text.replace(/[A-Z]{2,}_[A-Z\d_]+/g, '');
    
    // Normalizar espacios
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  /**
   * Estima el número de páginas basado en el tamaño del archivo
   */
  private estimatePages(fileSize: number): number {
    return estimatePages(fileSize);
  }

  /**
   * Envía el texto extraído a n8n webhook
   */
  async sendTextToN8N(text: string, fileInfo: FileInfo): Promise<PDFWebhookResponse> {
    try {
      console.log('📤 Enviando texto a n8n webhook...');
      
      const payload: PDFWebhookPayload = {
        text: text,
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        pages: fileInfo.pages,
        timestamp: new Date().toISOString(),
        textLength: text.length
      };

      console.log('📋 Payload enviado a n8n:', {
        textLength: payload.textLength,
        fileName: payload.fileName,
        pages: payload.pages,
        timestamp: payload.timestamp,
        textPreview: text.substring(0, 200) + '...'
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

      let n8nResponse;
      try {
        n8nResponse = await response.json();
      } catch (e) {
        n8nResponse = await response.text();
      }
      
      console.log('🎯 ===== RESPUESTA DE N8N =====');
      console.log('📥 Respuesta completa del n8n:', n8nResponse);
      console.log('📊 Tipo de respuesta:', typeof n8nResponse);
      
      if (typeof n8nResponse === 'object' && n8nResponse !== null) {
        console.log('📋 Propiedades de la respuesta:');
        Object.keys(n8nResponse).forEach(key => {
          console.log(`  • ${key}:`, n8nResponse[key]);
        });
      }
      
      console.log('🎯 ===== FIN RESPUESTA N8N =====');
      
      return { 
        success: true, 
        n8nResponse: n8nResponse 
      };
      
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
      
      if (!extractedText || extractedText.length < PDF_CONFIG.MIN_TEXT_LENGTH) {
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
        pages: fileInfo.pages,
        n8nResponse: webhookResult.n8nResponse
      });
      
      return {
        success: true,
        extractedText,
        fileInfo,
        processingTime,
        n8nResponse: webhookResult.n8nResponse
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
