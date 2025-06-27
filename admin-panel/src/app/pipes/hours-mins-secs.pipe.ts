import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hoursMinsSecs',
})
export class HoursMinsSecsPipe implements PipeTransform {
  /**
   *
   * @param value A number representing a specific amount of milliseconds
   * @returns A string in the format HH:mm:ss
   */
  transform(value: number): string {
    if (value > 24 * 60 * 60 * 1000) {
      return 'More than one day.';
    }
    const hours = Math.floor(value / (60 * 60 * 1000));
    const minutes = Math.floor(
      (value % (60 * 60 * 1000)) / (60 * 1000)
    );
    const seconds = Math.floor((value % (60 * 1000)) / 1000);

    const hourString = this.getTwoDigitNumber(hours);
    const minString = this.getTwoDigitNumber(minutes);
    const secondString = this.getTwoDigitNumber(seconds);
    return `${hourString}:${minString}:${secondString}`;
  }

  private getTwoDigitNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
