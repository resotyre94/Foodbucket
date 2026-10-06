import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ACTIVE_PLATFORMS, buildNormalizedComparisons, FUTURE_PLATFORMS, QATAR_ZONES } from './src/providers/ProviderSystem';
import { PlatformId } from './src/types/food';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health & Provider Architecture Info endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      service: 'Food Bucket Qatar Backend API',
      status: 'ok',
      activeProviders: ACTIVE_PLATFORMS.map((p) => p.id),
      plannedConnectors: FUTURE_PLATFORMS.map((p) => p.id),
      zones: QATAR_ZONES.map((z) => z.id),
      livePartnerCredentialsConfigured: {
        talabat: Boolean(process.env.TALABAT_PARTNER_API_KEY),
        snoonu: Boolean(process.env.SNOONU_PARTNER_API_KEY),
        rafeeq: Boolean(process.env.RAFEEQ_PARTNER_API_KEY),
        keeta: Boolean(process.env.KEETA_PARTNER_API_KEY),
      },
    });
  });

  // Synchronize & aggregate all Qatar food delivery providers
  app.post('/api/sync', (req, res) => {
    const {
      zoneId = 'west_bay',
      mode = 'demo',
      failedProviders = [],
    }: {
      zoneId?: string;
      mode?: 'demo' | 'live_api';
      failedProviders?: PlatformId[];
    } = req.body || {};

    const syncedAtIso = new Date().toISOString();

    // Never pretend demo data is live if live_api mode is requested without partner keys
    if (mode === 'live_api') {
      const configuredKeys = {
        talabat: Boolean(process.env.TALABAT_PARTNER_API_KEY),
        snoonu: Boolean(process.env.SNOONU_PARTNER_API_KEY),
        rafeeq: Boolean(process.env.RAFEEQ_PARTNER_API_KEY),
        keeta: Boolean(process.env.KEETA_PARTNER_API_KEY),
      };

      const anyConfigured = Object.values(configuredKeys).some(Boolean);
      if (!anyConfigured) {
        return res.json({
          mode: 'live_api',
          isDemoData: false,
          liveDataAvailable: false,
          message: 'Live data unavailable — Authorized partner API credentials are not configured on the server.',
          syncedAtIso,
          providerStates: ACTIVE_PLATFORMS.map((p) => ({
            platformId: p.id,
            status: 'unavailable_live',
            lastSyncedIso: null,
            errorMessage: 'Data unavailable (Authorized Partner Feed required)',
          })),
          items: [],
          restaurants: [],
          offers: [],
        });
      }
    }

    const comparisonData = buildNormalizedComparisons({
      zoneId,
      failedProviders,
      lastSyncedIso: syncedAtIso,
    });

    const providerStates = ACTIVE_PLATFORMS.map((p) => {
      const isFailed = failedProviders.includes(p.id);
      return {
        platformId: p.id,
        status: isFailed ? 'failed' : 'available',
        lastSyncedIso: isFailed ? null : syncedAtIso,
        errorMessage: isFailed ? `${p.name} data temporarily unavailable` : undefined,
        latencyMs: isFailed ? undefined : Math.floor(110 + Math.random() * 90),
      };
    });

    return res.json({
      mode: 'demo',
      isDemoData: true,
      liveDataAvailable: false,
      syncedAtIso,
      providerStates,
      ...comparisonData,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Bucket server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
