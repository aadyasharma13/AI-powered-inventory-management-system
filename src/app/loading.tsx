export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
} 