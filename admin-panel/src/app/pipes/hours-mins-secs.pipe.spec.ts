import { HoursMinsSecsPipe } from './hours-mins-secs.pipe';

describe('HoursMinsSecsPipe', () => {
  let pipe: HoursMinsSecsPipe;

  beforeEach(() => {
    pipe = new HoursMinsSecsPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return formatted time for less than a day', () => {
    // 1 hour, 2 minutes, 3 seconds = 3723000 ms
    const ms = 1 * 60 * 60 * 1000 + 2 * 60 * 1000 + 3 * 1000;
    expect(pipe.transform(ms)).toBe('01:02:03');
  });

  it('should return "More than one day." for values over 24 hours', () => {
    const ms = 25 * 60 * 60 * 1000;
    expect(pipe.transform(ms)).toBe('More than one day.');
  });

  it('should pad single digit numbers with zero', () => {
    // 0 hours, 5 minutes, 9 seconds = 5*60*1000 + 9*1000 = 309000 ms
    expect(pipe.transform(309000)).toBe('00:05:09');
  });

  it('should return 00:00:00 for zero', () => {
    expect(pipe.transform(0)).toBe('00:00:00');
  });
});
