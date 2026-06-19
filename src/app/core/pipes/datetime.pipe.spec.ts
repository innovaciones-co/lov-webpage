import { DatetimePipe } from './datetime.pipe';

describe('DatetimePipe', () => {
  it('create an instance', () => {
    const pipe = new DatetimePipe();
    expect(pipe).toBeTruthy();
  });

  it('formats an ISO date into a human readable datetime', () => {
    const pipe = new DatetimePipe();
    const value = pipe.transform('2026-06-19T14:35:00Z', 'es-CO');

    expect(value).toContain('2026');
    expect(value).toContain('14:35');
  });

  it('returns empty string for invalid input', () => {
    const pipe = new DatetimePipe();

    expect(pipe.transform('not-a-date')).toBe('');
  });
});
