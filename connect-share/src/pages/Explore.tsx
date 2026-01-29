import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useExplorePosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export default function Explore() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExplorePosts();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Search */}
      <Link to="/search" className="block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10 cursor-pointer"
            readOnly
          />
        </div>
      </Link>

      <h1 className="text-2xl font-bold">Explore</h1>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : allPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={ref} className="py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
