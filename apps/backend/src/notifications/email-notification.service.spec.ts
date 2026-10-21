import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailNotificationService } from './email-notification.service';

describe('EmailNotificationService', () => {
  let service: EmailNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailNotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
      ],
    }).compile();

    service = module.get<EmailNotificationService>(EmailNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('debe registrar y retornar true al enviar un correo simulado', async () => {
      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Reserva Confirmada',
        html: '<p>Hola</p>',
      });

      expect(result).toBe(true);
    });
  });

  describe('generateBookingConfirmationHtml', () => {
    it('debe generar la plantilla HTML con los datos de la reserva', () => {
      const html = service.generateBookingConfirmationHtml({
        userName: 'Carlos',
        courtName: 'Pista Central',
        sportName: 'Padel',
        date: '2026-10-25',
        time: '10:00 - 11:30',
        price: '24.00 €',
      });

      expect(html).toContain('Carlos');
      expect(html).toContain('Pista Central');
      expect(html).toContain('Padel');
      expect(html).toContain('2026-10-25');
      expect(html).toContain('10:00 - 11:30');
      expect(html).toContain('24.00 €');
    });
  });
});
