import { supabase } from './supabase';

// Types for CRM messaging
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  channel: 'whatsapp' | 'telegram';
  message_template?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  replied_count: number;
  converted_count: number;
  failed_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface Message {
  id: string;
  campaign_id?: string;
  business_id: string;
  phone: string;
  message_body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'replied' | 'converted';
  channel: 'whatsapp' | 'telegram';
  external_message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  replied_at?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  phone: string;
  last_message?: string;
  last_message_at?: string;
  last_outbound_message_id?: string;
  message_count: number;
  replied: boolean;
  converted: boolean;
  converted_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomingReply {
  id: string;
  business_id: string;
  phone: string;
  reply_body: string;
  channel: 'whatsapp' | 'telegram';
  external_message_id?: string;
  received_at: string;
  created_at: string;
}

export interface CampaignStats {
  id: string;
  name: string;
  status: string;
  channel: string;
  total_recipients: number;
  messages_sent: number;
  delivered: number;
  replied: number;
  converted: number;
  failed: number;
  delivery_rate: number;
  conversion_rate: number;
  created_at: string;
}

export interface SendMessageInput {
  business_id: string;
  phone: string;
  message_body: string;
  campaign_id?: string;
  channel?: 'whatsapp' | 'telegram';
}

export interface MarkConvertedInput {
  conversation_id: string;
  converted_value?: number;
  notes?: string;
}

export interface CampaignFilters {
  city?: string;
  category?: string;
  governorate?: string;
}

export interface CampaignBusiness {
  id: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  category?: string;
}

export interface QueueRunResult {
  attempted: number;
  sent: number;
  failed: number;
}

class MessagingService {
  // ==================== CAMPAIGNS ====================

  async getCampaigns(): Promise<Campaign[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<Campaign> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteCampaign(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getBusinessesForCampaign(filters: CampaignFilters = {}, limit = 20): Promise<CampaignBusiness[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase
      .from('businesses')
      .select('id, name, phone, whatsapp, city, category')
      .limit(limit);

    if (filters.city) query = query.eq('city', filters.city);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.governorate) query = query.eq('governorate', filters.governorate);

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).filter((business: CampaignBusiness) => business.phone || business.whatsapp);
  }

  async runCampaignQueue(campaignId: string, speedPerMinute: number): Promise<QueueRunResult> {
    if (!supabase) throw new Error('Supabase not initialized');

    const safeSpeed = Math.max(1, Math.floor(speedPerMinute || 1));
    const batchSize = Math.min(20, safeSpeed);

    const { data: pendingMessages, error: pendingError } = await supabase
      .from('messages')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (pendingError) throw pendingError;

    if (!pendingMessages?.length) {
      return { attempted: 0, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const pendingMessage of pendingMessages) {
      try {
        const externalMessageId = `test-${campaignId.slice(0, 8)}-${pendingMessage.id.slice(0, 8)}-${Date.now()}`;
        await this.updateMessageStatus(pendingMessage.id, 'sent', { external_message_id: externalMessageId });
        sent += 1;
      } catch (error) {
        await this.updateMessageStatus(pendingMessage.id, 'failed', {
          error_message: error instanceof Error ? error.message : 'Unknown send failure'
        });
        failed += 1;
      }
    }

    await supabase.rpc('update_campaign_stats', { p_campaign_id: campaignId });

    return { attempted: pendingMessages.length, sent, failed };
  }

  async queueCampaignMessages(campaignId: string, recipients: CampaignBusiness[], messageBody: string): Promise<{ queued: number; failed: number }> {
    const inputs: SendMessageInput[] = recipients.map((recipient) => ({
      business_id: recipient.id,
      phone: recipient.whatsapp || recipient.phone || '',
      message_body: messageBody,
      campaign_id: campaignId,
      channel: 'whatsapp'
    }));

    const result = await this.sendBulkMessages(inputs, campaignId);

    return {
      queued: result.success.length,
      failed: result.failed.length
    };
  }

  // ==================== MESSAGES ====================

  async sendMessage(input: SendMessageInput): Promise<Message> {
    if (!supabase) throw new Error('Supabase not initialized');

    // Validate business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, phone, whatsapp')
      .eq('id', input.business_id)
      .single();

    if (businessError || !business) {
      throw new Error(`Business not found: ${input.business_id}`);
    }

    // Create message record
    const messageData = {
      campaign_id: input.campaign_id || null,
      business_id: input.business_id,
      phone: input.phone,
      message_body: input.message_body,
      status: 'pending',
      channel: input.channel || 'whatsapp'
    };

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (messageError) throw messageError;

    await this.upsertConversation({
      business_id: input.business_id,
      phone: input.phone,
      last_outbound_message_id: message.id,
      last_message: input.message_body,
      last_message_at: new Date().toISOString(),
      message_count: 1
    });

    return message;
  }

  async sendBulkMessages(
    inputs: SendMessageInput[],
    campaign_id?: string
  ): Promise<{ success: Message[]; failed: { input: SendMessageInput; error: string }[] }> {
    const success: Message[] = [];
    const failed: { input: SendMessageInput; error: string }[] = [];

    for (const input of inputs) {
      try {
        const message = await this.sendMessage({ ...input, campaign_id });
        success.push(message);
      } catch (error) {
        failed.push({
          input,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (campaign_id && success.length > 0) {
      await supabase?.rpc('update_campaign_stats', { p_campaign_id: campaign_id });
    }

    return { success, failed };
  }

  async getMessages(filters?: {
    business_id?: string;
    campaign_id?: string;
    status?: string;
    phone?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ messages: Message[]; count: number }> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' });

    if (filters?.business_id) query = query.eq('business_id', filters.business_id);
    if (filters?.campaign_id) query = query.eq('campaign_id', filters.campaign_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.phone) query = query.eq('phone', filters.phone);

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { messages: data || [], count: count || 0 };
  }

  async updateMessageStatus(
    messageId: string,
    status: Message['status'],
    options?: { error_message?: string; external_message_id?: string }
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const updates: Partial<Message> = { status };

    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'replied') updates.replied_at = new Date().toISOString();
    if (status === 'converted') updates.converted_at = new Date().toISOString();
    if (options?.error_message) updates.error_message = options.error_message;
    if (options?.external_message_id) updates.external_message_id = options.external_message_id;

    const { error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId);

    if (error) throw error;
  }

  // ==================== CONVERSATIONS ====================

  async getConversations(filters?: {
    business_id?: string;
    phone?: string;
    replied?: boolean;
    converted?: boolean;
    limit?: number;
  }): Promise<Conversation[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase
      .from('conversations')
      .select('*');

    if (filters?.business_id) query = query.eq('business_id', filters.business_id);
    if (filters?.phone) query = query.eq('phone', filters.phone);
    if (filters?.replied !== undefined) query = query.eq('replied', filters.replied);
    if (filters?.converted !== undefined) query = query.eq('converted', filters.converted);

    query = query.order('updated_at', { ascending: false });

    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async upsertConversation(conversation: Partial<Conversation> & { business_id: string; phone: string }): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: existing } = await supabase
      .from('conversations')
      .select('message_count')
      .eq('business_id', conversation.business_id)
      .eq('phone', conversation.phone)
      .maybeSingle();

    const { error } = await supabase
      .from('conversations')
      .upsert({
        ...conversation,
        message_count: conversation.message_count ?? (existing?.message_count || 0) + 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'business_id,phone'
      });

    if (error) throw error;
  }

  async markAsConverted(input: MarkConvertedInput): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', input.conversation_id)
      .single();

    if (fetchError || !conversation) {
      throw new Error('Conversation not found');
    }

    const { error: convError } = await supabase
      .from('conversations')
      .update({
        converted: true,
        converted_value: input.converted_value,
        notes: input.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', input.conversation_id);

    if (convError) throw convError;

    const { error: msgError } = await supabase
      .from('messages')
      .update({
        status: 'converted',
        converted_at: new Date().toISOString()
      })
      .eq('business_id', conversation.business_id)
      .eq('phone', conversation.phone)
      .in('status', ['sent', 'delivered', 'replied']);

    if (msgError) throw msgError;
  }

  async saveIncomingReply(payload: {
    business_id: string;
    phone: string;
    reply_body: string;
    channel?: 'whatsapp' | 'telegram';
    external_message_id?: string;
    received_at?: string;
  }): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const receivedAt = payload.received_at || new Date().toISOString();

    const { error: replyError } = await supabase
      .from('incoming_replies')
      .insert([{
        business_id: payload.business_id,
        phone: payload.phone,
        reply_body: payload.reply_body,
        channel: payload.channel || 'whatsapp',
        external_message_id: payload.external_message_id,
        received_at: receivedAt
      }]);

    if (replyError) throw replyError;

    const { data: outboundMessage } = await supabase
      .from('messages')
      .select('id, campaign_id')
      .eq('business_id', payload.business_id)
      .eq('phone', payload.phone)
      .in('status', ['sent', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (outboundMessage?.id) {
      await this.updateMessageStatus(outboundMessage.id, 'replied');
      if (outboundMessage.campaign_id) {
        await supabase.rpc('update_campaign_stats', {
          p_campaign_id: outboundMessage.campaign_id
        });
      }
    }

    await this.upsertConversation({
      business_id: payload.business_id,
      phone: payload.phone,
      last_message: payload.reply_body,
      last_message_at: receivedAt,
      replied: true,
      last_outbound_message_id: outboundMessage?.id
    });
  }

  async getIncomingReplies(filters?: { business_id?: string; campaign_id?: string; limit?: number }): Promise<IncomingReply[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase
      .from('incoming_replies')
      .select('*')
      .order('received_at', { ascending: false });

    if (filters?.business_id) {
      query = query.eq('business_id', filters.business_id);
    }

    if (filters?.campaign_id) {
      const { data: campaignMessages } = await supabase
        .from('messages')
        .select('business_id')
        .eq('campaign_id', filters.campaign_id);

      const businessIds = [...new Set((campaignMessages || []).map((m: { business_id: string }) => m.business_id))];
      if (businessIds.length === 0) return [];

      query = query.in('business_id', businessIds);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // ==================== STATS & REPORTING ====================

  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('campaign_stats')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) return null;
    return data;
  }

  async getAllCampaignStats(): Promise<CampaignStats[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('campaign_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getConversationSummary(): Promise<any[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('conversation_summary')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==================== UTILITY ====================

  async simulateReply(
    businessId: string,
    phone: string,
    messageText: string
  ): Promise<void> {
    if (import.meta.env.PROD) {
      throw new Error('simulateReply is for testing only');
    }

    if (!supabase) throw new Error('Supabase not initialized');

    await this.saveIncomingReply({
      business_id: businessId,
      phone,
      reply_body: messageText,
      channel: 'whatsapp'
    });
  }
}

export const messagingService = new MessagingService();
