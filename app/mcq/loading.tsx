export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        
        <div className="h-6 w-24 bg-gray-400 rounded-full mb-6" />

        <div className="bg-gray-400 h-28 rounded-xl mb-6" />

        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-400 rounded-xl" />
          <div className="h-12 bg-gray-400 rounded-xl" />
          <div className="h-12 bg-gray-400 rounded-xl" />
          <div className="h-12 bg-gray-400 rounded-xl" />
        </div>

      </div>
    </div>
  );
}