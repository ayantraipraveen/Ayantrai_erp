"use client";

import { PayloadAction } from "@reduxjs/toolkit";
import {
  ReportModuleState,
  WatermarkConfig,
  WatermarkItem,
} from "../../types/reportModuleTypes";

export const watermarksReducers = {
    setWatermarkConfig: (state, action: PayloadAction<Partial<WatermarkConfig>>) => {
      state.watermarkConfig = {
        ...state.watermarkConfig,
        ...action.payload,
      };
    },
    createWatermark: (
      state,
      action: PayloadAction<Omit<WatermarkItem, "id" | "createdAt"> & { id?: string; createdAt?: string }>
    ) => {
      const id = action.payload.id || `wm-${Date.now()}`;
      const newWatermark: WatermarkItem = {
        ...action.payload,
        id,
        createdAt: action.payload.createdAt || new Date().toISOString().split("T")[0],
        assignedSectionIds: action.payload.assignedSectionIds || [],
      };
      if (newWatermark.isDefault) {
        state.watermarks.forEach((w) => {
          w.isDefault = false;
        });
      }
      state.watermarks.unshift(newWatermark);
      state.selectedWatermarkId = id;
      state.watermarkConfig = {
        svgContent: newWatermark.svgContent,
        fileName: newWatermark.fileName,
        opacity: newWatermark.opacity,
        rotation: newWatermark.rotation,
        scale: newWatermark.scale,
        placement: (newWatermark.placement as any) || "center",
      };
      if (newWatermark.assignedSectionIds.length > 0) {
        state.librarySections.forEach((sec) => {
          if (newWatermark.assignedSectionIds.includes(sec.id)) {
            sec.watermarkId = id;
          }
        });
      }
    },
    updateWatermark: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<WatermarkItem> }>
    ) => {
      const { id, changes } = action.payload;
      const index = state.watermarks.findIndex((w) => w.id === id);
      if (index !== -1) {
        if (changes.isDefault) {
          state.watermarks.forEach((w) => {
            w.isDefault = false;
          });
        }
        state.watermarks[index] = {
          ...state.watermarks[index],
          ...changes,
          updatedAt: new Date().toISOString().split("T")[0],
        };
        if (state.selectedWatermarkId === id) {
          const updated = state.watermarks[index];
          state.watermarkConfig = {
            svgContent: updated.svgContent,
            fileName: updated.fileName,
            opacity: updated.opacity,
            rotation: updated.rotation,
            scale: updated.scale,
            placement: (updated.placement as any) || "center",
          };
        }
        if (changes.assignedSectionIds !== undefined) {
          state.librarySections.forEach((sec) => {
            if (changes.assignedSectionIds!.includes(sec.id)) {
              sec.watermarkId = id;
            } else if (sec.watermarkId === id) {
              sec.watermarkId = undefined;
            }
          });
        }
      }
    },
    deleteWatermark: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.watermarks = state.watermarks.filter((w) => w.id !== id);
      state.librarySections.forEach((sec) => {
        if (sec.watermarkId === id) {
          sec.watermarkId = undefined;
        }
      });
      if (state.selectedWatermarkId === id) {
        const next = state.watermarks[0];
        if (next) {
          state.selectedWatermarkId = next.id;
          state.watermarkConfig = {
            svgContent: next.svgContent,
            fileName: next.fileName,
            opacity: next.opacity,
            rotation: next.rotation,
            scale: next.scale,
            placement: (next.placement as any) || "center",
          };
        } else {
          state.selectedWatermarkId = "";
        }
      }
    },
    duplicateWatermark: (state, action: PayloadAction<string>) => {
      const target = state.watermarks.find((w) => w.id === action.payload);
      if (target) {
        const cloneId = `wm-${Date.now()}`;
        const cloned: WatermarkItem = {
          ...target,
          id: cloneId,
          name: `${target.name} (Copy)`,
          isDefault: false,
          assignedSectionIds: [],
          createdAt: new Date().toISOString().split("T")[0],
        };
        state.watermarks.push(cloned);
        state.selectedWatermarkId = cloneId;
        state.watermarkConfig = {
          svgContent: cloned.svgContent,
          fileName: cloned.fileName,
          opacity: cloned.opacity,
          rotation: cloned.rotation,
          scale: cloned.scale,
          placement: (cloned.placement as any) || "center",
        };
      }
    },
    setSelectedWatermarkId: (state, action: PayloadAction<string>) => {
      state.selectedWatermarkId = action.payload;
      const found = state.watermarks.find((w) => w.id === action.payload);
      if (found) {
        state.watermarkConfig = {
          svgContent: found.svgContent,
          fileName: found.fileName,
          opacity: found.opacity,
          rotation: found.rotation,
          scale: found.scale,
          placement: (found.placement as any) || "center",
        };
      }
    },
    setDefaultWatermark: (state, action: PayloadAction<string>) => {
      state.watermarks.forEach((w) => {
        w.isDefault = w.id === action.payload;
      });
    },
    assignWatermarkToSections: (
      state,
      action: PayloadAction<{ watermarkId: string; sectionIds: string[] }>
    ) => {
      const { watermarkId, sectionIds } = action.payload;
      const target = state.watermarks.find((w) => w.id === watermarkId);
      if (target) {
        target.assignedSectionIds = sectionIds;
        state.librarySections.forEach((sec) => {
          if (sectionIds.includes(sec.id)) {
            sec.watermarkId = watermarkId;
          } else if (sec.watermarkId === watermarkId) {
            sec.watermarkId = undefined;
          }
        });
      }
    },
    setSectionWatermark: (
      state,
      action: PayloadAction<{ sectionId: string; watermarkId?: string | null }>
    ) => {
      const { sectionId, watermarkId } = action.payload;
      const sec = state.librarySections.find((s) => s.id === sectionId);
      if (sec) {
        const oldWmId = sec.watermarkId;
        sec.watermarkId = watermarkId || undefined;
        sec.updatedAt = "Just now";
        if (oldWmId && oldWmId !== watermarkId) {
          const oldWm = state.watermarks.find((w) => w.id === oldWmId);
          if (oldWm) {
            oldWm.assignedSectionIds = oldWm.assignedSectionIds.filter((id) => id !== sectionId);
          }
        }
        if (watermarkId) {
          const newWm = state.watermarks.find((w) => w.id === watermarkId);
          if (newWm && !newWm.assignedSectionIds.includes(sectionId)) {
            newWm.assignedSectionIds.push(sectionId);
          }
        }
      }
    },
  },
};
