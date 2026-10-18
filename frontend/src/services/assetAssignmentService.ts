
import { apiFetch } from "./apiFetch";

const API_URL = "http://localhost:5251/api/assets";

export interface AssetAssignmentHistory {
  id: number;
  assetId: number;
  previousAssignee: string | null;
  newAssignee: string;
  changedAt: string;
  notes: string | null;
}

export async function getAssetAssignmentHistory(
  assetId: number
): Promise<AssetAssignmentHistory[]> {
  const response = await apiFetch(
    `${API_URL}/${assetId}/assignment-history`
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load assignment history.");
  }

  return response.json() as Promise<AssetAssignmentHistory[]>;
}
