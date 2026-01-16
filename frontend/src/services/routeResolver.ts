type RouteKey =
  | 'accounts'
  | 'categories'
  | 'transactions'
  | 'plans'
  | 'dashboardResumo'
  | 'dashboardFluxo'
  | 'dashboardDespesas'
  | 'dashboardSerieMensal'
  | 'planProjection'
  | 'recurrences'
  | 'settingsProfile'
  | 'settingsPassword';

const ROUTE_CACHE_PREFIX = 'finance.route';

const normalizeUrl = (base?: string, prefix?: string) => {
  const baseTrimmed = (base ?? '').trim();
  if (!baseTrimmed) {
    return '';
  }
  const normalizedBase = baseTrimmed.replace(/\/+$/, '');
  const prefixTrimmed = (prefix ?? '').trim();
  if (!prefixTrimmed) {
    return normalizedBase;
  }
  const normalizedPrefix = `/${prefixTrimmed.replace(/^\/+|\/+$/g, '')}`;
  return `${normalizedBase}${normalizedPrefix}`;
};

const rawPrefix = import.meta.env.VITE_API_PREFIX?.trim() ?? '';
const normalizedPrefix = rawPrefix ? `/${rawPrefix.replace(/^\/+|\/+$/g, '')}` : '';
const baseURL = normalizeUrl(import.meta.env.VITE_API_URL, rawPrefix);

const routeCandidates: Record<RouteKey, string[]> = {
  accounts: ['/contas', '/accounts', '/api/contas', '/api/accounts'],
  categories: ['/categorias', '/categories', '/api/categorias', '/api/categories'],
  transactions: ['/transacoes', '/transactions', '/api/transacoes', '/api/transactions'],
  plans: ['/planos', '/plans', '/api/planos', '/api/plans'],
  dashboardResumo: [
    '/dashboard/resumo',
    '/dashboard/summary',
    '/api/dashboard/resumo',
    '/api/dashboard/summary',
  ],
  dashboardFluxo: [
    '/dashboard/fluxo-diario',
    '/dashboard/daily-flow',
    '/api/dashboard/fluxo-diario',
    '/api/dashboard/daily-flow',
  ],
  dashboardDespesas: [
    '/dashboard/despesas-por-categoria',
    '/dashboard/expenses-by-category',
    '/api/dashboard/despesas-por-categoria',
    '/api/dashboard/expenses-by-category',
  ],
  dashboardSerieMensal: [
    '/dashboard/serie-mensal',
    '/dashboard/monthly-series',
    '/api/dashboard/serie-mensal',
    '/api/dashboard/monthly-series',
  ],
  planProjection: [
    '/planos/projecao-mensal',
    '/plans/monthly-projection',
    '/api/planos/projecao-mensal',
    '/api/plans/monthly-projection',
  ],
  recurrences: [
    '/configuracoes/recorrencias',
    '/settings/recurrences',
    '/api/configuracoes/recorrencias',
    '/api/settings/recurrences',
  ],
  settingsProfile: [
    '/configuracoes/perfil',
    '/settings/profile',
    '/api/configuracoes/perfil',
    '/api/settings/profile',
  ],
  settingsPassword: [
    '/configuracoes/senha',
    '/settings/password',
    '/api/configuracoes/senha',
    '/api/settings/password',
  ],
};

const memoryCache = new Map<RouteKey, string>();
const pending = new Map<RouteKey, Promise<string>>();

const getStorageKey = (key: RouteKey) => `${ROUTE_CACHE_PREFIX}:${key}:${baseURL}`;

const getCachedRoute = (key: RouteKey) => {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) ?? null;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(getStorageKey(key));
  if (stored) {
    memoryCache.set(key, stored);
    return stored;
  }
  return null;
};

const setCachedRoute = (key: RouteKey, path: string) => {
  memoryCache.set(key, path);
  if (typeof window !== 'undefined') {
    localStorage.setItem(getStorageKey(key), path);
  }
};

const normalizeCandidate = (path: string) => {
  if (!normalizedPrefix) {
    return path;
  }
  if (path.startsWith(normalizedPrefix + '/')) {
    return path.slice(normalizedPrefix.length);
  }
  return path;
};

const probeCandidate = async (path: string) => {
  if (!baseURL) {
    return false;
  }
  const url = `${baseURL}${path}`;
  try {
    const response = await fetch(url, { method: 'GET' });
    return response.status !== 404;
  } catch (error) {
    console.error('[Finance][Resolver] Falha ao testar rota', { url, error });
    return false;
  }
};

export const resolveRoute = async (key: RouteKey) => {
  const cached = getCachedRoute(key);
  if (cached) {
    return cached;
  }

  if (pending.has(key)) {
    return pending.get(key) as Promise<string>;
  }

  const resolverPromise = (async () => {
    if (!baseURL) {
      console.warn(
        '[Finance] VITE_API_URL nao configurada. Route resolver usando caminho padrao.'
      );
      const fallback = normalizeCandidate(routeCandidates[key][0]);
      return fallback;
    }
    for (const candidate of routeCandidates[key]) {
      const normalized = normalizeCandidate(candidate);
      const exists = await probeCandidate(normalized);
      if (exists) {
        setCachedRoute(key, normalized);
        return normalized;
      }
    }
    console.error('[Finance][Resolver] Nenhuma rota valida encontrada', {
      key,
      baseURL,
    });
    const fallback = normalizeCandidate(routeCandidates[key][0]);
    return fallback;
  })();

  pending.set(key, resolverPromise);
  const resolved = await resolverPromise;
  pending.delete(key);
  return resolved;
};

export const joinResolvedRoute = (basePath: string, suffix: string) => {
  const trimmedBase = basePath.replace(/\/+$/, '');
  const trimmedSuffix = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${trimmedBase}${trimmedSuffix}`;
};
