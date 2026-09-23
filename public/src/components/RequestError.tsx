import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface RequestErrorProps {
  message: string;
  onRetry?: () => void;
}

const RequestError: React.FC<RequestErrorProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
    <FiAlertCircle className="text-red-500" size={28} />
    <p className="max-w-xl text-sm font-semibold text-red-700">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-100"
      >
        <FiRefreshCw size={15} />
        Try again
      </button>
    )}
  </div>
);

export default RequestError;
