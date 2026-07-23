export default function Dashboard() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="bg-card border border-card-border px-4 py-2 rounded-lg text-sm">
          Credits remaining: <span className="text-primary font-bold">50</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for generation history */}
        <div className="col-span-full bg-card border border-card-border border-dashed rounded-2xl p-12 text-center text-foreground/50">
          No images generated yet. Go to Tools to start creating!
        </div>
      </div>
    </div>
  );
}
