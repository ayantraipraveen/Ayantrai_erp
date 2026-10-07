import { templateAxiosClient } from "./axiosClient";
import { API_ENDPOINTS } from "./endpoints";
import { LibrarySection } from "../redux/types/reportModuleTypes";

export interface SectionListParams {
  search?: string;
  type?: "all" | "core" | "custom";
  watermarkId?: string;
  projectSite?: string;
  sortBy?: "orderIndex" | "name" | "createdAt" | "updatedAt" | "id";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateSectionPayload {
  name: string;
  eyebrow?: string;
  description?: string;
  type?: "core" | "custom";
  icon?: string;
  titleHtml?: string;
  titleStyle?: any;
  eyebrowHtml?: string;
  descriptionHtml?: string;
  headerSpacing?: "compact" | "normal" | "spacious";
  sectionStyle?: any;
  metricCards?: any[];
  charts?: any[];
  keyInsights?: any[];
  canvasRows?: any[];
  stamps?: any[];
  watermarkId?: string | null;
  projectSite?: string | null;
  reportingPeriod?: string | null;
  coverPageData?: any;
  tableOfContentsData?: any;
  backCoverData?: any;
  pageOverrides?: any;
}

export type UpdateSectionPayload = Partial<CreateSectionPayload>;

export interface SectionStats {
  totalSections: number;
  coreStandardsCount: number;
  customModulesCount: number;
  totalCardsCount: number;
  totalChartsCount: number;
}

export interface SectionsResponse {
  statusCode: number;
  data: LibrarySection[];
  message: string;
  success: boolean;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    stats?: SectionStats;
  };
}

export interface SingleSectionResponse {
  statusCode: number;
  data: LibrarySection;
  message: string;
  success: boolean;
}

/**
 * Enterprise Sections & Graphs API Client
 * Targets template-service microservice (port 5001)
 */
export const sectionApi = {
  /**
   * Fetch all sections with filtering, search, and pagination
   */
  async getSections(params?: SectionListParams): Promise<SectionsResponse> {
    const response = await templateAxiosClient.get<SectionsResponse>(
      API_ENDPOINTS.SECTIONS.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Fetch a single section by ID with complete canvas layout rows
   */
  async getSectionById(id: string): Promise<SingleSectionResponse> {
    const response = await templateAxiosClient.get<SingleSectionResponse>(
      API_ENDPOINTS.SECTIONS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create a new custom template section
   */
  async createSection(payload: CreateSectionPayload): Promise<SingleSectionResponse> {
    const response = await templateAxiosClient.post<SingleSectionResponse>(
      API_ENDPOINTS.SECTIONS.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Update an existing section's canvas rows, title styling, or telemetry blocks
   */
  async updateSection(
    id: string,
    payload: UpdateSectionPayload
  ): Promise<SingleSectionResponse> {
    const response = await templateAxiosClient.put<SingleSectionResponse>(
      API_ENDPOINTS.SECTIONS.BY_ID(id),
      payload
    );
    return response.data;
  },

  /**
   * Clone/Duplicate an existing section
   */
  async cloneSection(
    id: string,
    name?: string
  ): Promise<SingleSectionResponse> {
    const response = await templateAxiosClient.post<SingleSectionResponse>(
      `${API_ENDPOINTS.SECTIONS.BY_ID(id)}/clone`,
      name ? { name } : {}
    );
    return response.data;
  },

  /**
   * Delete a custom section
   */
  async deleteSection(
    id: string
  ): Promise<{ statusCode: number; message: string; success: boolean }> {
    const response = await templateAxiosClient.delete(
      API_ENDPOINTS.SECTIONS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Bulk reorder section sequence
   */
  async reorderSections(
    orders: { id: string; orderIndex: number }[]
  ): Promise<{ statusCode: number; message: string; success: boolean }> {
    const response = await templateAxiosClient.put(
      API_ENDPOINTS.SECTIONS.REORDER,
      { orders }
    );
    return response.data;
  },
};

export default sectionApi;
