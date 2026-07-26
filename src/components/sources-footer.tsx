export function SourcesFooter({ sources }: { sources: string[] }) {
  return (
    <footer className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-[11px]">
      <p>{sources.join(" · ")}</p>
      <p className="font-medium">BiteCast</p>
    </footer>
  );
}
