import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { PageHeaderComponent } from './page-header.component';

@Component({
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <spt-page-header title="Título Host">
      <div filters id="test-filters">Filtros contextuales</div>
      <div actions id="test-actions">
        <button id="test-btn">Acción</button>
      </div>
      <span id="test-default">Contenido por defecto</span>
    </spt-page-header>
  `,
})
class TestHostComponent {}

describe('PageHeaderComponent', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;
  let component: PageHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, TestHostComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Título de Prueba');
    fixture.detectChanges();
  });

  it('debe renderizar correctamente el título principal', () => {
    const titleEl = fixture.debugElement.query(By.css('.page-title'));
    expect(titleEl).toBeTruthy();
    expect(titleEl.nativeElement.textContent.trim()).toBe('Título de Prueba');
  });

  it('debe renderizar el subtítulo solo si está definido', () => {
    expect(fixture.debugElement.query(By.css('.page-subtitle'))).toBeNull();

    fixture.componentRef.setInput('subtitle', 'Subtítulo descriptivo de prueba');
    fixture.detectChanges();

    const subtitleEl = fixture.debugElement.query(By.css('.page-subtitle'));
    expect(subtitleEl).toBeTruthy();
    expect(subtitleEl.nativeElement.textContent.trim()).toBe('Subtítulo descriptivo de prueba');
  });

  it('debe renderizar el icono opcional si se proporciona', () => {
    expect(fixture.debugElement.query(By.css('.header-icon'))).toBeNull();

    fixture.componentRef.setInput('icon', 'pi pi-history');
    fixture.detectChanges();

    const iconEl = fixture.debugElement.query(By.css('.header-icon'));
    expect(iconEl).toBeTruthy();
    expect(iconEl.nativeElement.className).toContain('pi pi-history');
  });

  it('debe renderizar el enlace de retorno si backUrl está configurado', () => {
    expect(fixture.debugElement.query(By.css('.back-link'))).toBeNull();

    fixture.componentRef.setInput('backUrl', '/admin/facilities');
    fixture.componentRef.setInput('backLabel', 'Volver a Pistas');
    fixture.detectChanges();

    const backLinkEl = fixture.debugElement.query(By.css('.back-link'));
    expect(backLinkEl).toBeTruthy();
    expect(backLinkEl.nativeElement.textContent).toContain('Volver a Pistas');
  });

  it('debe renderizar el badge contextual con la severidad configurada', () => {
    expect(fixture.debugElement.query(By.css('.header-badge'))).toBeNull();

    fixture.componentRef.setInput('badgeText', 'Pista 1 Central');
    fixture.componentRef.setInput('badgeSeverity', 'success');
    fixture.detectChanges();

    const tagEl = fixture.debugElement.query(By.css('.header-badge'));
    expect(tagEl).toBeTruthy();
    expect(tagEl.nativeElement.textContent).toContain('Pista 1 Central');
  });

  it('debe proyectar correctamente los slots de acciones, filtros y default', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const filtersEl = hostFixture.debugElement.query(By.css('#test-filters'));
    const actionsEl = hostFixture.debugElement.query(By.css('#test-actions'));
    const defaultEl = hostFixture.debugElement.query(By.css('#test-default'));

    expect(filtersEl).toBeTruthy();
    expect(actionsEl).toBeTruthy();
    expect(defaultEl).toBeTruthy();
  });
});
