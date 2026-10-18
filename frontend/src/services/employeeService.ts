
import { apiFetch } from "./apiFetch";

const API_URL = "http://localhost:5251/api/employees";

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  status: string;
  joinedAt: string;
}

export interface CreateEmployeeInput {
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  status: string;
}

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

export async function getEmployees(): Promise<Employee[]> {
  const response = await apiFetch(API_URL);
  return handleResponse<Employee[]>(response);
}

export async function createEmployee(
  employee: CreateEmployeeInput
): Promise<Employee> {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  return handleResponse<Employee>(response);
}

export async function updateEmployee(
  id: number,
  employee: Employee
): Promise<void> {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  await handleResponse<void>(response);
}

export async function deleteEmployee(id: number): Promise<void> {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse<void>(response);
}
