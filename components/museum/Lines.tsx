/*
 * A headline set line by line, each line in its own mask so the motion script
 * can lift it into view. Without the script the lines are simply there.
 */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span key={line} className="line-mask">
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}
