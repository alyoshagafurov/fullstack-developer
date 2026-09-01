/* Loading — one lead. Document on the left, operator rail on the right. */

export default function LeadLoading() {
  return (
    <>
      <header className="a-head">
        <div className="a-skeleton h-8 w-[220px]" />
        <div className="a-skeleton h-4 w-[120px]" />
      </header>

      <div className="a-detail">
        <div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="a-block">
              <div className="a-skeleton h-3 w-[100px] mb-3" />
              <div className="a-skeleton h-4 w-full mb-2" />
              <div className="a-skeleton h-4 w-[70%]" />
            </div>
          ))}
        </div>
        <div>
          <div className="a-skeleton h-[120px] w-full mb-5" />
          <div className="a-skeleton h-[240px] w-full" />
        </div>
      </div>
    </>
  );
}
