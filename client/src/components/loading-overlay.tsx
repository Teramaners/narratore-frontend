export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="dark:text-white light:text-gray-800 text-center">
          Sto generando la tua storia con Gemini AI...
        </p>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Potrebbe richiedere alcuni secondi.
        </p>
      </div>
    </div>
  );
}