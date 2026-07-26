export function SourcesFooter({ sources }: { sources: string[] }) {
  return (
    <footer className="text-muted-foreground border-t pt-4 text-xs">
      Data from {sources.join(", ")}.
    </footer>
  );
}
