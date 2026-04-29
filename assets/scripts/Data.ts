
export const SYMBOL_MAP: Record<number, string> = {
    1: '🍒',
    2: '🍋',
    3: '🍊',
    4: '🍓',
    5: '🍌',
    6: '🍇',
    60: '🍀',
    70: '⭐',
    80: '💰',
    90: '🔍',
    100: '💎'
}

export const SYMBOL_SIZE = 160;

export const LINE_COLOR: Record<number, string> = {
    1: '#333333',
    3: '#006600',
    4: '#CC0000',
    8: '#CCCC33',
}

export function getLineColorByMultiple(multiple: number): string {
    const color = LINE_COLOR[multiple];
    if (!color) {
        throw new Error(`No color found for multiple ${multiple}`);
    }
    return color;
}
