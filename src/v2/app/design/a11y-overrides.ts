/** DEC-19.5-6 lightness-only overrides. The token snapshot stays byte-verbatim. */
export const A11Y_OVERRIDES = {
  statusLowC3: {
    old: '#3a8d4a',
    value: '#378646',
    ratioBefore: 4.127,
    ratioAfter: 4.506,
    reason: 'White status text needs at least 4.5:1; hue and saturation are retained.',
  },
  tierL1: {
    old: '#9a7a3a',
    value: '#907236',
    ratioBefore: 4.024,
    ratioAfter: 4.520,
    reason: 'White tier text needs at least 4.5:1; hue and saturation are retained.',
  },
  catalogHint: {
    old: '#666666',
    value: '#7d7d7d',
    background: '#0f1116',
    ratioBefore: 3.289,
    ratioAfter: 4.587,
    reason: 'The 10px catalog hint needs the 4.5:1 text floor on the sidebar surface.',
  },
} as const;
