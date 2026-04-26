import { useEffect } from 'react';

export function PWASetup() {
  useEffect(() => {
    // 1. Add Theme Color Meta Tags
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#7C5C42';
    document.head.appendChild(themeColorMeta);

    // 2. Add Apple Mobile Web App Meta Tags
    const appleMobileMeta = document.createElement('meta');
    appleMobileMeta.name = 'apple-mobile-web-app-capable';
    appleMobileMeta.content = 'yes';
    document.head.appendChild(appleMobileMeta);

    const appleStatusMeta = document.createElement('meta');
    appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusMeta.content = 'black-translucent';
    document.head.appendChild(appleStatusMeta);

    const appleTitleMeta = document.createElement('meta');
    appleTitleMeta.name = 'apple-mobile-web-app-title';
    appleTitleMeta.content = 'بيان';
    document.head.appendChild(appleTitleMeta);

    // 3. Create and inject dynamically generated Manifest JSON
    const manifest = {
      name: 'بيان - التطبيق الإسلامي الشامل',
      short_name: 'بيان',
      description: 'تطبيق إسلامي شامل يعرض مواقيت الصلاة، القرآن الكريم، الأذكار، والمسبحة الإلكترونية',
      start_url: '/',
      display: 'standalone',
      background_color: '#F4F1EA',
      theme_color: '#7C5C42',
      orientation: 'portrait',
      icons: [
        {
          src: 'https://cdn-icons-png.flaticon.com/512/3596/3596109.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'https://cdn-icons-png.flaticon.com/512/3596/3596109.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };

    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);

    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestURL;
    document.head.appendChild(manifestLink);

    // 4. Add Apple Touch Icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = 'https://cdn-icons-png.flaticon.com/512/3596/3596109.png';
    document.head.appendChild(appleTouchIcon);

    // 5. Register Service Worker (Mock for now, ready for production when exported)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // In a real PWA environment (after exporting), you would place a 'sw.js' in the public folder.
        // For this preview environment, we simulate the structure.
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed (Expected in preview environment): ', err);
          }
        );
      });
    }

    return () => {
      // Cleanup
      document.head.removeChild(themeColorMeta);
      document.head.removeChild(appleMobileMeta);
      document.head.removeChild(appleStatusMeta);
      document.head.removeChild(appleTitleMeta);
      document.head.removeChild(manifestLink);
      document.head.removeChild(appleTouchIcon);
      URL.revokeObjectURL(manifestURL);
    };
  }, []);

  return null;
}
