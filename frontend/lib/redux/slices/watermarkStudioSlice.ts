import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UploadedSvgWatermark } from "@/app/templates/Sections&Graphs/watermark/utils";

export interface PendingWatermarkUpload {
  name: string;
  fileName: string;
  svgContent: string;
  sizeBytes: number;
  scale: number;
}

export interface WatermarkStudioState {
  watermarks: UploadedSvgWatermark[];
  selectedId: string | null;
  isLoaded: boolean;
  isDragging: boolean;
  uploadError: string | null;
  uploadSuccess: string | null;
  pendingUploads: PendingWatermarkUpload[];
  previewModalIndex: number;
  isUploadingPending: boolean;
  isPasteModalOpen: boolean;
  pasteSvgContent: string;
  pasteSvgName: string;
  pasteError: string | null;
  previewTheme: "light" | "dark" | "grid";
  sizeScale: number;
}

const initialState: WatermarkStudioState = {
  watermarks: [],
  selectedId: null,
  isLoaded: false,
  isDragging: false,
  uploadError: null,
  uploadSuccess: null,
  pendingUploads: [],
  previewModalIndex: 0,
  isUploadingPending: false,
  isPasteModalOpen: false,
  pasteSvgContent: "",
  pasteSvgName: "",
  pasteError: null,
  previewTheme: "light",
  sizeScale: 100,
};

const watermarkStudioSlice = createSlice({
  name: "watermarkStudio",
  initialState,
  reducers: {
    updateWatermarkStudio: (
      state,
      action: PayloadAction<Partial<WatermarkStudioState>>
    ) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { updateWatermarkStudio } = watermarkStudioSlice.actions;
export default watermarkStudioSlice.reducer;