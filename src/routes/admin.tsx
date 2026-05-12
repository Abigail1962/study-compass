import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiteNav } from '@/components/SiteNav';
import { Plus, Pencil, Trash2, Loader2, Save, X, Star, CheckCircle, MessageSquare, ShieldOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';

export const Route = createFileRoute('/admin')({
  component: AdminPage,
});

const ADMIN_EMAIL = 'abigailjoek@gmail.com';

type School = {
  id: number;
  name: string;
  country: string;
  region: string;
  key_strengths: string;
  best_for: string;
};

type PendingReview = {
  id: number;
  school_id: number;
  user_id: string;
  major: string;
  graduation_year?: number;
  rating: number;
  review_text: string;
  career_outcome?: string;
  is_approved: boolean;
  created_at: string;
  schools: { name: string };
};

type Tab = 'schools' | 'reviews';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
        />
      ))}
    </div>
  );
}

function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('schools');
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-background mesh-gradient flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
            <ShieldOff className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-sm">
            {!session
              ? 'You need to be logged in to access the admin dashboard.'
              : 'This page is restricted to administrators only.'}
          </p>
          {!session && (
            <Link
              to="/login"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    );
  }
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<School>>({});
  const [isAdding, setIsAdding] = useState(false);

  // ── Schools ──
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['admin_schools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schools').select('*').order('id');
      if (error) throw error;
      return data as School[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('schools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
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
    },
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
    },
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

  // ── Reviews ──
  const { data: pendingReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['pending_reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, schools(name)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PendingReview[];
    },
  });

  const approveReview = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending_reviews'] }),
  });

  const deleteReview = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending_reviews'] }),
  });

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage the university database.</p>
          </div>
          {tab === 'schools' && (
            <button
              onClick={() => { setIsAdding(true); setEditingId(null); setEditForm({}); }}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-5 w-5" />
              Add University
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1.5 glass rounded-2xl w-fit mb-10">
          <button
            onClick={() => setTab('schools')}
            className={
              'px-6 py-2.5 rounded-xl text-sm font-bold transition-all ' +
              (tab === 'schools'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/40')
            }
          >
            Universities
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ' +
              (tab === 'reviews'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/40')
            }
          >
            <MessageSquare className="h-4 w-4" />
            Pending Reviews
            {pendingReviews && pendingReviews.length > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingReviews.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Schools Tab ── */}
        {tab === 'schools' && (
          <>
            {(isAdding || editingId) && (
              <div className="glass p-8 rounded-3xl mb-12 border border-primary/20 animate-fade-in-up">
                <h3 className="text-xl font-bold mb-6">
                  {isAdding ? 'Add New University' : 'Edit University'}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <input
                      value={editForm.country || ''}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <select
                      value={editForm.region || ''}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
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
                      onChange={(e) => setEditForm({ ...editForm, key_strengths: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Best For</label>
                    <textarea
                      value={editForm.best_for || ''}
                      onChange={(e) => setEditForm({ ...editForm, best_for: e.target.value })}
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

            {schoolsLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
              </div>
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
                    {schools?.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="font-bold">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.country}</div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              s.region === 'Asia'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
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
          </>
        )}

        {/* ── Reviews Tab ── */}
        {tab === 'reviews' && (
          <>
            {reviewsLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
              </div>
            ) : !pendingReviews || pendingReviews.length === 0 ? (
              <div className="glass p-16 rounded-3xl text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="font-bold text-lg text-foreground">All caught up!</p>
                <p className="text-muted-foreground mt-2 text-sm">No pending reviews to moderate.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((r) => (
                  <div key={r.id} className="glass rounded-3xl p-6 border border-white/10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="font-bold text-foreground">{r.schools?.name}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm font-medium text-primary">{r.major}</span>
                          {r.graduation_year && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              Class of {r.graduation_year}
                            </span>
                          )}
                          <StarRow rating={r.rating} />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                          {r.review_text}
                        </p>
                        {r.career_outcome && (
                          <p className="text-xs text-primary font-semibold">
                            → {r.career_outcome}
                          </p>
                        )}
                        <p className="mt-2 text-[10px] text-muted-foreground/50">
                          Submitted {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => approveReview.mutate(r.id)}
                          disabled={approveReview.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 text-green-600 text-sm font-bold hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                          {approveReview.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => deleteReview.mutate(r.id)}
                          disabled={deleteReview.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-bold hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          {deleteReview.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
