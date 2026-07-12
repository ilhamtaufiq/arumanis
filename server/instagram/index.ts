export {
  DEFAULT_GRAPH_BASE,
  DEFAULT_GRAPH_VERSION,
  META_WEBHOOK_PATH,
  getMetaCapabilityFlags,
  getMetaConfigStatus,
  getMetaInstagramConfig,
  graphUrl,
} from './config.ts'

export {
  MetaGraphError,
  fetchInstagramBusinessProfile,
  fetchInstagramMedia,
  probeMetaToken,
  sendInstagramTextMessage,
} from './client.ts'

export {
  normalizeMetaWebhookEvents,
  parseMetaWebhookPayload,
  parseMetaWebhookVerifyQuery,
  summarizeMetaWebhook,
  verifyMetaWebhookSignature,
  verifyMetaWebhookSubscription,
} from './webhook.ts'

export {
  processMetaWebhookPayload,
  syncInstagramMediaAndProfile,
} from './ingest.ts'

export {
  appendOutboundMessage,
  getInstagramStoreSnapshot,
  markThreadRead,
  saveMediaAndProfile,
} from './store.ts'

export type {
  InstagramStoreData,
  StoredInstagramComment,
  StoredInstagramMessage,
  StoredInstagramThread,
  StoredWebhookEvent,
} from './store.ts'

export type * from './types.ts'
