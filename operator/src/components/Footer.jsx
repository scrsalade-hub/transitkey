export default function Footer() {
  return (
    <footer className="bg-gray-200 border-t border-gray-300 px-4 py-3 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span className="text-xs md:text-sm text-gray-600">&copy; 2026 Transitkey. All rights reserved.</span>
      <div className="flex gap-3 md:gap-4">
        <a href="#" className="text-xs md:text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
        <a href="#" className="text-xs md:text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
        <a href="#" className="text-xs md:text-sm text-gray-600 hover:text-gray-900">Help Center</a>
      </div>
    </footer>
  );
}
