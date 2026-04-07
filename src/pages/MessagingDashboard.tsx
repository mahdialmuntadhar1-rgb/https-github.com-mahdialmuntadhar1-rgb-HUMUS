import { useEffect, useMemo, useState } from 'react';
import { messagingService, Campaign, CampaignStats, CampaignBusiness, Conversation, IncomingReply } from '@/services/messaging';

type CampaignForm = {
  name: string;
  city: string;
  category: string;
  governorate: string;
  message: string;
  speed: number;
};

const defaultForm: CampaignForm = {
  name: '',
  city: '',
  category: '',
  governorate: '',
  message: '',
  speed: 2
};

export default function MessagingDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [replies, setReplies] = useState<IncomingReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [form, setForm] = useState<CampaignForm>(defaultForm);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId),
    [campaigns, selectedCampaignId]
  );

  const refreshCampaignData = async (campaignId?: string) => {
    const activeCampaignId = campaignId || selectedCampaignId;
    const fetchedCampaigns = await messagingService.getCampaigns();
    setCampaigns(fetchedCampaigns);

    if (!activeCampaignId && fetchedCampaigns.length) {
      setSelectedCampaignId(fetchedCampaigns[0].id);
      return;
    }

    if (activeCampaignId) {
      const [campaignStats, inboxConversations, incomingReplies] = await Promise.all([
        messagingService.getCampaignStats(activeCampaignId),
        messagingService.getConversations({ limit: 100 }),
        messagingService.getIncomingReplies({ campaign_id: activeCampaignId, limit: 200 })
      ]);

      setStats(campaignStats);
      setConversations(inboxConversations);
      setReplies(incomingReplies);
    }
  };

  useEffect(() => {
    setLoading(true);
    refreshCampaignData().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;

    const timer = window.setInterval(async () => {
      const campaignStats = await messagingService.getCampaignStats(selectedCampaignId);
      setStats(campaignStats);
      const latestReplies = await messagingService.getIncomingReplies({ campaign_id: selectedCampaignId, limit: 200 });
      setReplies(latestReplies);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [selectedCampaignId]);

  useEffect(() => {
    if (!workerRunning || !selectedCampaignId) return;

    const intervalMs = Math.max(2000, Math.floor(60000 / Math.max(1, form.speed)));

    const timer = window.setInterval(async () => {
      const runResult = await messagingService.runCampaignQueue(selectedCampaignId, form.speed);
      console.log('[QueueWorker]', {
        campaignId: selectedCampaignId,
        speedPerMinute: form.speed,
        intervalMs,
        ...runResult
      });

      if (runResult.attempted === 0) {
        setWorkerRunning(false);
      }

      await refreshCampaignData(selectedCampaignId);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [workerRunning, selectedCampaignId, form.speed]);

  const createCampaign = async () => {
    if (!form.name || !form.message.trim()) {
      alert('Campaign name and message are required.');
      return;
    }

    setCreating(true);

    try {
      const recipients: CampaignBusiness[] = await messagingService.getBusinessesForCampaign(
        {
          city: form.city || undefined,
          category: form.category || undefined,
          governorate: form.governorate || undefined
        },
        20
      );

      console.log('[TestingMode] Recipients limited to 20 businesses.', recipients);

      const campaign = await messagingService.createCampaign({
        name: form.name,
        description: `Filters: city=${form.city || 'any'}, category=${form.category || 'any'}, governorate=${form.governorate || 'any'} | speed=${form.speed}/min`,
        status: 'active',
        channel: 'whatsapp',
        message_template: form.message,
        total_recipients: recipients.length,
        sent_count: 0,
        delivered_count: 0,
        replied_count: 0,
        converted_count: 0,
        failed_count: 0,
        started_at: new Date().toISOString(),
        completed_at: undefined
      });

      const queueResult = await messagingService.queueCampaignMessages(campaign.id, recipients, form.message);
      console.log('[CampaignCreated]', {
        campaignId: campaign.id,
        campaignName: campaign.name,
        recipients: recipients.length,
        queued: queueResult.queued,
        failed: queueResult.failed,
        speedPerMinute: form.speed
      });

      await refreshCampaignData(campaign.id);
      setSelectedCampaignId(campaign.id);
      setWorkerRunning(true);
      setForm(defaultForm);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const messagesByBusiness = useMemo(() => {
    const map = new Map<string, IncomingReply[]>();
    replies.forEach((reply) => {
      const existing = map.get(reply.business_id) || [];
      map.set(reply.business_id, [...existing, reply]);
    });
    return map;
  }, [replies]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
          <h1 className="text-xl font-bold">Messaging Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Testing mode enabled (max 20 businesses per campaign).</p>

          <div className="mt-5 space-y-3">
            <input className="w-full rounded border p-2" placeholder="Campaign name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="City filter (optional)" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="Category filter (optional)" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="Governorate filter (optional)" value={form.governorate} onChange={(e) => setForm((prev) => ({ ...prev, governorate: e.target.value }))} />
            <textarea className="h-24 w-full rounded border p-2" placeholder="Message template" value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} />
            <label className="block text-sm font-medium">Speed (messages/minute)</label>
            <input
              type="number"
              min={1}
              max={20}
              className="w-full rounded border p-2"
              value={form.speed}
              onChange={(e) => setForm((prev) => ({ ...prev, speed: Number(e.target.value) }))}
            />
            <button
              className="w-full rounded bg-teal-600 px-3 py-2 font-semibold text-white disabled:opacity-60"
              disabled={creating}
              onClick={createCampaign}
            >
              {creating ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Live stats</h2>
              {selectedCampaign && (
                <p className="text-sm text-slate-600">{selectedCampaign.name}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                className="rounded border p-2 text-sm"
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
              >
                <option value="">Select campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              <button
                className="rounded border px-3 py-2 text-sm"
                onClick={() => setWorkerRunning((running) => !running)}
                disabled={!selectedCampaignId}
              >
                {workerRunning ? 'Pause worker' : 'Start worker'}
              </button>
            </div>
          </div>

          {loading ? <p>Loading...</p> : null}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Sent" value={stats?.messages_sent ?? 0} />
            <StatCard label="Delivered" value={stats?.delivered ?? 0} />
            <StatCard label="Replied" value={stats?.replied ?? 0} />
            <StatCard label="Converted" value={stats?.converted ?? 0} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Inbox (all replies)</h3>
              <div className="max-h-72 space-y-2 overflow-auto rounded border p-2">
                {replies.length === 0 && <p className="text-sm text-slate-500">No replies yet.</p>}
                {replies.map((reply) => (
                  <div key={reply.id} className="rounded border bg-slate-50 p-2 text-sm">
                    <div className="font-medium">Business: {reply.business_id}</div>
                    <div className="text-slate-600">{reply.reply_body}</div>
                    <div className="text-xs text-slate-500">{new Date(reply.received_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Conversations by business</h3>
              <div className="max-h-72 space-y-2 overflow-auto rounded border p-2">
                {conversations.length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="rounded border p-2">
                    <div className="text-sm font-medium">{conversation.business_id}</div>
                    <div className="text-xs text-slate-600">{conversation.phone}</div>
                    <div className="mt-1 text-sm">{conversation.last_message || 'No message yet'}</div>
                    <div className="mt-2 space-y-1">
                      {(messagesByBusiness.get(conversation.business_id) || []).map((message) => (
                        <div key={message.id} className="rounded bg-emerald-50 p-1 text-xs">
                          {message.reply_body}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border bg-slate-50 p-3">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
