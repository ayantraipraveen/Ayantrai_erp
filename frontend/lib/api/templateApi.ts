import { templateAxiosClient } from "./axiosClient";
import { API_ENDPOINTS } from "./endpoints";
import { ReportTemplate } from "../redux/types/reportModuleTypes";

export interface TemplateListParams {
  search?: string;
  status?: string;
  site_id?: string;
  page?: number;
  limit?: number;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  site_id?: string;
  site_name?: string;
  category?: string;
  frequency?: string;
  complianceStandards?: string[];
  hasAuditHash?: boolean;
  blocks?: any;
  coverPageData?: any;
  tableOfContentsData?: any;
  backCoverData?: any;
  canvasSectionId?: string;
  status?: "draft" | "pending" | "active" | "rejected";
}

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;

export interface TemplatesResponse {
  statusCode: number;
  data: ReportTemplate[];
  message: string;
  success: boolean;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleTemplateResponse {
  statusCode: number;
  data: ReportTemplate;
  message: string;
  success: boolean;
}

/**
 * Enterprise Report Templates API Client
 * Targets template-service microservice (port 5001)
 */
export const templateApi = {
  /**
   * Fetch all templates with filtering, search, and pagination
   */
  async getTemplates(params?: TemplateListParams): Promise<TemplatesResponse> {
    const response = await templateAxiosClient.get<TemplatesResponse>(
      API_ENDPOINTS.TEMPLATES.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Fetch a single template by ID
   */
  async getTemplateById(id: string): Promise<SingleTemplateResponse> {
    const response = await templateAxiosClient.get<SingleTemplateResponse>(
      API_ENDPOINTS.TEMPLATES.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create a new template blueprint
   */
  async createTemplate(payload: CreateTemplatePayload): Promise<SingleTemplateResponse> {
    const response = await templateAxiosClient.post<SingleTemplateResponse>(
      API_ENDPOINTS.TEMPLATES.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Update an existing template blueprint
   */
  async updateTemplate(
    id: string,
    payload: UpdateTemplatePayload
  ): Promise<SingleTemplateResponse> {
    const response = await templateAxiosClient.put<SingleTemplateResponse>(
      API_ENDPOINTS.TEMPLATES.BY_ID(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete a template blueprint by ID
   */
  async deleteTemplate(id: string): Promise<{ statusCode: number; success: boolean; message: string }> {
    const response = await templateAxiosClient.delete<{
      statusCode: number;
      success: boolean;
      message: string;
    }>(API_ENDPOINTS.TEMPLATES.BY_ID(id));
    return response.data;
  },

  /**
   * Duplicate / clone an existing template
   */
  async cloneTemplate(id: string, name?: string): Promise<SingleTemplateResponse> {
    const response = await templateAxiosClient.post<SingleTemplateResponse>(
      API_ENDPOINTS.TEMPLATES.CLONE(id),
      name ? { name } : {}
    );
    return response.data;
  },

  /**
   * Superadmin Governance: Approve template
   */
  async approveTemplate(id: string, remarks?: string): Promise<SingleTemplateResponse> {
    const response = await templateAxiosClient.post<SingleTemplateResponse>(
      API_ENDPOINTS.TEMPLATES.APPROVE(id),
      { remarks }
    );
    return response.data;
  },

  /**
   * Superadmin Governance: Reject template with mandatory reason
   */
  async rejectTemplate(id: string, rejectionReason: string): Promise<SingleTemplateResponse> {
    const response = await templateAxiosClient.post<SingleTemplateResponse>(
      API_ENDPOINTS.TEMPLATES.REJECT(id),
      { rejectionReason }
    );
    return response.data;
  },

  /**
   * Resubmit rejected template for review
   */
  async resubmitTemplate(id: string, remarks?: string): Promise<SingleTemplateResponse> {
    const response = await templateAxiosClient.post<SingleTemplateResponse>(
      API_ENDPOINTS.TEMPLATES.RESUBMIT(id),
      { remarks }
    );
    return response.data;
  },
};

export default templateApi;
