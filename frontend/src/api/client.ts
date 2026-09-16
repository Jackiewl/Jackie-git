import axios, { AxiosError } from "axios";
import type { ApiEnvelope } from "@/types/api";
import type { ApiPath } from "./endpoints";
import { getMockData } from "@/mocks";

const useMock = import.meta.env.VITE_USE_MOCK !== "false";
const timeout = Number(import.meta.env.VITE_REQUEST_TIMEOUT || 15000);

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function normalizeError(error: unknown): Error {
  if (!(error instanceof AxiosError)) return error instanceof Error ? error : new Error("未知请求错误");

  const payload = error.response?.data as Partial<ApiEnvelope<unknown>> | undefined;
  if (payload?.message) return new ApiError(payload.message, payload.code, payload.meta?.request_id);
  if (error.code === "ECONNABORTED") return new Error(`请求超时（${timeout / 1000} 秒），请稍后重试。`);
  if (!error.response) return new Error("无法连接数据服务，请检查接口地址或切换 Mock 模式。");
  return new Error(`数据服务请求失败（HTTP ${error.response.status}）。`);
}

export async function postApi<T, P extends object>(path: ApiPath, payload: P): Promise<T> {
  if (useMock) {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    return getMockData<T>(path);
  }

  try {
    const response = await http.post<ApiEnvelope<T>>(path, payload);
    const envelope = response.data;
    if (envelope.code !== 0 || envelope.data === null) {
      throw new ApiError(envelope.message || "接口返回业务错误", envelope.code, envelope.meta?.request_id);
    }
    return envelope.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export const apiRuntime = { useMock, baseUrl: http.defaults.baseURL || "同源代理" };
