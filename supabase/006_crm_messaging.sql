-- CRM Messaging System Migration
-- Creates campaigns, messages, and conversations tables
-- Compatible with existing businesses.id (TEXT type)
-- Safe to run multiple times (idempotent)

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'telegram')),
    message_template TEXT,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Enable RLS on campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Users can view own campaigns'
    ) THEN
        CREATE POLICY "Users can view own campaigns" ON campaigns
            FOR SELECT USING (created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Users can insert own campaigns'
    ) THEN
        CREATE POLICY "Users can insert own campaigns" ON campaigns
            FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Users can update own campaigns'
    ) THEN
        CREATE POLICY "Users can update own campaigns" ON campaigns
            FOR UPDATE USING (created_by = auth.uid());
    END IF;
END
$$;

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    -- business_id is TEXT to match businesses.id (not UUID)
    -- Foreign key intentionally omitted due to TEXT type mismatch
    -- Use application-level validation to ensure business exists
    business_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'replied', 'converted')),
    channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'telegram')),
    external_message_id TEXT, -- WhatsApp/Telegram message ID for tracking
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages for their campaigns'
    ) THEN
        CREATE POLICY "Users can view messages for their campaigns" ON messages
            FOR SELECT USING (
                campaign_id IS NULL OR 
                EXISTS (
                    SELECT 1 FROM campaigns WHERE campaigns.id = messages.campaign_id 
                    AND (campaigns.created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
                )
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Service role can manage messages'
    ) THEN
        CREATE POLICY "Service role can manage messages" ON messages
            FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$;

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- business_id is TEXT to match businesses.id (not UUID)
    -- Foreign key intentionally omitted due to TEXT type mismatch
    business_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    last_outbound_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    message_count INTEGER DEFAULT 0,
    replied BOOLEAN DEFAULT FALSE,
    converted BOOLEAN DEFAULT FALSE,
    converted_value DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure unique conversation per business+phone combination
    CONSTRAINT unique_business_phone UNIQUE (business_id, phone)
);

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view conversations'
    ) THEN
        CREATE POLICY "Users can view conversations" ON conversations
            FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'service_role') OR EXISTS (
                SELECT 1 FROM messages 
                JOIN campaigns ON messages.campaign_id = campaigns.id
                WHERE messages.business_id = conversations.business_id
                AND campaigns.created_by = auth.uid()
            ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Service role can manage conversations'
    ) THEN
        CREATE POLICY "Service role can manage conversations" ON conversations
            FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_business_id ON messages(business_id);
CREATE INDEX IF NOT EXISTS idx_messages_phone ON messages(phone);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status_created_at ON messages(status, created_at DESC);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_replied ON conversations(replied) WHERE replied = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversations_converted ON conversations(converted) WHERE converted = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Campaigns table indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tr_messages_updated_at'
    ) THEN
        CREATE TRIGGER tr_messages_updated_at
            BEFORE UPDATE ON messages
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Apply trigger to conversations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tr_conversations_updated_at'
    ) THEN
        CREATE TRIGGER tr_conversations_updated_at
            BEFORE UPDATE ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Apply trigger to campaigns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tr_campaigns_updated_at'
    ) THEN
        CREATE TRIGGER tr_campaigns_updated_at
            BEFORE UPDATE ON campaigns
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- ============================================
-- HELPER FUNCTION: Update campaign statistics
-- ============================================
CREATE OR REPLACE FUNCTION update_campaign_stats(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE campaigns
    SET 
        sent_count = (SELECT COUNT(*) FROM messages WHERE campaign_id = p_campaign_id AND status IN ('sent', 'delivered', 'replied', 'converted')),
        delivered_count = (SELECT COUNT(*) FROM messages WHERE campaign_id = p_campaign_id AND status IN ('delivered', 'replied', 'converted')),
        replied_count = (SELECT COUNT(*) FROM messages WHERE campaign_id = p_campaign_id AND status IN ('replied', 'converted')),
        converted_count = (SELECT COUNT(*) FROM messages WHERE campaign_id = p_campaign_id AND status = 'converted'),
        failed_count = (SELECT COUNT(*) FROM messages WHERE campaign_id = p_campaign_id AND status = 'failed'),
        updated_at = NOW()
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Campaign performance summary view
CREATE OR REPLACE VIEW campaign_stats AS
SELECT 
    c.id,
    c.name,
    c.status,
    c.channel,
    c.total_recipients,
    COUNT(m.id) as messages_sent,
    COUNT(CASE WHEN m.status = 'delivered' THEN 1 END) as delivered,
    COUNT(CASE WHEN m.status = 'replied' THEN 1 END) as replied,
    COUNT(CASE WHEN m.status = 'converted' THEN 1 END) as converted,
    COUNT(CASE WHEN m.status = 'failed' THEN 1 END) as failed,
    ROUND(COUNT(CASE WHEN m.status IN ('delivered', 'replied', 'converted') THEN 1 END)::DECIMAL / NULLIF(COUNT(m.id), 0) * 100, 2) as delivery_rate,
    ROUND(COUNT(CASE WHEN m.status = 'converted' THEN 1 END)::DECIMAL / NULLIF(COUNT(m.id), 0) * 100, 2) as conversion_rate,
    c.created_at
FROM campaigns c
LEFT JOIN messages m ON m.campaign_id = c.id
GROUP BY c.id, c.name, c.status, c.channel, c.total_recipients, c.created_at;

-- Conversation summary view with business info
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
    conv.id,
    conv.business_id,
    conv.phone,
    conv.last_message,
    conv.last_message_at,
    conv.replied,
    conv.converted,
    conv.converted_value,
    conv.message_count,
    conv.updated_at,
    m.status as last_outbound_status,
    m.message_body as last_outbound_message
FROM conversations conv
LEFT JOIN messages m ON m.id = conv.last_outbound_message_id;

-- Add comments documenting foreign key decisions
COMMENT ON TABLE messages IS 'CRM messages table. business_id is TEXT (not UUID) to match businesses.id. No FK constraint due to type mismatch - enforce at application level.';
COMMENT ON TABLE conversations IS 'CRM conversations table. business_id is TEXT (not UUID) to match businesses.id. No FK constraint due to type mismatch - enforce at application level.';
COMMENT ON COLUMN messages.business_id IS 'References businesses.id (TEXT type). Application must validate business exists before insert.';
COMMENT ON COLUMN conversations.business_id IS 'References businesses.id (TEXT type). Application must validate business exists before insert.';
