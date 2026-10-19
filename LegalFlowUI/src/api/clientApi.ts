import apiAgent from "./apiAgent";

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  isActive: boolean;
};

export type CreateClientRequest = {
  firstName: string;
  lastName: string;
  companyName?: string | null;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  isActive: boolean;
};

export type UpdateClientRequest = {
  firstName: string;
  lastName: string;
  companyName?: string | null;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  isActive : boolean;
};

const clientApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiAgent.get<Client[]>("/Clients");

    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await apiAgent.get<Client>(
      `/Clients/${id}`
    );

    return response.data;
  },

  create: async (
    request: CreateClientRequest
  ): Promise<Client> => {
    const response = await apiAgent.post<Client>(
      "/Clients",
      request
    );

    return response.data;
  },

  update: async (
    id: string,
    request: UpdateClientRequest
  ): Promise<Client> => {
    const response = await apiAgent.put<Client>(
      `/Clients/${id}`,
      request
    );

    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiAgent.delete(`/Clients/${id}`);
  },
};

export default clientApi;