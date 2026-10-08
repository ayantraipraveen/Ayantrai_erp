export {
  axiosClient,
  templateAxiosClient,
  apiClient,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  buildHeadersWithToken,
} from "./axiosClient";
export { authApi } from "./authApi";
export { watermarkApi } from "./watermarkApi";
export type { WatermarkItem, CreateWatermarkPayload } from "./watermarkApi";
export { sectionApi } from "./sectionApi";
export type { SectionListParams, CreateSectionPayload, UpdateSectionPayload } from "./sectionApi";
export { templateApi } from "./templateApi";
export type { TemplateListParams, CreateTemplatePayload, UpdateTemplatePayload } from "./templateApi";
export { API_ENDPOINTS } from "./endpoints";
export type { AuthResponse } from "./authApi";



