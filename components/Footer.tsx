export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="text-center mt-8 py-6 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
        © {currentYear} WesAI | Powered by Google Gemini
      </p>
    </footer>
  );
};
