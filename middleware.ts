// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Configuración especial para endpoints de subida de archivos
  if (request.nextUrl.pathname.startsWith('/api/excavation/process-pdf')) {
    // Aumentar el límite de tiempo para procesamiento de archivos
    const response = NextResponse.next();
    response.headers.set('x-middleware-rewrite', request.nextUrl.pathname);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/excavation/process-pdf/:path*',
};
