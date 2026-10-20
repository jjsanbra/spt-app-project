import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let confirmationServiceSpy: any;
  let translateServiceSpy: any;

  beforeEach(() => {
    confirmationServiceSpy = {
      confirm: vi.fn(),
      close: vi.fn(),
    };

    translateServiceSpy = {
      instant: vi.fn().mockImplementation((key: string) => `translated:${key}`),
    };

    TestBed.configureTestingModule({
      providers: [
        ConfirmDialogService,
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });

    service = TestBed.inject(ConfirmDialogService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe configurar confirmación de borrado con severity danger e icono de advertencia', () => {
    const onAcceptSpy = vi.fn();
    service.confirmDelete({
      headerKey: 'FACILITY.DELETE_TITLE',
      messageKey: 'FACILITY.DELETE_MSG',
      onAccept: onAcceptSpy,
    });

    expect(confirmationServiceSpy.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'translated:FACILITY.DELETE_TITLE',
        message: 'translated:FACILITY.DELETE_MSG',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonProps: { severity: 'danger' },
        rejectButtonProps: { severity: 'secondary', text: true },
      }),
    );

    // Simular que el usuario acepta
    const callArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
    callArgs.accept();
    expect(onAcceptSpy).toHaveBeenCalled();
  });

  it('debe configurar confirmación genérica interactiva', () => {
    const onAcceptSpy = vi.fn();
    const onRejectSpy = vi.fn();

    service.confirm({
      messageKey: 'COMMON.ARE_YOU_SURE',
      onAccept: onAcceptSpy,
      onReject: onRejectSpy,
    });

    expect(confirmationServiceSpy.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'translated:COMMON.CONFIRM_TITLE',
        message: 'translated:COMMON.ARE_YOU_SURE',
        acceptButtonProps: { severity: 'primary' },
      }),
    );

    const callArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
    callArgs.reject();
    expect(onRejectSpy).toHaveBeenCalled();
  });

  it('debe invocar close() en confirmationService al llamar close()', () => {
    service.close();
    expect(confirmationServiceSpy.close).toHaveBeenCalled();
  });
});
