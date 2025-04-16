export function parseDateString(dateString: string): { month: number; year: number } | null {
  const months = [
    'янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.',
    'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'
  ];

  dateString = dateString.trim();
  if (!dateString) {
    return null;
  }

  const [monthStr, yearStr] = dateString.split(' ');

  const monthIndex = months.indexOf(monthStr);
  if (monthIndex === -1) {
    throw new Error(`Неизвестный месяц: ${monthStr}`);
  }

  const year = parseInt(yearStr, 10);
  if (isNaN(year)) {
    throw new Error(`Неизвестный год: ${yearStr}`);
  }

  return { month: monthIndex + 1, year }; // Месяцы начинаются с 1
}

export function getColumnLetter(columnIndex: number): string {
  let temp: number = columnIndex + 1;
  let letter: string = '';

  while (temp > 0) {
    const mod: number = (temp - 1) % 26;
    letter = String.fromCharCode(mod + 65) + letter;
    temp = Math.floor((temp - mod) / 26);
  }

  return letter;
}
