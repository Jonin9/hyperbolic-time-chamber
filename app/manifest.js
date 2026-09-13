export default function manifest() {
  return {
    name: 'Hyperbolic Time Chamber',
    short_name: 'Time Chamber',
    description: 'Japan bulk tracker',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#050816',
    theme_color: '#050816',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any'
      }
    ]
  };
}
