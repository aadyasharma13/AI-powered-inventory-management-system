export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );
} 