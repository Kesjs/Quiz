/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com', // Pour les avatars Google
      'avatars.githubusercontent.com', // Pour les avatars GitHub
      's.gravatar.com', // Pour les avatars par défaut
    ],
  },
  // Désactive le cache du système de fichiers pour les données de requête
}

module.exports = nextConfig
