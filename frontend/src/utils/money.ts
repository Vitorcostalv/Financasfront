const normalizeMoneyParts = (value: string) => {
  const cleaned = value.replace(/[^\d.,]/g, '');
  if (!cleaned) {
    return { reais: '', centavos: '' };
  }
  if (cleaned.includes(',')) {
    const [reais, centavos = ''] = cleaned.split(',');
    return { reais: reais.replace(/\./g, ''), centavos };
  }
  if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    const centavos = parts.pop() ?? '';
    const reais = parts.join('');
    return { reais, centavos };
  }
  return { reais: cleaned, centavos: '' };
};

export const sanitizeInputMoney = (value: string) => {
  const { reais, centavos } = normalizeMoneyParts(value);
  const integerPart = reais.replace(/^0+(?=\d)/, '');
  const decimalPart = centavos.slice(0, 2);
  return decimalPart.length ? `${integerPart},${decimalPart}` : integerPart;
};

export const parseBRLToCents = (value: string): number => {
  if (!value) {
    return 0;
  }
  const { reais, centavos } = normalizeMoneyParts(value);
  const safeReais = reais || '0';
  const safeCentavos = centavos.padEnd(2, '0').slice(0, 2);
  const centsString = `${safeReais}${safeCentavos}`;
  const cents = Number.parseInt(centsString, 10);
  return Number.isNaN(cents) ? 0 : cents;
};

export const formatCentsToBRL = (cents: number): string => {
  const safeCents = Number.isFinite(cents) ? Math.trunc(cents) : 0;
  const sign = safeCents < 0 ? '-' : '';
  const abs = Math.abs(safeCents);
  const reais = Math.trunc(abs / 100);
  const centavos = abs % 100;
  const reaisFormatted = reais
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}R$ ${reaisFormatted},${centavos.toString().padStart(2, '0')}`;
};
