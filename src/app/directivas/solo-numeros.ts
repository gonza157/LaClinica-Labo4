import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appSoloNumeros]'
})
export class SoloNumeros {

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

}
