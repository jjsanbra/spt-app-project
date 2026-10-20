import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Envía un correo transaccional asíncrono
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.logger.log(`[Email Transaccional] Destinatario: ${options.to} | Asunto: "${options.subject}"`);
      // Simulación de envío lista para conectar con Resend / Nodemailer SMTP
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email a ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Genera plantilla HTML para confirmación de reserva
   */
  generateBookingConfirmationHtml(params: {
    userName: string;
    courtName: string;
    sportName: string;
    date: string;
    time: string;
    price: string;
  }): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 32px; border-radius: 12px; max-width: 580px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #10b981; margin-top: 0;">¡Tu reserva está confirmada!</h2>
        <p>Hola <strong>${params.userName}</strong>,</p>
        <p>Tu pista ha quedado reservada con éxito. Aquí tienes el detalle de tu partido:</p>
        <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #334155;">
          <p style="margin: 6px 0;"><strong>Pista:</strong> ${params.courtName} (${params.sportName})</p>
          <p style="margin: 6px 0;"><strong>Fecha:</strong> ${params.date}</p>
          <p style="margin: 6px 0;"><strong>Horario:</strong> ${params.time}</p>
          <p style="margin: 6px 0;"><strong>Importe:</strong> ${params.price}</p>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Modalidad de pago: Presencial en la recepción del centro deportivo antes de entrar a pista.</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">SPT App — Plataforma de Gestión Deportiva</p>
      </div>
    `;
  }
}
