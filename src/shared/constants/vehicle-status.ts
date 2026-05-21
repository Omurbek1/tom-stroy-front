/** Vehicle status — raw values come from backend; UI shows Russian labels. */
export type VehicleStatus = 'idle' | 'on-project' | 'maintenance' | 'broken';

interface StatusMeta {
  label: string;
  color: string;
}

export const VEHICLE_STATUS_META: Record<VehicleStatus, StatusMeta> = {
  idle: { label: 'Свободна', color: 'default' },
  'on-project': { label: 'На объекте', color: 'green' },
  maintenance: { label: 'На ТО', color: 'orange' },
  broken: { label: 'Сломана', color: 'red' },
};

export const VEHICLE_STATUS_OPTIONS: Array<{ value: VehicleStatus; label: string }> = (
  Object.keys(VEHICLE_STATUS_META) as VehicleStatus[]
).map((v) => ({ value: v, label: VEHICLE_STATUS_META[v].label }));

export function formatVehicleStatus(value: string): string {
  return VEHICLE_STATUS_META[value as VehicleStatus]?.label ?? value;
}
