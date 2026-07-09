import { DatetimePipe } from './datetime.pipe';

describe('DatetimePipe', () => {
  it('create an instance', () => {
    const pipe = new DatetimePipe();
    expect(pipe).toBeTruthy();
  });

  it('formats a date into short datetime format', () => {
    const pipe = new DatetimePipe();
    const value = pipe.transform(new Date(2026, 5, 18, 14, 32, 15));

    expect(value).toBe('2026-06-18 14.32:15');
  });

  it('formats an ISO value into short datetime format', () => {
    const pipe = new DatetimePipe();
    const value = pipe.transform('2026-06-18T14:32:15');

    expect(value).toBe('2026-06-18 14.32:15');
  });

  it('returns empty string for invalid input', () => {
    const pipe = new DatetimePipe();

    expect(pipe.transform('not-a-date')).toBe('');
  });
});
