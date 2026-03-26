interface Queue {
  send(message: unknown): Promise<void>;
}

interface QueueMessage<T> {
  body: T;
  ack(): void;
  retry(): void;
}

interface MessageBatch<T> {
  messages: Array<QueueMessage<T>>;
}

interface ScheduledEvent {}

interface ExecutionContext {}
