import PocketBase from 'pocketbase';

/**
 * Validação rigorosa de URL contra ataques de injeção de protocolo (ex: javascript:, data:)
 */
function getSanitizedServerUrl(): string {
  const envUrl = (import.meta.env.VITE_AREIAPRETA_URL || '').trim();
  if (!envUrl) {
    return 'http://127.0.0.1:8090';
  }
  try {
    const parsed = new URL(envUrl);
    // Somente protocolos http e https são autorizados
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin + (parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '');
    }
  } catch {
    // URL malformada rejeitada por segurança
  }
  return 'http://127.0.0.1:8090';
}

export const AREIAPRETA_URL = getSanitizedServerUrl();

export const pb = new PocketBase(AREIAPRETA_URL);

/**
 * Sanitizador de texto contra Cross-Site Scripting (XSS) e injeção de HTML
 */
export function sanitizeText(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '') // Elimina delimitadores de tags HTML/XML
    .replace(/javascript:/gi, '') // Elimina pseudo-protocolo de script
    .replace(/on\w+=/gi, '') // Elimina event handlers (ex: onload=, onclick=)
    .trim()
    .slice(0, maxLength);
}

/**
 * Utilitário seguro para análise de JSON contra Prototype Pollution
 */
export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    // Impede Prototype Pollution verificando se é objeto direto
    if (parsed && typeof parsed === 'object') {
      delete (parsed as any).__proto__;
      delete (parsed as any).constructor;
      delete (parsed as any).prototype;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Utilitário seguro para verificar a integridade e latência da conexão com o banco de dados AreiaPreta
 */
export async function checkAreiaPretaHealth(): Promise<{ online: boolean; message: string; latency?: number }> {
  const start = performance.now();
  try {
    const health = await pb.health.check();
    const latency = Math.round(performance.now() - start);
    return {
      online: health.code === 200,
      message: health.message || 'Serviço operacional',
      latency,
    };
  } catch (error: any) {
    return {
      online: false,
      message: sanitizeText(error?.message || 'Servidor AreiaPreta inacessível ou offline', 120),
    };
  }
}
