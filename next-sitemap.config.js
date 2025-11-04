/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://phuong-long-vo-dao.fr',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/dashboard/*', '/api/*', '/signin', '/signup'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api'],
      },
    ],
  },
  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = 'weekly';
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/clubs')) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path.startsWith('/events')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/blog')) {
      priority = 0.8;
      changefreq = 'daily';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

