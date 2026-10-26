function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex) {
  const value = hex.replace(/^#/, '');
  const expanded = value.length === 3 ? value.split('').map((part) => part + part).join('') : value;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    throw new Error(`Expected a 3- or 6-digit hex colour, got ${hex}`);
  }
  return 0.2126 * channel(Number.parseInt(expanded.slice(0, 2), 16))
    + 0.7152 * channel(Number.parseInt(expanded.slice(2, 4), 16))
    + 0.0722 * channel(Number.parseInt(expanded.slice(4, 6), 16));
}

export function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}
