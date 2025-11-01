export interface Form {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  fields?: FormField[];
  responses: number;
  created_at?: string;
  createdAt?: string;
  is_public?: boolean;
  deadline?: string | null;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  memberId?: string;
  responses: Record<string, any>;
  submittedAt: string;
}
