import { supabase } from './supabase';

// Utility to convert dataURL to Blob for storage
function dataURLtoBlob(dataURL: string): Blob {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export const api = {
  auth: {
    login: async (email: string, password: string, role: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { token: data.session?.access_token, user: { ...data.user, role } };
    },
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  },

  items: {
    list: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
      let query = supabase.from('items').select('*', { count: 'exact' });
      
      if (params?.category) query = query.eq('category', params.category);
      if (params?.search)   query = query.or(`name.ilike.%${params.search}%,barcode.ilike.%${params.search}%,location.ilike.%${params.search}%`);
      
      const page = params?.page || 1;
      const limit = params?.limit || 100;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      return data;
    },

    stats: async () => {
      const { data: items } = await supabase.from('items').select('category, stock');
      const { count: openComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open');
      const { count: resolvedComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'resolved');
      const { count: totalScans } = await supabase.from('scan_records').select('*', { count: 'exact', head: true });

      const byCategory = (items || []).reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      return {
        totalItems: items?.length || 0,
        byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
        openComplaints: openComplaints || 0,
        resolvedComplaints: resolvedComplaints || 0,
        totalScans: totalScans || 0,
      };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },

    getByBarcode: async (code: string) => {
      const { data, error } = await supabase.from('items').select('*').eq('barcode', code).single();
      if (error) throw error;
      return data;
    },

    create: async (data: any) => {
      let photoUrl = null;
      if (data.photoDataUrl) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const blob = dataURLtoBlob(data.photoDataUrl);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inventory')
          .upload(`photos/${fileName}`, blob);
        
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('inventory').getPublicUrl(`photos/${fileName}`);
        photoUrl = publicUrl;
      }

      const { data: item, error } = await supabase.from('items').insert([{
        name: data.name,
        assigned_to: data.assignedTo,
        location: data.location,
        category: data.category,
        created_by: data.createdBy,
        photo_url: photoUrl,
        barcode: data.barcode || `UNIV-${Math.random().toString(36).substring(7).toUpperCase()}`,
        stock: data.stock || 1,
        condition: data.condition || 'New'
      }]).select().single();

      if (error) throw error;
      return item;
    },

    update: async (id: string, data: any) => {
      const { error } = await supabase.from('items').update(data).eq('id', id);
      if (error) throw error;
    },

    delete: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
    },

    bulkCreate: async (items: any[], performedBy: string) => {
      const { data, error } = await supabase.from('items').insert(items.map(i => ({
        ...i,
        created_by: performedBy
      })));
      if (error) throw error;
      return data;
    }
  },

  scans: {
    list: async (params?: { page?: number; limit?: number }) => {
      const { data, error } = await supabase.from('scan_records').select('*, items(*)').order('scanned_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    record: async (barcode: string, scannedBy: string) => {
      const { data: item } = await supabase.from('items').select('id').eq('barcode', barcode).single();
      const { data, error } = await supabase.from('scan_records').insert([{
        barcode,
        scanned_by: scannedBy,
        item_id: item?.id
      }]).select().single();
      if (error) throw error;
      return data;
    }
  },

  complaints: {
    list: async () => {
      const { data, error } = await supabase.from('complaints').select('*').order('raised_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    raise: async (data: any) => {
      const { data: item } = await supabase.from('items').select('name, barcode, location').eq('id', data.itemId).single();
      const { data: res, error } = await supabase.from('complaints').insert([{
        item_id: data.itemId,
        item_name: item?.name,
        item_barcode: item?.barcode,
        location: item?.location,
        description: data.description,
        raised_by: data.raisedBy,
        status: 'open'
      }]).select().single();
      if (error) throw error;
      return res;
    },
    resolve: async (id: string, data: any) => {
      const { error } = await supabase.from('complaints').update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: data.resolvedBy,
        resolved_note: data.resolvedNote
      }).eq('id', id);
      if (error) throw error;
    }
  },

  audit: {
    list: async (limit = 100) => {
      const { data, error } = await supabase.from('audit_logs').select('*').order('performed_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data;
    }
  },

  sync: {
    googleSheets: async (sheetUrl: string) => {
      // Placeholder for now, can be implemented with a Supabase Edge Function
      console.log('Google Sheets sync requested for:', sheetUrl);
      return { added: 0, updated: 0 };
    },
    listBackups: async () => [],
    getBackupUrl: (filename: string) => `#`,
  },

  health: async () => {
    const { error } = await supabase.from('items').select('id', { count: 'exact', head: true });
    return { status: error ? 'error' : 'ok' };
  }
};

export function resolveImageUrl(url: string | null | undefined): string | null {
  return url || null;
}
