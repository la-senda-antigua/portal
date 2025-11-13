import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayToString'
})
export class ArrayToStringPipe implements PipeTransform {
  transform(value: any[], property?: string): string {
    if (!value || !Array.isArray(value)) return '';

    // array of strings
    if (typeof value[0] === 'string') {
      return value.join(', ');
    }

    // object array and has displayProperty
    if (property && typeof value[0] === 'object') {
      return value.map(item => item[property]).filter(item => item).join(', ');
    }

    // object array and has no displayProperty
    if (typeof value[0] === 'object') {
      const prop = property || 'Name';
      return value.map(item => item[ prop ]).filter(item => item !== undefined && item !== null).join(', ');
    }

    return value.join(', ');
  }
}
