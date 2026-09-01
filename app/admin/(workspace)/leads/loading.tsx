/* Loading — the register. Rows in the shape the table will take. */

export default function LeadsLoading() {
  return (
    <>
      <header className="a-head">
        <div className="a-skeleton h-8 w-[140px]" />
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_190px_190px_auto] mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="a-skeleton h-[44px] w-full" />
        ))}
      </div>

      <div className="a-panel p-[18px]">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="a-skeleton h-6 w-full mb-3 last:mb-0" />
        ))}
      </div>
    </>
  );
}
