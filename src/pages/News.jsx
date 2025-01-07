import { Link } from "react-router-dom";
import CardNews from "../components/CardNews";
import { news } from "../data/News";

export default function News() {
  return (
    <div>
      {news.map((item) => (
        <CardNews
          key={item.id}
          titleNews={item.title}
          image={item.image}
          href={item.href}
          title={item.description}
        />
      ))}
    </div>
  );
}
