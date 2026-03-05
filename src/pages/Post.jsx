import CardPost from "../components/CardPost";
import Loading from "../components/Loading";
import { usePosts } from "../context/PostsContext";
import { useEffect, useRef, useCallback } from "react";

export default function Post() {
  const { posts, loading, loadMorePosts, loadingMore, hasMore } = usePosts();
  const observerTarget = useRef(null);

  const handleScroll = useCallback(() => {
    if (!observerTarget.current) return;

    const { bottom } = observerTarget.current.getBoundingClientRect();
    // Trigger load when user scrolls near the bottom (within 500px)
    if (bottom <= window.innerHeight + 500 && hasMore && !loadingMore) {
      loadMorePosts();
    }
  }, [hasMore, loadingMore, loadMorePosts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (loading) {
    return <Loading text="Loading posts..." />;
  }

  return (
    <>
      {posts.map((post, index) => (
        <CardPost key={index} post={post} /> // Pass the post to CardPost
      ))}
      {/* Scroll trigger element */}
      <div ref={observerTarget} />
      {/* Loading indicator for more posts */}
      {loadingMore && <Loading text="Loading more posts..." />}
    </>
  );
}
