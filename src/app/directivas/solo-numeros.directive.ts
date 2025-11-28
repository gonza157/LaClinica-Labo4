import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appSoloNumeros]',
  standalone: true
})
export class SoloNumerosDirective {

  @Input() permitirDecimales: boolean = false;
  @Input() longitudMaxima: number = 0;

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Permitir teclas de control (backspace, delete, arrow keys, etc.)
    const teclasControl = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Clear',
      'Copy', 'Paste'
    ];
    
    if (teclasControl.includes(event.key)) {
      return;
    }

    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key)) {
      return;
    }

    // Verificar si es un número
    if (!/[0-9]/.test(event.key)) {
      // Si permite decimales, permitir punto y coma
      if (this.permitirDecimales && ['.' , ','].includes(event.key)) {
        // Solo permitir un punto/coma decimal
        const valorActual = this.el.nativeElement.value;
        if (valorActual.includes('.') || valorActual.includes(',')) {
          event.preventDefault();
          return;
        }
      } else {
        event.preventDefault();
        return;
      }
    }

    // Verificar longitud máxima
    if (this.longitudMaxima > 0) {
      const valorActual = this.el.nativeElement.value;
      const nuevaLongitud = valorActual.length + 1;
      
      // No contar el punto decimal en la longitud máxima
      const longitudSinPunto = valorActual.replace(/[.,]/g, '').length + 1;
      
      if (longitudSinPunto > this.longitudMaxima) {
        event.preventDefault();
        return;
      }
    }
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const datosPegados = event.clipboardData?.getData('text');
    
    if (datosPegados) {
      let valorLimpio = datosPegados.replace(/[^0-9.,]/g, '');
      
      if (!this.permitirDecimales) {
        valorLimpio = valorLimpio.replace(/[.,]/g, '');
      } else {
        // Solo permitir un punto decimal
        const puntos = valorLimpio.match(/[.,]/g);
        if (puntos && puntos.length > 1) {
          const primerPunto = valorLimpio.indexOf('.');
          const primerComa = valorLimpio.indexOf(',');
          const primerDecimal = primerPunto !== -1 && primerComa !== -1 
            ? Math.min(primerPunto, primerComa)
            : Math.max(primerPunto, primerComa);
          
          valorLimpio = valorLimpio.substring(0, primerDecimal + 1) + 
                       valorLimpio.substring(primerDecimal + 1).replace(/[.,]/g, '');
        }
      }
      
      // Aplicar longitud máxima
      if (this.longitudMaxima > 0) {
        const valorSinPunto = valorLimpio.replace(/[.,]/g, '');
        if (valorSinPunto.length > this.longitudMaxima) {
          valorLimpio = valorLimpio.substring(0, this.longitudMaxima + (this.permitirDecimales ? 1 : 0));
        }
      }
      
      this.el.nativeElement.value = valorLimpio;
      
      // Disparar evento input para que Angular detecte el cambio
      const evento = new Event('input', { bubbles: true });
      this.el.nativeElement.dispatchEvent(evento);
    }
  }
}