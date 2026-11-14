/** Public body label shared by catalog and mission surfaces. */
export function displayBodyLabel(name: string | null | undefined, designation: string): string {
  const cleanDesignation = designation.trim().replace(/^\((.*)\)$/, '$1');
  const cleanName = name?.trim() ?? '';
  if (cleanName.length === 0 || cleanName === designation || cleanName === `(${cleanDesignation})`) {
    return cleanDesignation;
  }
  return `${cleanName} (${cleanDesignation})`;
}
