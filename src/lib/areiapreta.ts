import PocketBase from 'pocketbase';

export const AREIAPRETA_URL = import.meta.env.VITE_AREIAPRETA_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(AREIAPRETA_URL);

/**
 * Utilitário para verificar a integridade e latência da conexão com o banco de dados AreiaPreta
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
      message: error?.message || 'Servidor AreiaPreta inacessível ou offline',
    };
  }
}
