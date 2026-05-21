import type { EmployeeRole, PayType } from '@entities/employee/types';

export const EMPLOYEE_ROLE_LABEL: Record<EmployeeRole, string> = {
  FOREMAN: 'Прораб',
  MASON: 'Каменщик',
  CONCRETE: 'Бетонщик',
  PLASTERER: 'Штукатур',
  PLUMBER: 'Сантехник',
  ELECTRICIAN: 'Электрик',
  WELDER: 'Сварщик',
  ROOFER: 'Кровельщик',
  DRIVER: 'Водитель',
  OPERATOR: 'Оператор техники',
  LABORER: 'Разнорабочий',
  FINISHER: 'Отделочник',
  WAREHOUSE: 'Кладовщик',
  OTHER: 'Прочее',
};

export const EMPLOYEE_ROLE_OPTIONS: Array<{ value: EmployeeRole; label: string }> = (
  Object.keys(EMPLOYEE_ROLE_LABEL) as EmployeeRole[]
).map((v) => ({ value: v, label: EMPLOYEE_ROLE_LABEL[v] }));

export function formatEmployeeRole(value: string): string {
  return EMPLOYEE_ROLE_LABEL[value as EmployeeRole] ?? value;
}

export const PAY_TYPE_LABEL: Record<PayType, string> = {
  PER_CUBE: 'За куб (м³)',
  PER_SQM: 'За м²',
  PER_METER: 'За пог. м',
  PER_SHIFT: 'За смену',
  HOURLY: 'Почасовая',
  SALARY: 'Оклад',
  SALARY_PLUS_PERCENT: 'Оклад + %',
};

export const PAY_TYPE_OPTIONS: Array<{ value: PayType; label: string }> = (
  Object.keys(PAY_TYPE_LABEL) as PayType[]
).map((v) => ({ value: v, label: PAY_TYPE_LABEL[v] }));

export function formatPayType(value: string): string {
  return PAY_TYPE_LABEL[value as PayType] ?? value;
}
