import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para actualizar y eliminar excavaciones por ID
 * PATCH /api/excavation/{id} - Actualizar excavación
 * DELETE /api/excavation/{id} - Eliminar excavación
 */

export async function PATCH(
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

    // Obtener los datos del formulario
    const excavationData = await request.json();

    console.log(`📋 Actualizando excavación ${id}:`, excavationData);

    // Preparar payload para el backend
    const payload = {
      ...(excavationData.projectPhaseId && { projectPhaseId: excavationData.projectPhaseId }),
      ...(excavationData.excavationDepth && { excavationDepth: parseFloat(excavationData.excavationDepth) }),
      ...(excavationData.excavationArea && { excavationArea: parseFloat(excavationData.excavationArea) }),
      ...(excavationData.excavationVolume && { excavationVolume: parseFloat(excavationData.excavationVolume) }),
      ...(excavationData.soilType && { soilType: excavationData.soilType }),
      ...(excavationData.equipment && { equipment: excavationData.equipment }),
      ...(excavationData.laborHours && { laborHours: parseFloat(excavationData.laborHours) }),
      ...(excavationData.materialCost && { materialCost: parseFloat(excavationData.materialCost) }),
      ...(excavationData.equipmentCost && { equipmentCost: parseFloat(excavationData.equipmentCost) }),
      ...(excavationData.laborCost && { laborCost: parseFloat(excavationData.laborCost) })
    };

    console.log('📤 Enviando actualización al backend:', payload);

    // Enviar al backend
    const backendResponse = await fetch(`http://localhost:3001/api/excavation/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
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
    
    console.log('✅ Excavación actualizada exitosamente:', backendData);

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Excavación actualizada exitosamente',
      data: backendData
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error actualizando excavación:', error);
    
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

export async function DELETE(
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

    console.log(`🗑️ Eliminando excavación ${id}`);

    // Enviar al backend
    const backendResponse = await fetch(`http://localhost:3001/api/excavation/${id}`, {
      method: 'DELETE',
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

    console.log('✅ Excavación eliminada exitosamente');

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Excavación eliminada exitosamente'
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error eliminando excavación:', error);
    
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
