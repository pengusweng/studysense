/** Return a tab target only at the edge of a modal support dialog. */
export function wrappedDialogFocusIndex(
  currentIndex: number,
  lastIndex: number,
  backward: boolean,
): number | null {
  if (lastIndex < 0) return null;
  if (backward && currentIndex <= 0) return lastIndex;
  if (!backward && currentIndex === lastIndex) return 0;
  return null;
}
