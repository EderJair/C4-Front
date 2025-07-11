import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
}

export function WelcomeEngineerEmailTemplate({ 
  firstName, 
  lastName, 
  email, 
  password, 
  companyName 
}: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#3B82F6', 
        color: 'white', 
        padding: '30px 20px', 
        borderRadius: '8px 8px 0 0',
        textAlign: 'center' 
      }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold' }}>
          ¡Bienvenido a C4 Construction!
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: '16px', opacity: '0.9' }}>
          Tu cuenta de ingeniero ha sido creada exitosamente
        </p>
      </div>

      {/* Body */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '40px 30px',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ fontSize: '18px', color: '#1F2937', marginBottom: '20px' }}>
          Hola <strong>{firstName} {lastName}</strong>,
        </p>

        <p style={{ fontSize: '16px', color: '#4B5563', lineHeight: '1.6', marginBottom: '25px' }}>
          Te damos la bienvenida al sistema de gestión de proyectos de{' '}
          <strong>{companyName || 'C4 Construction'}</strong>. Tu cuenta ha sido creada y ya puedes acceder 
          a la plataforma para gestionar tus proyectos.
        </p>

        {/* Credentials Box */}
        <div style={{ 
          backgroundColor: '#F3F4F6', 
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '16px', 
            fontWeight: 'bold',
            marginBottom: '15px',
            marginTop: '0'
          }}>
            Tus credenciales de acceso:
          </h3>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 'bold' }}>Email:</span><br />
            <span style={{ color: '#1F2937', fontSize: '16px' }}>{email}</span>
          </div>
          <div>
            <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 'bold' }}>Contraseña temporal:</span><br />
            <span style={{ 
              color: '#1F2937', 
              fontSize: '16px',
              backgroundColor: '#FEF3C7',
              padding: '4px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              {password}
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{ 
          backgroundColor: '#FEF3C7', 
          border: '1px solid #F59E0B',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '25px'
        }}>
          <p style={{ 
            color: '#92400E', 
            fontSize: '14px', 
            margin: '0',
            fontWeight: 'bold'
          }}>
            🔒 Importante: Por tu seguridad, te recomendamos cambiar tu contraseña en el primer inicio de sesión.
          </p>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#1F2937', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
            Con tu cuenta podrás:
          </h3>
          <ul style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Ver y gestionar tus proyectos asignados</li>
            <li style={{ marginBottom: '8px' }}>Actualizar el estado de tus proyectos</li>
            <li style={{ marginBottom: '8px' }}>Comunicarte con el equipo administrativo</li>
            <li style={{ marginBottom: '8px' }}>Acceder a información detallada de cada proyecto</li>
          </ul>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <a 
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-block'
            }}
          >
            Iniciar Sesión
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginBottom: '20px' }}>
          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
        </p>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: '#9CA3AF',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0' }}>
          © 2025 C4 Construction. Todos los derechos reservados.
        </p>
        <p style={{ margin: '5px 0 0' }}>
          Este es un email automático, por favor no responder.
        </p>
      </div>
    </div>
  );
}
