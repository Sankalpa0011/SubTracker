import { useRouteError } from 'react-router-dom';
import { motion } from 'framer-motion';

const ErrorBoundary = () => {
  const error = useRouteError();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
      <p className="text-gray-600 mb-8">
        {error instanceof Error ? error.message : 'Something went wrong'}
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Go back home
      </button>
    </motion.div>
  );
};

export default ErrorBoundary;