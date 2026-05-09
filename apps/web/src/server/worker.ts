/**
 * Background worker entry point for ShowUp2Move.
 * Runs periodic tasks: matching refresh, notification dispatch, AI enrichment.
 *
 * Usage: node apps/web/src/server/worker.js
 */

const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS ?? 30_000);

interface WorkerTask {
  name: string;
  run: () => void;
}

function log(task: string, message: string, level: "info" | "warn" | "error" = "info") {
  const entry = {
    service: "worker",
    level,
    task,
    message,
    at: new Date().toISOString()
  };

  console.log(JSON.stringify(entry));
}

const tasks: WorkerTask[] = [
  {
    name: "heartbeat",
    run: () => log("heartbeat", "Worker is alive")
  },
  {
    name: "matching_refresh",
    run: () => {
      log("matching_refresh", "Checking for pending match recalculations");
      // Placeholder: will query database for users needing match refresh
    }
  },
  {
    name: "notification_dispatch",
    run: () => {
      log("notification_dispatch", "Checking for pending notifications");
      // Placeholder: will process notification queue
    }
  },
  {
    name: "ai_enrichment",
    run: () => {
      log("ai_enrichment", "Draining AI enrichment queue");
      // Placeholder: will process AI profile enrichment jobs
    }
  }
];

function tick() {
  for (const task of tasks) {
    try {
      task.run();
    } catch (error) {
      log(task.name, String(error), "error");
    }
  }
}

log("startup", `Worker starting with interval ${INTERVAL_MS}ms`);
tick();

const interval = setInterval(tick, INTERVAL_MS);

function shutdown(signal: string) {
  log("shutdown", `Received ${signal}, stopping gracefully`);
  clearInterval(interval);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
