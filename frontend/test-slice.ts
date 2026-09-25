import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReportModuleState, ReportTemplate } from "./lib/redux/types/reportModuleTypes";
import { templatesReducers } from "./lib/redux/slices/modules/templatesReducers";

const testSlice = createSlice({
  name: "test",
  initialState: {} as ReportModuleState,
  reducers: {
    ...templatesReducers,
  },
});

export const { addTemplate } = testSlice.actions;
// Check if addTemplate requires payload:
// @ts-expect-error Expect error when no argument passed
addTemplate();
