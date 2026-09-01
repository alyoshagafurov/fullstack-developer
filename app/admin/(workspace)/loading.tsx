/*
 * Loading — the dashboard.
 *
 * The skeleton matches the layout that is coming: one held figure on the
 * left, a stack of pipeline rows on the right. A generic spinner would say
 * "wait"; this says what is about to appear, so the eye is already in the
 * right place when it does.
 */

export default function DashboardLoading() {
  return (
    <>
      <header className="a-head">
        <div className="a-skeleton h-8 w-[160px]" />
      </header>

      <div className="a-ledger mb-12">
        <div>
          <div className="a-skeleton h-3 w-[110px] mb-4" />
          <div className="a-skeleton h-[76px] w-[140px]" />
        </div>
        <div>
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="py-[9px] border-b border-line">
              <div className="a-skeleton h-4 w-full max-w-[280px]" />
            </div>
          ))}
        </div>
      </div>

      <div className="a-skeleton h-3 w-[140px] mb-4" />
      <div className="a-panel p-[18px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="a-skeleton h-5 w-full mb-3 last:mb-0" />
        ))}
      </div>
    </>
  );
}
