export const sanitizeInputMoney = (value: string) => {
  const cleaned = value.replace(/[^\d,]/g, '');
  const parts = cleaned.split(',');
  const integerPart = parts[0]?.replace(/^0+(?=\d)/, '') ?? '';
  const decimalPart = parts[1]?.slice(0, 2) ?? '';
  return decimalPart.length ? `${integerPart},${decimalPart}` : integerPart;
};

export const parseBRLToCents = (value: string): number => {
  if (!value) {
    return 0;
  }
  const cleaned = value.replace(/[^\d,]/g, '');
  const [reais, centavos = ''] = cleaned.split(',');
  const centsString = `${reais || '0'}${centavos.padEnd(2, '0').slice(0, 2)}`;
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
