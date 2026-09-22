import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import reportModuleReducer from "./slices/reportModuleSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      reportModule: reportModuleReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
