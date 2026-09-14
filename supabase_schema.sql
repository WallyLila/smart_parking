-- ==============================================================================
-- SMART PARKING IOT — SUPABASE DATABASE SETUP & REALTIME CONFIGURATION
-- ==============================================================================

-- 1. Create parking_slots table
CREATE TABLE IF NOT EXISTS public.parking_slots (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
    distance NUMERIC NOT NULL DEFAULT 185,
    light BOOLEAN NOT NULL DEFAULT false,
    sensor TEXT NOT NULL DEFAULT 'online',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create parking_activities table for logs
CREATE TABLE IF NOT EXISTS public.parking_activities (
    id BIGSERIAL PRIMARY KEY,
    slot_id INTEGER REFERENCES public.parking_slots(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert Initial Parking Slots Data (Slot 01 and Slot 02)
INSERT INTO public.parking_slots (id, name, status, distance, light, sensor)
VALUES 
    (1, 'Parking Slot 01', 'available', 185, true, 'online'),
    (2, 'Parking Slot 02', 'occupied', 42, false, 'online')
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    distance = EXCLUDED.distance,
    light = EXCLUDED.light,
    sensor = EXCLUDED.sensor;

-- 4. Insert Initial Activity Logs
INSERT INTO public.parking_activities (slot_id, text, status, created_at)
VALUES 
    (1, 'Slot 01 became available', 'available', NOW() - INTERVAL '2 minutes'),
    (2, 'Slot 02 became occupied', 'occupied', NOW() - INTERVAL '8 minutes'),
    (1, 'Ultrasonic sensor calibrated', 'sensor', NOW() - INTERVAL '12 minutes');

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_activities ENABLE ROW LEVEL SECURITY;

-- 6. Create Public Access Policies (Allows Frontend Dashboard & ESP32 to Read & Write)
CREATE POLICY "Allow public read on parking_slots" 
ON public.parking_slots FOR SELECT USING (true);

CREATE POLICY "Allow public update on parking_slots" 
ON public.parking_slots FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert on parking_slots" 
ON public.parking_slots FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on parking_activities" 
ON public.parking_activities FOR SELECT USING (true);

CREATE POLICY "Allow public insert on parking_activities" 
ON public.parking_activities FOR INSERT WITH CHECK (true);

-- 7. Enable Supabase Realtime for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_activities;
