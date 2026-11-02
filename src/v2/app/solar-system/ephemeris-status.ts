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
}

export const CLAMPED_DATE_SUFFIX = ' (clamped, not now)';

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
  if (!args.tracking) {
    const outsideCoverage = args.wallClockTdbSeconds < args.timeMin || args.wallClockTdbSeconds > args.timeMax;
    return {
      trackingText: outsideCoverage
        ? `SCRUBBED \u2014 live time is outside this view's ephemeris coverage; Shift+N will ${shiftNHelpText(args)}`
        : 'SCRUBBED \u2014 press Shift+N for now',
      warningText: null,
      dateSuffix: '',
    };
  }

  if (args.wallClockTdbSeconds < args.timeMin) {
    return {
      trackingText: `NOT LIVE \u00b7 clamped to ${args.coverageStartDate} TDB`,
      warningText:
        `Current time is before this view's ephemeris coverage (starts ${args.coverageStartDate} TDB). ` +
        `Positions are shown for ${args.coverageStartDate}, not now.`,
      dateSuffix: CLAMPED_DATE_SUFFIX,
    };
  }

  if (args.wallClockTdbSeconds > args.timeMax) {
    return {
      trackingText: `NOT LIVE \u00b7 clamped to ${args.coverageEndDate} TDB`,
      warningText:
        `Current time is past this view's ephemeris coverage (ends ${args.coverageEndDate} TDB). ` +
        `Positions are shown for ${args.coverageEndDate}, not now.`,
      dateSuffix: CLAMPED_DATE_SUFFIX,
    };
  }

  return { trackingText: 'LIVE', warningText: null, dateSuffix: '' };
}
