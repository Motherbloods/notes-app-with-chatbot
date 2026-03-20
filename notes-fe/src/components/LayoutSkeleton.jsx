// Struktur skeleton mengikuti persis:
// Sidebar: Title → New Note btn → SearchBar → categories nav items → Chat AI → user profile
// Main: header (icon+title + filter select) → notes cards

const Skel = ({ className = "", style = {} }) => (
  <div
    className={`animate-pulse rounded ${className}`}
    style={{
      background: "var(--color-skeleton, rgba(128,128,128,0.15))",
      ...style,
    }}
  />
);

function LayoutSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-secondary text-primary">
      {/* ── SIDEBAR ── w-64, bg-primary, border-r, p-4, flex flex-col */}
      <div className="hidden md:flex w-64 bg-primary border-r border-custom p-4 flex-col shrink-0">
        {/* flex-1 overflow-y-auto */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Title "Second Brain" — h-[23px] font-bold, mb-6 */}
          <div className="flex justify-between items-center mb-6">
            <Skel className="h-6 w-36" />
          </div>

          {/* New Note button — flex items-center gap-2 px-4 py-2 rounded-lg mb-6 */}
          <Skel
            className="h-9 w-full rounded-lg mb-6"
            style={{ animationDelay: "40ms" }}
          />

          {/* SearchBar — mb-4 */}
          <div className="mb-4">
            <Skel
              className="h-9 w-full rounded-lg"
              style={{ animationDelay: "80ms" }}
            />
          </div>

          {/* Nav items: categories + Chat AI */}
          <div className="space-y-1">
            {[
              { iconColor: "bg-blue-400", labelW: "w-16", delay: "100ms" },
              {
                iconColor: "bg-green-400",
                labelW: "w-20",
                delay: "130ms",
              },
              { iconColor: "bg-yellow-400", labelW: "w-14", delay: "160ms" },
              { iconColor: "bg-pink-400", labelW: "w-24", delay: "190ms" },
              { iconColor: "bg-purple-400", labelW: "w-20", delay: "220ms" },
              { iconColor: "bg-orange-400", labelW: "w-16", delay: "250ms" },
            ].map((item, i) => (
              <div
                key={i}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg `}
              >
                <Skel
                  className={`w-5 h-5 rounded shrink-0 ${item.iconColor}`}
                  style={{ animationDelay: item.delay, opacity: 0.45 }}
                />
                <Skel
                  className="h-3 flex-1"
                  style={{ animationDelay: item.delay }}
                />
                {/* count badge */}
                <Skel
                  className="h-5 w-6 rounded-full"
                  style={{ animationDelay: item.delay }}
                />
              </div>
            ))}

            {/* Chat AI */}
            <div className="w-full flex items-center gap-2 px-4 py-2 rounded-lg">
              <Skel
                className="w-5 h-5 rounded shrink-0"
                style={{ animationDelay: "280ms", opacity: 0.4 }}
              />
              <Skel className="h-3 w-14" style={{ animationDelay: "280ms" }} />
            </div>
          </div>
        </div>

        {/* User profile — mt-4 pt-4 border-t */}
        <div className="mt-4 pt-4 border-t border-custom">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            {/* avatar w-10 h-10 rounded-full */}
            <Skel
              className="w-10 h-10 rounded-full shrink-0"
              style={{ animationDelay: "300ms" }}
            />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {/* username */}
              <Skel className="h-3 w-24" style={{ animationDelay: "320ms" }} />
              {/* full name */}
              <Skel
                className="h-2.5 w-32"
                style={{ animationDelay: "340ms", opacity: 0.6 }}
              />
            </div>
            {/* MoreVertical icon button */}
            <Skel
              className="w-6 h-6 rounded-lg shrink-0"
              style={{ animationDelay: "360ms" }}
            />
          </div>
        </div>
      </div>

      {/* ── MAIN ── flex-1 p-6 bg-primary */}
      <main className="flex-1 p-6 overflow-hidden bg-primary">
        {/* NotesPage header — flex items-center justify-between mb-6 */}
        <div className="flex items-center justify-between mb-6">
          {/* icon + category label */}
          <div className="flex items-center gap-2">
            <Skel
              className="w-7 h-7 rounded"
              style={{ animationDelay: "80ms" }}
            />
            <Skel
              className="h-6 w-32 rounded-md"
              style={{ animationDelay: "100ms" }}
            />
          </div>
          {/* filter select */}
          <Skel
            className="h-9 w-28 rounded-lg"
            style={{ animationDelay: "120ms" }}
          />
        </div>

        {/* Notes list skeleton (NotesSkeleton) */}
        <div className="space-y-4">
          {[
            { titleW: "w-2/5", lines: 2, delay: "140ms" },
            { titleW: "w-1/3", lines: 3, delay: "180ms" },
            { titleW: "w-1/2", lines: 1, delay: "220ms" },
            { titleW: "w-2/5", lines: 2, delay: "260ms" },
            { titleW: "w-1/3", lines: 2, delay: "300ms" },
          ].map((card, i) => (
            <div key={i} className="p-4 rounded-xl border border-custom">
              <div className="flex items-start justify-between mb-3">
                <Skel
                  className={`h-4 ${card.titleW} rounded-md`}
                  style={{ animationDelay: card.delay }}
                />
                <Skel
                  className="h-3 w-14 rounded"
                  style={{ animationDelay: card.delay, opacity: 0.5 }}
                />
              </div>
              <div className="flex flex-col gap-2">
                {[...Array(card.lines)].map((_, j) => (
                  <Skel
                    key={j}
                    className={`h-3 rounded ${
                      j === card.lines - 1 && card.lines > 1
                        ? "w-3/4"
                        : "w-full"
                    }`}
                    style={{
                      animationDelay: `calc(${card.delay} + ${j * 25}ms)`,
                      opacity: 0.75,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default LayoutSkeleton;
