export const parseItemText = (text: string): { text: string; quantity: number | undefined } => {
    const trimmedText = text.trim();

    // Match "x" followed by a number at the end of the string (e.g., "item x2")
    const trailingXRegex = /^(.*?)\s*x(\d+)$/i;
    const trailingXMatch = trimmedText.match(trailingXRegex);

    if (trailingXMatch) {
        const cleanedText = trailingXMatch[1].trim();
        const quantity = parseInt(trailingXMatch[2], 10);
        return {text: cleanedText, quantity};
    }

    // Match a number at the beginning of the string (e.g., "2 items")
    const leadingNumberRegex = /^(\d+)\s+(.*)$/;
    const leadingNumberMatch = trimmedText.match(leadingNumberRegex);

    if (leadingNumberMatch) {
        const cleanedText = leadingNumberMatch[2].trim();
        const quantity = parseInt(leadingNumberMatch[1], 10);
        return {text: cleanedText, quantity};
    }

    return {text: trimmedText, quantity: undefined};
};
