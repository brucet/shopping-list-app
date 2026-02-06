export const parseItemText = (text: string): { text: string; quantity: number | undefined } => {
  let quantity: number | undefined;
  let cleanedText = text.trim();

  // Match "x" followed by a number at the end of the string (e.g., "item x2")
  const trailingXRegex = /^(.*?)\s*x(\d+)$/i;
  const trailingXMatch = cleanedText.match(trailingXRegex);

  if (trailingXMatch) {
    cleanedText = trailingXMatch[1].trim();
    quantity = parseInt(trailingXMatch[2], 10);
    return { text: cleanedText, quantity };
  }

  // Match a number at the beginning of the string (e.g., "2 items")
  const leadingNumberRegex = /^(\d+)\s+(.*)$/;
  const leadingNumberMatch = cleanedText.match(leadingNumberRegex);

  if (leadingNumberMatch) {
    cleanedText = leadingNumberMatch[2].trim();
    quantity = parseInt(leadingNumberMatch[1], 10);
    return { text: cleanedText, quantity };
  }

  return { text: cleanedText, quantity };
};
