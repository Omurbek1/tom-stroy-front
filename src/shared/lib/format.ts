const moneyFmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'KGS',
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

export const formatMoney = (n: number | string | null | undefined): string =>
  moneyFmt.format(Number(n ?? 0));

export const formatNumber = (n: number | string | null | undefined): string =>
  numberFmt.format(Number(n ?? 0));

export const formatDate = (d: string | Date | null | undefined): string => {
  if (!d) return '—';
  return dateFmt.format(typeof d === 'string' ? new Date(d) : d);
};

export const formatPercent = (n: number | string | null | undefined): string => {
  if (n == null) return '—';
  return `${numberFmt.format(Number(n))}%`;
};
