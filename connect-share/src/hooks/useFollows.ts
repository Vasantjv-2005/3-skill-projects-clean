import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFollowStatus(targetUserId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['follow-status', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || user.id === targetUserId) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useFollowCounts(userId: string) {
  return useQuery({
    queryKey: ['follow-counts', userId],
    queryFn: async () => {
      const [followersResult, followingResult] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
      ]);

      return {
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
      };
    },
    enabled: !!userId,
  });
}

export function useFollow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      if (user.id === targetUserId) throw new Error('Cannot follow yourself');

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useUnfollow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:profiles!follows_follower_id_fkey(id, user_id, username, name, avatar_url)
        `)
        .eq('following_id', userId);

      if (error) throw error;
      return data.map(d => d.follower);
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:profiles!follows_following_id_fkey(id, user_id, username, name, avatar_url)
        `)
        .eq('follower_id', userId);

      if (error) throw error;
      return data.map(d => d.following);
    },
    enabled: !!userId,
  });
}
