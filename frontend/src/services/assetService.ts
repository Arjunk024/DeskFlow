
import { apiFetch } from "./apiFetch";

const API_URL = "http://localhost:5251/api/assets";

export interface Asset {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  assignedTo: string;
  status: string;
  purchaseDate: string;
  warrantyExpiry: string | null;
  notes: string;
  createdAt: string;
}

export interface CreateAssetInput {
  assetTag: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  assignedTo: string;
  status: string;
  purchaseDate: string;
  warrantyExpiry: string | null;
  notes: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getAssets(): Promise<Asset[]> {
  const response = await apiFetch(API_URL);
  return handleResponse<Asset[]>(response);
}

export async function createAsset(
  asset: CreateAssetInput
): Promise<Asset> {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  });

  return handleResponse<Asset>(response);
}

export async function updateAsset(
  id: number,
  asset: Asset
): Promise<void> {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  });

  await handleResponse<void>(response);
}

export async function deleteAsset(id: number): Promise<void> {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse<void>(response);
}
