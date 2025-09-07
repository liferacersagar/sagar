
import React from 'react';

const messages = [
  "Analyzing ingredients...",
  "Consulting nutritional databases...",
  "Calculating health score...",
  "Cross-referencing sources...",
  "Finalizing evidence panel...",
];

export const Loader: React.FC = () => {
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);


  return (
    <div className="mt-6 flex flex-col items-center justify-center p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-brand-secondary text-sm font-medium transition-opacity duration-500">{message}</p>
    </div>
  );
};
