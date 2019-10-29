export function removeFromString(character: string) {
  return (str: string) =>
    str
      .split(character)
      .filter(c => c !== character)
      .join('');
}
