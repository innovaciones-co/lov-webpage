import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datetime'
})
export class DatetimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = this.pad2(date.getMonth() + 1);
    const day = this.pad2(date.getDate());
    const hour = this.pad2(date.getHours());
    const minute = this.pad2(date.getMinutes());
    const second = this.pad2(date.getSeconds());

    return `${year}-${month}-${day} ${hour}.${minute}:${second}`;
  }

  private pad2(value: number): string {
    return String(value).padStart(2, '0');
  }
}
