export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  signature?: string;
  video?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerSearchParams {
  phone: string;
}

export interface CustomerCreateParams {
  name: string;
  phone: string;
  idCard: string;
  signature?: string;
  video?: string;
}

export interface CustomerUpdateParams {
  name?: string;
  phone?: string;
  idCard?: string;
  signature?: string;
  video?: string;
} 