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

  // ==================== MESSAGES ====================

  async sendMessage(input: SendMessageInput): Promise<Message> {
    if (!supabase) throw new Error('Supabase not initialized');

    // Validate business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, phone')
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

    // Update or create conversation
    await this.upsertConversation({
      business_id: input.business_id,
      phone: input.phone,
      last_outbound_message_id: message.id,
      last_message: input.message_body,
      last_message_at: new Date().toISOString()
    });

    // TODO: Integrate with WhatsApp/Telegram API here
    // For now, message stays in 'pending' status until webhook updates it
    // Example: await this.sendViaWhatsAppAPI(message);

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

    // Update campaign stats if campaign_id provided
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

    if (filters?.business_id) {
      query = query.eq('business_id', filters.business_id);
    }
    if (filters?.campaign_id) {
      query = query.eq('campaign_id', filters.campaign_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.phone) {
      query = query.eq('phone', filters.phone);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

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

    if (filters?.business_id) {
      query = query.eq('business_id', filters.business_id);
    }
    if (filters?.phone) {
      query = query.eq('phone', filters.phone);
    }
    if (filters?.replied !== undefined) {
      query = query.eq('replied', filters.replied);
    }
    if (filters?.converted !== undefined) {
      query = query.eq('converted', filters.converted);
    }

    query = query.order('updated_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  async upsertConversation(conversation: Partial<Conversation> & { business_id: string; phone: string }): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('conversations')
      .upsert({
        ...conversation,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'business_id,phone'
      });

    if (error) throw error;
  }

  async markAsConverted(input: MarkConvertedInput): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    // Get conversation to find business_id and phone
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', input.conversation_id)
      .single();

    if (fetchError || !conversation) {
      throw new Error('Conversation not found');
    }

    // Update conversation
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

    // Update related messages to 'converted' status
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

  /**
   * For testing: Simulate an incoming reply (manually trigger webhook logic)
   * This should only be used in development/testing
   */
  async simulateReply(
    businessId: string,
    phone: string,
    messageText: string
  ): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('simulateReply is for testing only');
    }

    if (!supabase) throw new Error('Supabase not initialized');

    const timestamp = new Date().toISOString();

    // Find the most recent outbound message
    const { data: outboundMessage } = await supabase
      .from('messages')
      .select('id, campaign_id')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .in('status', ['sent', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (outboundMessage) {
      // Update message status
      await supabase
        .from('messages')
        .update({ status: 'replied', replied_at: timestamp })
        .eq('id', outboundMessage.id);

      // Update campaign stats
      if (outboundMessage.campaign_id) {
        await supabase.rpc('update_campaign_stats', { 
          p_campaign_id: outboundMessage.campaign_id 
        });
      }
    }

    // Upsert conversation
    await this.upsertConversation({
      business_id: businessId,
      phone: phone,
      last_message: messageText,
      last_message_at: timestamp,
      last_outbound_message_id: outboundMessage?.id,
      replied: true,
      message_count: outboundMessage ? 2 : 1
    });
  }
}

export const messagingService = new MessagingService();
