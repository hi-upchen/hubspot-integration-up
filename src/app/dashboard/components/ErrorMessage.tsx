/**
 * Simple error message component
 */

interface ErrorMessageProps {
  message: string;
  title?: string;
}

export default function ErrorMessage({ message, title = "Error" }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700">{message}</p>
      <div className="mt-4">
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}