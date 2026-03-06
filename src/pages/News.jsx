import { useState, useEffect } from "react";
import CardNews from "../components/CardNews";
import Loading from "../components/Loading";
import ShareNewsModal from "../components/ShareNewsModal";

const CACHE_KEY = "gnews_cache_v2";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms
const FALLBACK_IMAGE =
  "https://ik.imagekit.io/fs0yie8l6/smooth-gray-background-with-high-quality_53876-124606.avif?updatedAt=1736214212559";

function validateImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function processArticles(articles) {
  const results = await Promise.all(
    articles.map(async (a) => {
      const valid = await validateImage(a.image);
      return { ...a, image: valid ? a.image : FALLBACK_IMAGE };
    }),
  );
  return results;
}

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setArticles(data);
            setLoading(false);
            return;
          }
        }

        // Clean up old cache key
        localStorage.removeItem("gnews_cache");

        const response = await fetch(
          "/api/gnews/top-headlines?category=general&lang=en&country=us&max=20&apikey=9213f618c700f8bcdd484d3aba5e27c2",
        );
        const result = await response.json();
        if (result.articles) {
          const processed = await processArticles(result.articles);
          setArticles(processed);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: processed, timestamp: Date.now() }),
          );
        } else {
          setError("Failed to fetch news");
        }
      } catch (err) {
        setError("Error fetching news: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <Loading text="Loading news..." fullHeight={true} />;
  }

  const handleImageError = (index) => {
    setArticles((prev) => {
      if (prev[index].image === FALLBACK_IMAGE) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], image: FALLBACK_IMAGE };
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: updated, timestamp: Date.now() }),
      );
      return updated;
    });
  };

  if (error) {
    return <div className="text-red-400 text-center py-4">{error}</div>;
  }

  return (
    <div>
      {articles.map((article, index) => (
        <CardNews
          key={article.url}
          titleNews={article.source.name}
          image={article.image}
          href={article.url}
          title={article.title}
          onShare={() => setSelectedArticle(article)}
          onImageError={() => handleImageError(index)}
        />
      ))}
      {selectedArticle && (
        <ShareNewsModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
