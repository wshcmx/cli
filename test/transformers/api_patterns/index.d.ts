export type Route = Object & {
  access: string;
  callback: string;
  method: string;
  params: object | undefined;
  pattern: string;
  url: string | undefined;
};

export type RouteParameter = {
  format?: "date" | "real" | null;
  items: string;
  nullable?: boolean;
  optional?: boolean;
  store?: "body" | "query";
  type: "array" | "boolean" | "date" | "number" | "object" | "string";
  val?: unknown;
  GetOptProperty(key: string, defaultValue?: unknown): unknown;
  SetProperty(key: string, value: unknown): void;
};

export type RouteParameters = {
  [key: string]: RouteParameter;
};

export const wshcmx: {
  availableParametersTypes: string[];
  config: {
    basepath: string;
    env: string;
    pattern: string;
  };
  routes: Route[];
  utils: {
    log: {
      error(message: string, logCode: string): void;
    };
    type: {
      isError(value: unknown): value is Error;
      isPrimitive(value: unknown): boolean;
      isUndef(value: unknown): boolean;
    };
  };
};
