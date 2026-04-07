-- Incoming replies storage for CRM inbox views
CREATE TABLE IF NOT EXISTS incoming_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    reply_body TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'telegram')),
    external_message_id TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE incoming_replies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'incoming_replies' AND policyname = 'Users can view incoming replies tied to their campaigns'
    ) THEN
        CREATE POLICY "Users can view incoming replies tied to their campaigns" ON incoming_replies
            FOR SELECT USING (
                auth.jwt() ->> 'role' IN ('admin', 'service_role') OR EXISTS (
                    SELECT 1 FROM messages m
                    JOIN campaigns c ON c.id = m.campaign_id
                    WHERE m.business_id = incoming_replies.business_id
                    AND m.phone = incoming_replies.phone
                    AND c.created_by = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'incoming_replies' AND policyname = 'Service role can manage incoming replies'
    ) THEN
        CREATE POLICY "Service role can manage incoming replies" ON incoming_replies
            FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_incoming_replies_business_phone ON incoming_replies(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_incoming_replies_received_at ON incoming_replies(received_at DESC);
