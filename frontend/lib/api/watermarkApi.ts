import { templateAxiosClient } from "./axiosClient";
import { API_ENDPOINTS } from "./endpoints";

export interface WatermarkItem {
  id: string;
  name: string;
  fileName: string;
  svgContent: string;
  sizeBytes: number;
  scale: number;
  opacity: number;
  rotation: number;
  placement: string;
  tag?: string;
  isDefault: boolean;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatermarkListParams {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface CreateWatermarkPayload {
  name: string;
  fileName?: string;
  svgContent: string;
  sizeBytes?: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
  placement?: string;
  tag?: string;
  isDefault?: boolean;
  description?: string;
}

export interface WatermarksResponse {
  statusCode: number;
  data: WatermarkItem[];
  message: string;
  success: boolean;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleWatermarkResponse {
  statusCode: number;
  data: WatermarkItem;
  message: string;
  success: boolean;
}

/**
 * Watermark API Client for Template Microservice (port 5001)
 */
export const watermarkApi = {
  /**
   * Fetch all watermarks with optional filtering and pagination
   */
  async getWatermarks(params?: WatermarkListParams): Promise<WatermarksResponse> {
    const response = await templateAxiosClient.get<WatermarksResponse>(
      API_ENDPOINTS.WATERMARKS.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Fetch a single watermark by its ID
   */
  async getWatermarkById(id: string): Promise<SingleWatermarkResponse> {
    const response = await templateAxiosClient.get<SingleWatermarkResponse>(
      API_ENDPOINTS.WATERMARKS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Upload / create a new vector SVG watermark
   */
  async createWatermark(payload: CreateWatermarkPayload): Promise<SingleWatermarkResponse> {
    const response = await templateAxiosClient.post<SingleWatermarkResponse>(
      API_ENDPOINTS.WATERMARKS.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Update properties of an existing watermark (e.g. scale, rotation, opacity, placement)
   */
  async updateWatermark(
    id: string,
    payload: Partial<CreateWatermarkPayload>
  ): Promise<SingleWatermarkResponse> {
    const response = await templateAxiosClient.put<SingleWatermarkResponse>(
      API_ENDPOINTS.WATERMARKS.BY_ID(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete a watermark by its ID
   */
  async deleteWatermark(id: string): Promise<{ statusCode: number; message: string; success: boolean }> {
    const response = await templateAxiosClient.delete(API_ENDPOINTS.WATERMARKS.BY_ID(id));
    return response.data;
  },
};

export default watermarkApi;
