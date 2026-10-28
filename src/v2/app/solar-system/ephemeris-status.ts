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
}

export function ephemerisStatusHud(args: EphemerisStatusArgs): EphemerisStatusHud {
  if (!args.tracking) {
    return {
      trackingText: 'SCRUBBED \u2014 press Shift+N for now',
      warningText: null,
    };
  }

  if (args.wallClockTdbSeconds < args.timeMin) {
    return {
      trackingText: `NOT LIVE \u00b7 clamped to ${args.coverageStartDate} TDB`,
      warningText:
        `Current time is before this view's ephemeris coverage (starts ${args.coverageStartDate} TDB). ` +
        `Positions are shown for ${args.coverageStartDate}, not now.`,
    };
  }

  if (args.wallClockTdbSeconds > args.timeMax) {
    return {
      trackingText: `NOT LIVE \u00b7 clamped to ${args.coverageEndDate} TDB`,
      warningText:
        `Current time is past this view's ephemeris coverage (ends ${args.coverageEndDate} TDB). ` +
        `Positions are shown for ${args.coverageEndDate}, not now.`,
    };
  }

  return { trackingText: 'LIVE', warningText: null };
}
