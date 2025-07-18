declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    text: string;
    version: string;
  }

  function pdf(buffer: Buffer): Promise<PDFData>;
  export = pdf;
}
