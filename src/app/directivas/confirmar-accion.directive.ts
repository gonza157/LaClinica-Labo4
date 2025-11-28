import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appConfirmarAccion]',
  standalone: true
})
export class ConfirmarAccionDirective {

  @Input() appConfirmarAccion: string = '¿Está seguro de realizar esta acción?';
  @Input() confirmarTitulo: string = 'Confirmar';
  @Output() accionConfirmada = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  @HostListener('click', ['$event']) onClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const confirmacion = confirm(`${this.confirmarTitulo}\n\n${this.appConfirmarAccion}`);
    
    if (confirmacion) {
      this.accionConfirmada.emit();
    }
  }
}