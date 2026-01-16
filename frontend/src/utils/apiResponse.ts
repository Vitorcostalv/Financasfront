export const extractData = <T,>(payload: any): T => {
  if (!payload) {
    return payload as T;
  }
  const data = payload.data ?? payload;
  if (data?.dados !== undefined) {
    return data.dados as T;
  }
  if (data?.data !== undefined) {
    return data.data as T;
  }
  return data as T;
};

export const extractMessage = (payload: any): string => {
  const data = payload?.data ?? payload;
  return data?.mensagem ?? data?.message ?? 'Ocorreu um erro inesperado.';
};

export const extractErrors = (payload: any): string[] => {
  const data = payload?.data ?? payload;
  const errors = data?.erros ?? data?.errors;
  if (Array.isArray(errors)) {
    return errors;
  }
  if (typeof errors === 'string') {
    return [errors];
  }
  return [];
};
