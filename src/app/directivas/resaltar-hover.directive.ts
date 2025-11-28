import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appResaltarHover]',
  standalone: true
})
export class ResaltarHoverDirective {

  @Input() appResaltarHover: string = '#1976d2'; // Color por defecto azul
  private colorOriginal: string = '';

  constructor(private el: ElementRef) {
    this.colorOriginal = this.el.nativeElement.style.backgroundColor || '';
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.cambiarColor(this.appResaltarHover);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.cambiarColor(this.colorOriginal);
  }

  private cambiarColor(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
    this.el.nativeElement.style.transition = 'background-color 0.3s ease';
    if (color === this.appResaltarHover) {
      this.el.nativeElement.style.transform = 'scale(1.02)';
      this.el.nativeElement.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
    } else {
      this.el.nativeElement.style.transform = 'scale(1)';
      this.el.nativeElement.style.boxShadow = 'none';
    }
  }
}