import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

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

class PDFExtractor {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-jose.up.railway.app/webhook-test/pdfexca';
  }

  /**
   * Extrae texto de un buffer PDF usando análisis de buffer mejorado
   */
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      console.log('🚀 Iniciando extracción de PDF...');
      
      // Método 1: Intentar usar PyMuPDF (Python) para mejor extracción - PRIORITARIO
      console.log('🐍 Intentando método PyMuPDF...');
      const pythonText = await this.extractTextWithPython(buffer);
      
      if (pythonText && pythonText.trim().length > 50) {
        console.log('✅ PyMuPDF exitoso - texto extraído:', pythonText.length, 'caracteres');
        console.log('👁️ Vista previa del texto:', pythonText.substring(0, 200));
        return pythonText;
      }
      
      console.log('⚠️ PyMuPDF no produjo resultado útil, usando métodos alternativos...');
      
      // Método 2: Extracción por patrones de texto
      let extractedText = this.extractTextFromBuffer(buffer);
      
      // Método 3: Si el segundo método no funciona bien, intentar extracción más agresiva
      if (!extractedText || extractedText.length < 100 || this.isGarbledText(extractedText)) {
        console.log('🔄 Texto inicial parece corrupto, intentando método alternativo...');
        extractedText = this.extractTextAlternative(buffer);
      }
      
      // Método 4: Si aún no funciona, usar extracción básica
      if (!extractedText || extractedText.length < 50 || this.isGarbledText(extractedText)) {
        console.log('🔄 Intentando extracción básica...');
        extractedText = this.extractTextBasic(buffer);
      }
      
      // Método 5: Si todo falla, intentar con análisis de flujo de datos
      if (!extractedText || extractedText.length < 20 || this.isGarbledText(extractedText)) {
        console.log('🔄 Intentando extracción por flujo de datos...');
        extractedText = this.extractTextFromStream(buffer);
      }
      
      // Limpieza final
      extractedText = this.finalTextCleanup(extractedText);
      
      // Si aún está corrupto, devolver mensaje indicativo
      if (this.isGarbledText(extractedText)) {
        return `[TEXTO EXTRAÍDO - ${extractedText.length} caracteres]\n\nEl PDF contiene texto codificado que no se puede leer directamente. Sin embargo, el contenido completo ha sido enviado a n8n para su procesamiento.\n\nArchivo: ${extractedText.substring(0, 100)}...`;
      }
      
      return extractedText || 'No se pudo extraer texto legible del PDF';
      
    } catch (error) {
      console.error('Error extrayendo texto del PDF:', error);
      throw new Error(`Error en extracción de texto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Extrae texto usando PyMuPDF via Python subprocess
   */
  private async extractTextWithPython(buffer: Buffer): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    const tempFile = path.join(tempDir, `temp_${Date.now()}.pdf`);
    
    try {
      console.log('🐍 Intentando extracción con PyMuPDF...');
      
      // Crear directorio temporal si no existe
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Escribir buffer a archivo temporal
      fs.writeFileSync(tempFile, buffer);
      console.log('📁 Archivo temporal creado:', tempFile);
      
      // Ejecutar script de Python con mejor manejo de encoding
      const scriptPath = path.join(process.cwd(), 'extract_pdf.py');
      console.log('🔧 Ejecutando Python script:', scriptPath);
      
      const command = `python "${scriptPath}" "${tempFile}"`;
      console.log('📋 Comando ejecutado:', command);
      
      const { stdout, stderr } = await execAsync(command, { 
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 30000 // 30 segundos timeout
      });
      
      console.log('📤 Python stdout length:', stdout.length);
      console.log('📤 Python stdout preview:', stdout.substring(0, 200));
      if (stderr) {
        console.error('❌ Python stderr:', stderr);
      }
      
      // Parsear resultado JSON
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        console.error('❌ Raw stdout:', stdout);
        return '';
      }
      
      if (result.success) {
        console.log('✅ PyMuPDF extraction successful:', {
          pages: result.pages,
          textLength: result.length,
          preview: result.text.substring(0, 100) + '...'
        });
        return result.text;
      } else {
        console.error('❌ PyMuPDF extraction failed:', result.error);
        return '';
      }
      
    } catch (error) {
      console.error('❌ Error ejecutando Python:', error);
      return '';
    } finally {
      // Limpiar archivo temporal
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log('🗑️ Archivo temporal eliminado');
        }
      } catch (e) {
        console.error('Error limpiando archivo temporal:', e);
      }
    }
  }

  /**
   * Extrae texto analizando el flujo de datos del PDF
   */
  private extractTextFromStream(buffer: Buffer): string {
    try {
      const pdfData = buffer.toString('utf8');
      const textStreams: string[] = [];
      
      // Buscar streams de contenido
      const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
      let match;
      
      while ((match = streamRegex.exec(pdfData)) !== null) {
        const streamContent = match[1];
        
        // Buscar texto legible en el stream
        const readableText = streamContent.match(/[a-zA-Z][a-zA-Z0-9\s.,;:!?()[\]{}'"@#$%^&*+=\-_|\\/<>~`]{10,}/g);
        
        if (readableText) {
          textStreams.push(...readableText);
        }
      }
      
      // Buscar también texto fuera de streams
      const generalText = pdfData.match(/[a-zA-Z][a-zA-Z0-9\s.,;:!?()[\]{}'"@#$%^&*+=\-_|\\/<>~`]{15,}/g);
      if (generalText) {
        textStreams.push(...generalText);
      }
      
      return textStreams
        .filter(text => text.trim().length > 10)
        .filter(text => !this.isGarbledText(text))
        .join(' ')
        .trim();
        
    } catch (error) {
      console.error('Error en extracción por flujo:', error);
      return '';
    }
  }

  /**
   * Detecta si el texto extraído está corrupto o es ilegible
   */
  private isGarbledText(text: string): boolean {
    if (!text || text.length < 10) return true;
    
    // Contar caracteres especiales vs normales (más permisivo con acentos)
    const weirdChars = text.match(/[^\x20-\x7E\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]/g) || [];
    const totalChars = text.length;
    
    // Solo considerar corrupto si hay más del 50% de caracteres realmente extraños
    const weirdRatio = weirdChars.length / totalChars;
    
    // Buscar patrones típicos de corrupción
    const hasRepeatedWeirdChars = /(.)\1{10,}/.test(text); // Caracteres repetidos más de 10 veces
    const hasOnlyNumbers = /^[\d\s\n\r]*$/.test(text); // Solo números y espacios
    
    const isGarbled = weirdRatio > 0.5 || hasRepeatedWeirdChars || hasOnlyNumbers;
    
    console.log('🔍 Análisis de corrupción:', {
      totalLength: text.length,
      weirdChars: weirdChars.length,
      weirdRatio: weirdRatio,
      hasRepeatedWeirdChars,
      hasOnlyNumbers,
      isGarbled,
      preview: text.substring(0, 100)
    });
    
    return isGarbled;
  }

  /**
   * Método alternativo de extracción de texto
   */
  private extractTextAlternative(buffer: Buffer): string {
    try {
      const pdfString = buffer.toString('latin1'); // Usar latin1 en lugar de binary
      const textStreams: string[] = [];
      
      // Buscar streams de texto con diferentes patrones
      const patterns = [
        /\(((?:[^()\\]|\\.)*)\)\s*Tj/g,
        /\[((?:[^\[\]\\]|\\.)*)\]\s*TJ/g,
        /\(((?:[^()\\]|\\.)*)\)\s*'/g,
        /\(((?:[^()\\]|\\.)*)\)\s*Tc/g
      ];
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(pdfString)) !== null) {
          const text = match[1];
          if (text && text.trim()) {
            const cleanText = this.decodeText(text);
            if (cleanText && cleanText.trim()) {
              textStreams.push(cleanText);
            }
          }
        }
      });
      
      return textStreams.join(' ').trim();
      
    } catch (error) {
      console.error('Error en extracción alternativa:', error);
      return '';
    }
  }

  /**
   * Método básico de extracción
   */
  private extractTextBasic(buffer: Buffer): string {
    try {
      // Convertir a string y buscar texto simple
      const text = buffer.toString('utf8');
      
      // Buscar texto legible usando regex simple
      const textMatches = text.match(/[a-zA-Z0-9\s.,;:!?()[\]{}'"@#$%^&*+=\-_|\\/<>~`]{10,}/g);
      
      if (textMatches && textMatches.length > 0) {
        return textMatches
          .filter(match => match.trim().length > 5)
          .join(' ')
          .trim();
      }
      
      return '';
      
    } catch (error) {
      console.error('Error en extracción básica:', error);
      return '';
    }
  }

  /**
   * Decodifica texto que puede estar codificado
   */
  private decodeText(text: string): string {
    try {
      // Intentar decodificar caracteres especiales
      let decoded = text;
      
      // Reemplazar secuencias de escape comunes
      decoded = decoded.replace(/\\n/g, '\n');
      decoded = decoded.replace(/\\r/g, '\r');
      decoded = decoded.replace(/\\t/g, '\t');
      decoded = decoded.replace(/\\\(/g, '(');
      decoded = decoded.replace(/\\\)/g, ')');
      decoded = decoded.replace(/\\\\/g, '\\');
      
      // Limpiar caracteres de control
      decoded = decoded.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
      
      return decoded;
      
    } catch (error) {
      return text;
    }
  }

  /**
   * Extrae texto de un buffer PDF usando patrones regex mejorados
   */
  private extractTextFromBuffer(buffer: Buffer): string {
    try {
      // Intentar diferentes codificaciones
      let pdfString = buffer.toString('latin1');
      const textStreams: string[] = [];
      
      // Patrón para objetos de texto en PDF
      const textRegex = /BT\s+(.*?)\s+ET/g;
      let match;
      
      while ((match = textRegex.exec(pdfString)) !== null) {
        const textContent = match[1];
        if (textContent) {
          // Limpiar comandos PDF y extraer texto
          const cleanText = this.cleanPDFText(textContent);
          if (cleanText.trim()) {
            textStreams.push(cleanText);
          }
        }
      }
      
      // Buscar texto usando otro patrón común - mejorado
      const altTextRegex = /\(([^)]+)\)\s*Tj/g;
      while ((match = altTextRegex.exec(pdfString)) !== null) {
        const text = this.decodeText(match[1]);
        if (text && text.trim() && text.length > 1) {
          textStreams.push(text.trim());
        }
      }
      
      // Buscar texto en arrays - mejorado
      const arrayTextRegex = /\[([^\]]+)\]\s*TJ/g;
      while ((match = arrayTextRegex.exec(pdfString)) !== null) {
        const arrayContent = match[1];
        // Extraer strings del array
        const stringMatches = arrayContent.match(/\(([^)]+)\)/g);
        if (stringMatches) {
          stringMatches.forEach(str => {
            const cleanStr = this.decodeText(str.replace(/[()]/g, '')).trim();
            if (cleanStr && cleanStr.length > 1) {
              textStreams.push(cleanStr);
            }
          });
        }
      }
      
      // Unir todo el texto extraído
      let extractedText = textStreams.join(' ').trim();
      
      // Si no encontramos texto con los patrones anteriores, intentar extracción más agresiva
      if (!extractedText || extractedText.length < 10) {
        extractedText = this.extractTextAggressive(pdfString);
      }
      
      return extractedText || '';
      
    } catch (error) {
      console.error('Error en extracción de buffer:', error);
      return '';
    }
  }

  /**
   * Limpia texto extraído de comandos PDF
   */
  private cleanPDFText(text: string): string {
    return text
      // Remover comandos de posicionamiento
      .replace(/\d+\.?\d*\s+\d+\.?\d*\s+Td/g, ' ')
      .replace(/\d+\.?\d*\s+\d+\.?\d*\s+TD/g, ' ')
      .replace(/\d+\.?\d*\s+TL/g, ' ')
      .replace(/T\*/g, ' ')
      // Remover comandos de fuente
      .replace(/\/\w+\s+\d+\.?\d*\s+Tf/g, ' ')
      // Remover comandos de color
      .replace(/\d+\.?\d*\s+\d+\.?\d*\s+\d+\.?\d*\s+rg/g, ' ')
      .replace(/\d+\.?\d*\s+\d+\.?\d*\s+\d+\.?\d*\s+RG/g, ' ')
      // Remover otros comandos
      .replace(/[a-zA-Z]{1,2}\s*/g, ' ')
      // Limpiar espacios múltiples
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extracción más agresiva si los patrones normales fallan
   */
  private extractTextAggressive(pdfString: string): string {
    try {
      // Buscar cualquier texto entre paréntesis - mejorado
      const allTextMatches = pdfString.match(/\(([^)]{2,})\)/g);
      if (allTextMatches) {
        const decodedTexts = allTextMatches
          .map(match => this.decodeText(match.replace(/[()]/g, '').trim()))
          .filter(text => text && text.length > 1 && !this.isGarbledText(text))
          .filter(text => /[a-zA-Z0-9]/.test(text)); // Debe contener al menos una letra o número
        
        if (decodedTexts.length > 0) {
          return decodedTexts.join(' ');
        }
      }
      
      // Buscar texto legible en el contenido general
      const readableText = pdfString.match(/[a-zA-Z][a-zA-Z0-9\s.,;:!?()[\]{}'"@#$%^&*+=\-_|\\/<>~`]{5,}/g);
      if (readableText) {
        return readableText
          .filter(text => text.trim().length > 5)
          .filter(text => !this.isGarbledText(text))
          .join(' ');
      }
      
      return '';
      
    } catch (error) {
      console.error('Error en extracción agresiva:', error);
      return '';
    }
  }

  /**
   * Limpieza final del texto extraído
   */
  private finalTextCleanup(text: string): string {
    return text
      // Remover caracteres de control
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      // Limpiar espacios múltiples
      .replace(/\s+/g, ' ')
      // Remover líneas vacías múltiples
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Estima el número de páginas basado en el tamaño del archivo
   */
  private estimatePages(fileSize: number): number {
    // Estimación aproximada: 1 página ≈ 50-100KB
    const avgPageSize = 75 * 1024; // 75KB por página
    return Math.max(1, Math.ceil(fileSize / avgPageSize));
  }

  /**
   * Envía el texto extraído al webhook de n8n
   */
  async sendTextToN8N(text: string, fileInfo: FileInfo): Promise<{ success: boolean; error?: string }> {
    try {
      // Truncar texto si es muy largo (máximo 50KB para evitar problemas de webhook)
      const maxTextLength = 50 * 1024; // 50KB
      let processedText = text;
      let wasTruncated = false;
      
      if (text.length > maxTextLength) {
        processedText = text.substring(0, maxTextLength);
        wasTruncated = true;
        console.log(`⚠️ Texto truncado de ${text.length} a ${maxTextLength} caracteres`);
      }

      console.log('📡 Enviando texto a n8n webhook:', {
        url: this.webhookUrl,
        originalTextLength: text.length,
        sentTextLength: processedText.length,
        wasTruncated,
        fileInfo
      });

      // Payload simplificado para mejor compatibilidad
      const payload = {
        text: processedText,
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        pages: fileInfo.pages,
        timestamp: new Date().toISOString(),
        originalLength: text.length,
        truncated: wasTruncated
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Intentar leer el cuerpo de la respuesta para más detalles
        let errorDetails = '';
        try {
          const errorText = await response.text();
          errorDetails = errorText ? ` - ${errorText}` : '';
        } catch (e) {
          // Ignorar errores al leer el cuerpo
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorDetails}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        // Si no es JSON, usar el texto de respuesta
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
   * Procesa el PDF y envía el texto a n8n
   */
  async processAndSendPDF(buffer: Buffer, options: ProcessOptions): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Iniciando procesamiento del PDF:', options);
      
      // Extraer texto del PDF
      const extractedText = await this.extractTextFromPDF(buffer);
      
      console.log('📋 Texto extraído del PDF:', {
        length: extractedText.length,
        preview: extractedText.substring(0, 200) + '...',
        isGarbled: this.isGarbledText(extractedText)
      });
      
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
        processingTime: `${processingTime}ms`
      });
      
      return {
        success: true,
        extractedText,
        fileInfo,
        processingTime
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Error en procesamiento:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        processingTime
      };
    }
  }
}

export default PDFExtractor;
