import CardPost from "../components/CardPost";
import { usePosts } from "../PostsContext";
import { useEffect } from "react";

export default function Post() {
  
  const { posts } = usePosts();
  

  useEffect(() => {
    console.log("Posts updated:", posts);
  }, [posts]);

  
  return (
    <>
      {posts.map((post, index) => (
        <CardPost key={index} post={post} /> // Pass the post to CardPost
      ))}
    </>
  );
}
