import { supabase, isSupabaseConfigured } from './supabase';
import { initialParkingSlots, initialActivities } from '../data/mockData';

/**
 * Fetch all parking slots from Supabase or fallback to mock data
 */
export const getParkingSlots = async () => {
  if (!isSupabaseConfigured) {
    return initialParkingSlots;
  }

  try {
    const { data, error } = await supabase
      .from('parking_slots')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data;
    return initialParkingSlots;
  } catch (err) {
    console.warn('Failed to fetch parking slots from Supabase, using mock fallback:', err.message);
    return initialParkingSlots;
  }
};

/**
 * Fetch recent parking activities
 */
export const getRecentActivities = async () => {
  if (!isSupabaseConfigured) {
    return initialActivities;
  }

  try {
    const { data, error } = await supabase
      .from('parking_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((item) => ({
        id: item.id,
        text: item.text,
        time: item.time || 'Just now',
        status: item.status,
      }));
    }
    return initialActivities;
  } catch (err) {
    console.warn('Failed to fetch activities from Supabase, using mock fallback:', err.message);
    return initialActivities;
  }
};

/**
 * Update slot light in Supabase
 */
export const toggleSlotLight = async (slotId, currentLight) => {
  const newLight = !currentLight;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('parking_slots')
        .update({ light: newLight, updated_at: new Date().toISOString() })
        .eq('id', slotId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating light status in Supabase:', err);
    }
  }

  return newLight;
};

/**
 * Update slot status and distance in Supabase (used by simulation or ESP32)
 */
export const updateSlotStatusInDb = async (slotId, newStatus, newDistance) => {
  if (isSupabaseConfigured) {
    try {
      // 1. Update parking slot
      const { error: slotErr } = await supabase
        .from('parking_slots')
        .update({
          status: newStatus,
          distance: newDistance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', slotId);

      if (slotErr) throw slotErr;

      // 2. Insert into activities
      const { error: actErr } = await supabase
        .from('parking_activities')
        .insert({
          slot_id: slotId,
          text: `Slot 0${slotId} became ${newStatus}`,
          status: newStatus,
          created_at: new Date().toISOString(),
        });

      if (actErr) console.warn('Could not insert activity log:', actErr.message);
    } catch (err) {
      console.error('Error updating slot status in Supabase:', err);
    }
  }
};

/**
 * Subscribe to Supabase Realtime changes for parking slots
 */
export const subscribeToSlotChanges = (onUpdate) => {
  if (!isSupabaseConfigured) return null;

  const channel = supabase
    .channel('realtime_parking_slots')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'parking_slots' },
      (payload) => {
        console.log('[Supabase Realtime] parking_slots update received:', payload);
        if (payload.new && onUpdate) {
          onUpdate(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log('[Supabase Realtime] parking_slots subscription status:', status);
    });

  return channel;
};

/**
 * Subscribe to Supabase Realtime changes for new activities
 */
export const subscribeToActivityChanges = (onNewActivity) => {
  if (!isSupabaseConfigured) return null;

  const channel = supabase
    .channel('realtime_parking_activities')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'parking_activities' },
      (payload) => {
        console.log('[Supabase Realtime] parking_activities insert received:', payload);
        if (payload.new && onNewActivity) {
          onNewActivity({
            id: payload.new.id,
            text: payload.new.text,
            time: 'Just now',
            status: payload.new.status,
          });
        }
      }
    )
    .subscribe((status) => {
      console.log('[Supabase Realtime] parking_activities subscription status:', status);
    });

  return channel;
};
