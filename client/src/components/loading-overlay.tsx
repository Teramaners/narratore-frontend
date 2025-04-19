export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-indigo-900 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-indigo-800 p-6 rounded-lg shadow-xl flex flex-col items-center animate-pulse">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-12 w-12 text-purple-300 animate-spin"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-purple-100">Elaborazione del sogno...</p>
        <p className="text-sm text-purple-300 mt-2">Claude sta creando la tua storia</p>
      </div>
    </div>
  );
}
