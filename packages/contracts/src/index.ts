export type HealthStatus = {
  status: "ok";
  service: string;
  timestamp: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};
