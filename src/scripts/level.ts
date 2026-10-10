/** Full years between an ISO birth date (YYYY-MM-DD) and `on`. Used as the character level. */
export function levelOn(birthday: string, on: Date = new Date()) {
  const [y, m, d] = birthday.split('-').map(Number);
  const hadBirthday = on.getMonth() + 1 > m || (on.getMonth() + 1 === m && on.getDate() >= d);
  return on.getFullYear() - y - (hadBirthday ? 0 : 1);
}

/** True when `on` is the birthday (month and day match). */
export function isBirthday(birthday: string, on: Date = new Date()) {
  const [, m, d] = birthday.split('-').map(Number);
  return on.getMonth() + 1 === m && on.getDate() === d;
}
