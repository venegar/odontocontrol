import { formatearFechaEspanol, generarEnlacesAccionCita } from './utils';

interface ParametrosPlantillaEmail {
  pacienteNombre: string;
  doctorNombre: string;
  tratamiento: string;
  fechaCita: string;
  horaCita: string;
  citaId: string;
  clinicaNombre: string;
  clinicaDireccion: string;
  clinicaTelefono: string;
}

/**
 * Genera el HTML y el texto plano para el correo electrónico de recordatorio de cita.
 * Diseñado con compatibilidad universal para clientes de correo (Gmail, Outlook, Apple Mail).
 */
export function generarPlantillaEmailHtml(params: ParametrosPlantillaEmail): {
  asunto: string;
  html: string;
  textoPlano: string;
} {
  const {
    pacienteNombre,
    doctorNombre,
    tratamiento,
    fechaCita,
    horaCita,
    citaId,
    clinicaNombre,
    clinicaDireccion,
    clinicaTelefono,
  } = params;

  const enlaces = generarEnlacesAccionCita(citaId, 'https://odontocontrol-ashen.vercel.app', 'email');
  const fechaLegible = formatearFechaEspanol(fechaCita);
  const asunto = `Recordatorio de Cita Odontológica: ${fechaLegible} a las ${horaCita} - ${clinicaNombre}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${asunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Encabezado con Identidad Clínica -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f766e 0%, #0369a1 100%); padding: 32px 30px; text-align: center;">
              <span style="display: inline-block; font-size: 28px; margin-bottom: 8px;">🦷</span>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                ${clinicaNombre}
              </h1>
              <p style="margin: 6px 0 0; color: #ccfbf1; font-size: 13px; font-weight: 500;">
                Atención Odontológica Especializada
              </p>
            </td>
          </tr>

          <!-- Cuerpo del Mensaje -->
          <tr>
            <td style="padding: 35px 30px 25px;">
              <h2 style="margin: 0 0 14px; font-size: 19px; color: #0f172a; font-weight: 700;">
                Hola, ${pacienteNombre} 👋
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
                Te recordamos que tienes una cita odontológica programada en nuestras instalaciones. A continuación encuentras los detalles de tu consulta:
              </p>

              <!-- Tarjeta de Detalles de Cita -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 120px;">
                    <strong>Tratamiento:</strong>
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                    ${tratamiento}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">
                    <strong>Profesional:</strong>
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                    ${doctorNombre}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">
                    <strong>Fecha:</strong>
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f766e; font-weight: 700;">
                    ${fechaLegible}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">
                    <strong>Hora:</strong>
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f766e; font-weight: 700;">
                    ${horaCita}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">
                    <strong>Sede / Dirección:</strong>
                  </td>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155;">
                    ${clinicaDireccion}
                  </td>
                </tr>
              </table>

              <!-- Opciones de Autogestión -->
              <div style="text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 16px; font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
                  Autogestiona tu cita en 1 clic
                </p>

                <!-- Botón Confirmar (Verde) -->
                <a href="${enlaces.confirmar}" target="_blank" style="display: block; width: 100%; max-width: 320px; margin: 0 auto 10px; background-color: #059669; color: #ffffff; text-decoration: none; padding: 13px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; text-align: center; box-sizing: border-box;">
                  ✅ Confirmar Asistencia
                </a>

                <!-- Botón Reagendar (Azul) -->
                <a href="${enlaces.reagendar}" target="_blank" style="display: block; width: 100%; max-width: 320px; margin: 0 auto 10px; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; text-align: center; box-sizing: border-box;">
                  🔄 Solicitar Reagendamiento
                </a>

                <!-- Botón Cancelar (Outline rojo) -->
                <a href="${enlaces.cancelar}" target="_blank" style="display: block; width: 100%; max-width: 320px; margin: 0 auto; background-color: #ffffff; color: #dc2626; border: 1px solid #fca5a5; text-decoration: none; padding: 10px 20px; border-radius: 12px; font-size: 12px; font-weight: 600; text-align: center; box-sizing: border-box;">
                  ❌ Cancelar Cita
                </a>
              </div>

              <p style="margin: 20px 0 0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                Si presentas alguna inquietud o requieres asistencia inmediata, puedes comunicarte a nuestra línea telefónica o WhatsApp al <strong>${clinicaTelefono}</strong>.
              </p>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0 0 4px;">
                Este mensaje fue enviado de manera automática por el sistema <strong>OdontoControl</strong> para <strong>${clinicaNombre}</strong>.
              </p>
              <p style="margin: 0;">
                Por favor, no respondas directamente a este correo si es una dirección desatendida.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <!-- Píxel de seguimiento de apertura de correo electrónico -->
  <img src="https://odontocontrol-ashen.vercel.app/api/recordatorios/tracking?citaId=${encodeURIComponent(citaId)}&canal=email" width="1" height="1" alt="" style="display:none; width:1px; height:1px; border:0;" />
</body>
</html>
  `.trim();

  const textoPlano = `
Hola ${pacienteNombre},

Te recordamos tu cita odontológica programada en ${clinicaNombre}:

• Tratamiento: ${tratamiento}
• Especialista: ${doctorNombre}
• Fecha: ${fechaLegible}
• Hora: ${horaCita}
• Dirección: ${clinicaDireccion}

Opciones de autogestión directa de tu cita:
✅ Confirmar Asistencia: ${enlaces.confirmar}
🔄 Solicitar Reagendamiento: ${enlaces.reagendar}
❌ Cancelar Cita: ${enlaces.cancelar}

Teléfono de atención: ${clinicaTelefono}

Atentamente,
Equipo de ${clinicaNombre}
  `.trim();

  return { asunto, html, textoPlano };
}
