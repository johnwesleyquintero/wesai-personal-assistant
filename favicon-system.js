// Dynamic Favicon System for WesAI
// This script automatically switches favicon based on theme

(function () {
  // Create favicon link elements
  const lightFavicon = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="favicon-light" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233B82F6"/><stop offset="50%" stop-color="%238B5CF6"/><stop offset="100%" stop-color="%23DB2777"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="white" stroke="url(%23favicon-light)" stroke-width="1"/><rect x="12" y="10" width="8" height="6" rx="1.5" fill="url(%23favicon-light)" opacity="0.9"/><circle cx="10" cy="20" r="1.5" fill="url(%23favicon-light)" opacity="0.7"/><circle cx="16" cy="20" r="2" fill="url(%23favicon-light)"/><circle cx="22" cy="20" r="1.5" fill="url(%23favicon-light)" opacity="0.7"/><path d="M11.5 20H14.5M17.5 20H20.5" stroke="url(%23favicon-light)" stroke-width="1" stroke-linecap="round" opacity="0.8"/></svg>`;

  const darkFavicon = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="favicon-dark" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2360A5FA"/><stop offset="50%" stop-color="%23A78BFA"/><stop offset="100%" stop-color="%23EC4899"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="%231F2937" stroke="url(%23favicon-dark)" stroke-width="1"/><rect x="12" y="10" width="8" height="6" rx="1.5" fill="url(%23favicon-dark)" opacity="0.9"/><circle cx="10" cy="20" r="1.5" fill="url(%23favicon-dark)" opacity="0.7"/><circle cx="16" cy="20" r="2" fill="url(%23favicon-dark)"/><circle cx="22" cy="20" r="1.5" fill="url(%23favicon-dark)" opacity="0.7"/><path d="M11.5 20H14.5M17.5 20H20.5" stroke="url(%23favicon-dark)" stroke-width="1" stroke-linecap="round" opacity="0.8"/></svg>`;

  function updateFavicon() {
    // Remove existing favicons
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach((icon) => icon.remove());

    // Determine which favicon to use based on theme
    const isDark = document.documentElement.classList.contains('dark');
    const faviconData = isDark ? darkFavicon : lightFavicon;

    // Create new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = faviconData;
    document.head.appendChild(link);
  }

  // Initial favicon setup
  updateFavicon();

  // Watch for theme changes
  const observer = new MutationObserver(updateFavicon);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  // Also listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);
})();
