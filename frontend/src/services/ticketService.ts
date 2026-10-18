
import { apiFetch } from "./apiFetch";

const API_URL = "http://localhost:5251/api/tickets";

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  requesterName: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateTicketInput {
  title: string;
  requesterName: string;
  category: string;
  priority: string;
  description: string;
}

export interface UpdateTicketInput extends CreateTicketInput {
  status: string;
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

export async function getTickets(): Promise<Ticket[]> {
  const response = await apiFetch(API_URL);
  return handleResponse<Ticket[]>(response);
}

export async function getTicket(id: number): Promise<Ticket> {
  const response = await apiFetch(`${API_URL}/${id}`);
  return handleResponse<Ticket>(response);
}

export async function createTicket(
  ticket: CreateTicketInput
): Promise<Ticket> {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });

  return handleResponse<Ticket>(response);
}

export async function updateTicket(
  id: number,
  ticket: UpdateTicketInput
): Promise<Ticket> {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });

  return handleResponse<Ticket>(response);
}

export async function deleteTicket(id: number): Promise<void> {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse<void>(response);
}
