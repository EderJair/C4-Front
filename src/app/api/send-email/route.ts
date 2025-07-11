import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { WelcomeEngineerEmailTemplate } from '@/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, companyName } = body;

    // Validar que tenemos todos los datos necesarios
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que tenemos la API key de Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración de email no disponible' },
        { status: 500 }
      );
    }

    // Enviar el email
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'C4 Construction <noreply@c4construction.com>',
      to: [email],
      subject: `¡Bienvenido a C4 Construction, ${firstName}!`,
      react: WelcomeEngineerEmailTemplate({
        firstName,
        lastName,
        email,
        password,
        companyName
      }),
    });

    if (error) {
      console.error('Error enviando email:', error);
      return NextResponse.json(
        { error: 'Error enviando email', details: error },
        { status: 500 }
      );
    }

    console.log('Email enviado exitosamente:', data);
    return NextResponse.json(
      { message: 'Email enviado exitosamente', data },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en la API de envío de email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
