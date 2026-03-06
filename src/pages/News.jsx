import { useState, useEffect } from "react";
import CardNews from "../components/CardNews";
import Loading from "../components/Loading";
import ShareNewsModal from "../components/ShareNewsModal";

const CACHE_KEY = "gnews_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

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

        const response = await fetch(
          "https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=us&max=20&apikey=9213f618c700f8bcdd484d3aba5e27c2",
        );
        const result = await response.json();
        if (result.articles) {
          setArticles(result.articles);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: result.articles, timestamp: Date.now() }),
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

  if (error) {
    return <div className="text-red-400 text-center py-4">{error}</div>;
  }

  return (
    <div>
      {articles.map((article) => (
        <CardNews
          key={article.id}
          titleNews={article.source.name}
          image={article.image}
          href={article.url}
          title={article.title}
          onShare={() => setSelectedArticle(article)}
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
