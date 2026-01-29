import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  created_at: string;
  profile?: {
    username: string;
    name: string;
    avatar_url: string;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

const POSTS_PER_PAGE = 10;

export function useFeedPosts() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['feed', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { posts: [], nextPage: null };

      // Get users the current user follows
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      // Include own posts in feed
      followingIds.push(user.id);

      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;

      // Get likes and comments counts with profiles
      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post) => {
          const [likesResult, commentsResult, userLikeResult, profileResult] = await Promise.all([
            supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
            supabase.from('profiles').select('username, name, avatar_url').eq('user_id', post.user_id).maybeSingle(),
          ]);

          return {
            ...post,
            profile: profileResult.data || undefined,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            is_liked: !!userLikeResult.data,
          };
        })
      );

      return {
        posts: postsWithCounts,
        nextPage: posts && posts.length === POSTS_PER_PAGE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });
}

export function useExplorePosts() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['explore'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post) => {
          const [likesResult, commentsResult, userLikeResult, profileResult] = await Promise.all([
            supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
            user
              ? supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
              : Promise.resolve({ data: null }),
            supabase.from('profiles').select('username, name, avatar_url').eq('user_id', post.user_id).maybeSingle(),
          ]);

          return {
            ...post,
            profile: profileResult.data || undefined,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            is_liked: !!userLikeResult.data,
          };
        })
      );

      return {
        posts: postsWithCounts,
        nextPage: posts && posts.length === POSTS_PER_PAGE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

export function useUserPosts(userId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post) => {
          const [likesResult, commentsResult, userLikeResult] = await Promise.all([
            supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
            user
              ? supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            is_liked: !!userLikeResult.data,
          };
        })
      );

      return postsWithCounts;
    },
    enabled: !!userId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ imageUrl, caption }: { imageUrl: string; caption: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          caption,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
    },
  });
}
