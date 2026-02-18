import CardPost from "../components/CardPost";
import { usePosts } from "../context/PostsContext";
import { useEffect } from "react";

export default function Post() {
  const { posts } = usePosts();

  useEffect(() => {
    // Monitor posts updates
  }, [posts]);

  return (
    <>
      {posts.map((post, index) => (
        <CardPost key={index} post={post} /> // Pass the post to CardPost
      ))}
    </>
  );
}
