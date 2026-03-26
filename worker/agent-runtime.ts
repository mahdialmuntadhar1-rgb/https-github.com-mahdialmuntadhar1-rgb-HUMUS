interface Env {
  RUN_LOOP_ENDPOINT: string;
  INTERNAL_ORCHESTRATOR_TOKEN?: string;
  AGENT_TASK_QUEUE: Queue;
}

interface QueueMessage {
  trigger: 'cron' | 'manual';
  at: string;
}

async function triggerRunLoop(env: Env, reason: QueueMessage['trigger']) {
  const runLoopUrl = new URL(env.RUN_LOOP_ENDPOINT, 'http://127.0.0.1:3000').toString();

  const response = await fetch(runLoopUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(env.INTERNAL_ORCHESTRATOR_TOKEN
        ? { authorization: `Bearer ${env.INTERNAL_ORCHESTRATOR_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ reason, triggeredAt: new Date().toISOString() }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Run-loop trigger failed (${response.status}): ${body}`);
  }
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await env.AGENT_TASK_QUEUE.send({ trigger: 'cron', at: new Date().toISOString() });
  },

  async queue(batch: MessageBatch<QueueMessage>, env: Env, _ctx: ExecutionContext) {
    for (const message of batch.messages) {
      try {
        await triggerRunLoop(env, message.body.trigger);
        message.ack();
      } catch (error) {
        console.error('Queue processing error', error);
        message.retry();
      }
    }
  },

  async fetch(): Promise<Response> {
    return new Response('18-AGENTS worker runtime alive', { status: 200 });
  },
};
