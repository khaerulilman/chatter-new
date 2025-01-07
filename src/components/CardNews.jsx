import { news } from "../data/News";


export default function CardNews({ titleNews, image, href, title }) {
  return (
    <>
      <div className="p-4 border-b border-gray-500 h-44">
        <h3 className="text-gray-400">{titleNews}</h3>
        <div className="flex text-white gap-2 items-center">
          <a
            href={href}
            target="_blank"
            className="text-lg w-5/6 hover:text-gray-600 "
          >
            {title}
          </a>
          <a href={href}>
            <img src={image} alt="" className="rounded-md w-36 h-28 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]" />
          </a>
        </div>
      </div>
      </>
  );
}
