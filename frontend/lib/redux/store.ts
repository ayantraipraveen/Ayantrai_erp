import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import reportModuleReducer from "./slices/reportModuleSlice";
import watermarkStudioReducer from "./slices/watermarkStudioSlice";
import templatesReducer from "./slices/templatesSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      reportModule: reportModuleReducer,
      watermarkStudio: watermarkStudioReducer,
      templates: templatesReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
