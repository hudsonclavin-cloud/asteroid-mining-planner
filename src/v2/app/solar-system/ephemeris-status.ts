export interface EphemerisStatusArgs {
  readonly tracking: boolean;
  readonly wallClockTdbSeconds: number;
  readonly timeMin: number;
  readonly timeMax: number;
  readonly coverageStartDate: string;
  readonly coverageEndDate: string;
}

export interface EphemerisStatusHud {
  readonly trackingText: string;
  readonly warningText: string | null;
  /** Appended to the HUD date-time line when tracking is clamped to coverage. */
  readonly dateSuffix: string;
  /** The coverage line, with a refresh notice once live time nears the end of coverage. */
  readonly coverageText: string;
}

export const CLAMPED_DATE_SUFFIX = ' (clamped, not now)';

/** Live time within this many seconds of the coverage end shows the refresh notice. */
export const COVERAGE_ENDING_NOTICE_SECONDS = 14 * 86_400;

/**
 * Coverage-line text. While live time is inside coverage but within
 * COVERAGE_ENDING_NOTICE_SECONDS of its end, the line says the data needs a
 * refresh, so the expiry is visible before the view goes NOT LIVE.
 */
export function coverageLineText(
  args: Pick<EphemerisStatusArgs, 'wallClockTdbSeconds' | 'timeMin' | 'timeMax' | 'coverageStartDate' | 'coverageEndDate'>,
): string {
  const base = `View ephemeris coverage ${args.coverageStartDate} – ${args.coverageEndDate} TDB`;
  const endingSoon =
    args.wallClockTdbSeconds >= args.timeMin &&
    args.wallClockTdbSeconds <= args.timeMax &&
    args.timeMax - args.wallClockTdbSeconds <= COVERAGE_ENDING_NOTICE_SECONDS;
  return endingSoon ? `${base} (coverage ends ${args.coverageEndDate} TDB - refresh due)` : base;
}

/**
 * Help-panel text for Shift+N. The key sets tracking and the frame loop then
 * clamps the wall clock into [timeMin, timeMax], so outside coverage it lands on
 * the nearest coverage edge rather than on live time.
 */
export function shiftNHelpText(
  args: Pick<EphemerisStatusArgs, 'wallClockTdbSeconds' | 'timeMin' | 'timeMax'>,
): string {
  if (args.wallClockTdbSeconds > args.timeMax) {
    return 'jump to the end of coverage (live time is outside it)';
  }
  if (args.wallClockTdbSeconds < args.timeMin) {
    return 'jump to the start of coverage (live time is outside it)';
  }
  return 'resume live time';
}

export function ephemerisStatusHud(args: EphemerisStatusArgs): EphemerisStatusHud {
  const coverageText = coverageLineText(args);
  if (!args.tracking) {
    const outsideCoverage = args.wallClockTdbSeconds < args.timeMin || args.wallClockTdbSeconds > args.timeMax;
    return {
      trackingText: outsideCoverage
        ? `SCRUBBED \u2014 live time is outside this view's ephemeris coverage; Shift+N will ${shiftNHelpText(args)}`
        : 'SCRUBBED \u2014 press Shift+N for now',
      warningText: null,
      dateSuffix: '',
      coverageText,
    };
  }

  if (args.wallClockTdbSeconds < args.timeMin) {
    return {
      trackingText: `NOT LIVE \u00b7 clamped to ${args.coverageStartDate} TDB`,
      warningText:
        `Current time is before this view's ephemeris coverage (starts ${args.coverageStartDate} TDB). ` +
        `Positions are shown for ${args.coverageStartDate}, not now.`,
      dateSuffix: CLAMPED_DATE_SUFFIX,
      coverageText,
    };
  }

  if (args.wallClockTdbSeconds > args.timeMax) {
    return {
      trackingText: `NOT LIVE \u00b7 clamped to ${args.coverageEndDate} TDB`,
      warningText:
        `Current time is past this view's ephemeris coverage (ends ${args.coverageEndDate} TDB). ` +
        `Positions are shown for ${args.coverageEndDate}, not now.`,
      dateSuffix: CLAMPED_DATE_SUFFIX,
      coverageText,
    };
  }

  return { trackingText: 'LIVE', warningText: null, dateSuffix: '', coverageText };
}
