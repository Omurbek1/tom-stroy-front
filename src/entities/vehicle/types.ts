export interface Vehicle {
  id: string;
  type: string;
  plate?: string | null;
  driverId?: string | null;
  fuelLitres: number;
  status: string;
  driver?: { id: string; fullName: string } | null;
}

export interface VehicleUsage {
  id: string;
  vehicleId: string;
  projectId?: string | null;
  date: string;
  hoursUsed: number;
  fuelUsed: number;
  cost: number;
  note?: string | null;
  vehicle?: { id: string; type: string; plate?: string | null } | null;
  project?: { id: string; name: string } | null;
}

export interface CreateVehiclePayload {
  type: string;
  plate?: string;
  driverId?: string;
  fuelLitres?: number;
  status?: string;
}

export interface CreateUsagePayload {
  vehicleId: string;
  projectId?: string;
  date: string;
  hoursUsed?: number;
  fuelUsed?: number;
  cost?: number;
  note?: string;
}
