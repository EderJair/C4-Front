import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para asignar un ingeniero a un proyecto específico
 * PUT /api/projects/[id]/assign-engineer/[engineerId]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; engineerId: string } }
) {
  try {
    const { id: projectId, engineerId } = params;
    
    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    console.log(`👨‍💼 Asignando ingeniero ${engineerId} al proyecto ${projectId}`);

    // Asignar en el backend
    const backendResponse = await fetch(`http://localhost:3001/api/projects/${projectId}/assign-engineer/${engineerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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
    
    console.log('✅ Ingeniero asignado al proyecto exitosamente:', {
      projectId,
      engineerId,
      result: backendData
    });

    // Retornar respuesta exitosa
    return NextResponse.json(backendData, { status: 200 });

  } catch (error) {
    console.error('❌ Error asignando ingeniero al proyecto:', error);
    
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
