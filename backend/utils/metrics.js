/**
 * utils/metrics.js
 * Prometheus-compatible metrics, exposed at GET /metrics.
 * Point a Prometheus/Grafana stack at this in production for dashboards
 * and alerting (e.g. "alert if p95 latency > 2s" or "alert if fallback
 * rate > 20%").
 */

const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register }); // process CPU, memory, event loop lag, etc.

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
});

const chatSourceCounter = new client.Counter({
  name: 'lexbot_chat_source_total',
  help: 'Count of bot replies by source (local_db, gemini_api, claude_api, fallback)',
  labelNames: ['source'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(chatSourceCounter);

/** Express middleware: times every request and records it in the histogram. */
function metricsMiddleware(req, res, next) {
  const endTimer = httpRequestDuration.startTimer();
  res.on('finish', () => {
    // req.route may be undefined for 404s — fall back to raw path
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path;
    endTimer({ method: req.method, route, status_code: res.statusCode });
  });
  next();
}

module.exports = { register, metricsMiddleware, chatSourceCounter };
