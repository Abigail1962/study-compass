import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiteNav } from '@/components/SiteNav';
import { Plus, Pencil, Trash2, Loader2, Save, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/admin')({
  component: AdminPage,
});

type School = {
  id: number;
  name: string;
  country: string;
  region: string;
  key_strengths: string;
  best_for: string;
};

function AdminPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<School>>({});
  const [isAdding, setIsAdding] = useState(false);

  const { data: schools, isLoading } = useQuery({
    queryKey: ['admin_schools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schools').select('*').order('id');
      if (error) throw error;
      return data as School[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('schools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (school: Partial<School>) => {
      const { error } = await supabase.from('schools').update(school).eq('id', school.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin_schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });

  const addMutation = useMutation({
    mutationFn: async (school: Partial<School>) => {
      const { error } = await supabase.from('schools').insert([school]);
      if (error) throw error;
    },
    onSuccess: () => {
      setIsAdding(false);
      setEditForm({});
      queryClient.invalidateQueries({ queryKey: ['admin_schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  });

  const handleEdit = (school: School) => {
    setEditingId(school.id);
    setEditForm(school);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate(editForm);
    } else {
      addMutation.mutate(editForm);
    }
  };

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage the university database.</p>
          </div>
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setEditForm({}); }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Add University
          </button>
        </div>

        {(isAdding || editingId) && (
          <div className="glass p-8 rounded-3xl mb-12 border border-primary/20 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-6">{isAdding ? 'Add New University' : 'Edit University'}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <input 
                  value={editForm.country || ''} 
                  onChange={e => setEditForm({...editForm, country: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <select 
                  value={editForm.region || ''} 
                  onChange={e => setEditForm({...editForm, region: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select Region</option>
                  <option value="Asia">Asia</option>
                  <option value="North America">North America</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Strengths</label>
                <input 
                  value={editForm.key_strengths || ''} 
                  onChange={e => setEditForm({...editForm, key_strengths: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Best For (Description)</label>
                <textarea 
                  value={editForm.best_for || ''} 
                  onChange={e => setEditForm({...editForm, best_for: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 h-24"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-primary text-primary-foreground px-8 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
        ) : (
          <div className="glass rounded-3xl overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-6 font-bold">University</th>
                  <th className="p-6 font-bold">Region</th>
                  <th className="p-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {schools?.map(s => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <div className="font-bold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.country}</div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.region === 'Asia' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {s.region}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(s)}
                          className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-all"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteMutation.mutate(s.id)}
                          className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
