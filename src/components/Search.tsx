export default function Search() {
  return (
    <>
      <div className="py-3 px-4 text-white flex bg-gray-900 xl:hidden max-xl:hidden">
        <div className="flex w-full items-center border-gray-600 border py-2 px-3 rounded-lg">
          <input
            type="text"
            placeholder="Search"
            className="outline-none bg-transparent w-full"
          />
          <i className="fa-solid fa-magnifying-glass ml-2 text-gray-400"></i>
        </div>
      </div>
    </>
  );
}
