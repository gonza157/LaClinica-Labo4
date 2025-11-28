import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dniFormat',
  standalone: true
})
export class DniFormatPipe implements PipeTransform {

  transform(value: string | number): string {
    const str = value ? value.toString() : '';
    return str.replace(/(\d{2,3})(\d{3})(\d{3})/, '$1.$2.$3');
  }

}
