
import { apiFetch } from "./apiFetch";

const API_URL = "http://localhost:5251/api/AssetMaintenance";

export interface AssetMaintenance {
  id: number;
  assetId: number;
  title: string;
  description: string;
  maintenanceType: string;
  status: string;
  cost: number;
  scheduledDate: string;
  completedDate: string | null;
  nextServiceDate: string | null;
  technician: string | null;
  createdAt: string;
}

export type CreateMaintenance = Omit<
  AssetMaintenance,
  "id" | "createdAt"
>;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getMaintenanceRecords(): Promise<AssetMaintenance[]> {
  const response = await apiFetch(API_URL);
  return handleResponse<AssetMaintenance[]>(response);
}

export async function getMaintenanceForAsset(
  assetId: number
): Promise<AssetMaintenance[]> {
  const response = await apiFetch(`${API_URL}/asset/${assetId}`);
  return handleResponse<AssetMaintenance[]>(response);
}

export async function createMaintenance(
  record: CreateMaintenance
): Promise<AssetMaintenance> {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  return handleResponse<AssetMaintenance>(response);
}

export async function updateMaintenance(
  record: AssetMaintenance
): Promise<void> {
  const response = await apiFetch(`${API_URL}/${record.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  await handleResponse<void>(response);
}

export async function deleteMaintenance(id: number): Promise<void> {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse<void>(response);
}
