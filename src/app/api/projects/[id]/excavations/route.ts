import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para obtener excavaciones de un proyecto específico
 * GET /api/projects/{id}/excavations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    console.log(`📋 Obteniendo excavaciones del proyecto ${id}`);

    // Obtener del backend
    const backendResponse = await fetch(`http://localhost:3001/api/projects/${id}/excavations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!backendResponse.ok) {
      let errorMessage = 'Error en el servidor backend';
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${backendResponse.status}: ${backendResponse.statusText}`;
      }
      
      console.error('❌ Error del backend:', errorMessage);
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage 
        },
        { status: backendResponse.status }
      );
    }

    // Obtener respuesta del backend
    const backendData = await backendResponse.json();
    
    console.log('✅ Excavaciones obtenidas exitosamente:', {
      projectId: id,
      count: Array.isArray(backendData) ? backendData.length : 'N/A'
    });

    // Retornar respuesta exitosa
    return NextResponse.json(backendData, { status: 200 });

  } catch (error) {
    console.error('❌ Error obteniendo excavaciones:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
