import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutofoco]'
})
export class Autofoco implements AfterViewInit {

  constructor(private el: ElementRef) {}
  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }

}
