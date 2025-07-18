import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para registrar excavaciones de forma tradicional
 * POST /api/excavation - Crear excavación
 * PATCH /api/excavation/{id} - Actualizar excavación  
 * DELETE /api/excavation/{id} - Eliminar excavación
 */
export async function POST(request: NextRequest) {
  try {
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

    console.log('📋 Datos de excavación recibidos:', excavationData);

    // Validar datos obligatorios
    const requiredFields = ['projectPhaseId', 'excavationDepth', 'excavationArea', 'excavationVolume', 'soilType'];
    const missingFields = requiredFields.filter(field => !excavationData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Campos obligatorios faltantes: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Preparar payload para el backend
    const payload = {
      projectPhaseId: excavationData.projectPhaseId,
      excavationDepth: parseFloat(excavationData.excavationDepth),
      excavationArea: parseFloat(excavationData.excavationArea),
      excavationVolume: parseFloat(excavationData.excavationVolume),
      soilType: excavationData.soilType,
      equipment: excavationData.equipment || [],
      laborHours: parseFloat(excavationData.laborHours || '0'),
      materialCost: parseFloat(excavationData.materialCost || '0'),
      equipmentCost: parseFloat(excavationData.equipmentCost || '0'),
      laborCost: parseFloat(excavationData.laborCost || '0')
    };

    console.log('📤 Enviando datos al backend:', payload);

    // Enviar al backend
    const backendResponse = await fetch('http://localhost:3001/api/excavation', {
      method: 'POST',
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
    
    console.log('✅ Respuesta exitosa del backend:', backendData);

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Excavación registrada exitosamente',
      data: backendData
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error procesando registro de excavación:', error);
    
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
