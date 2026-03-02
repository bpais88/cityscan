import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect old /:city routes to /nl/:city
      {
        source: "/:city(amsterdam|haarlem|bloemendaal|edam-volendam|purmerend|zaanstad|haarlemmermeer|amstelveen|diemen|ouder-amstel|wijdemeren|de-ronde-venen)",
        destination: "/nl/:city",
        permanent: true,
      },
      // Redirect old /:city/:slug routes to /nl/:city/:slug
      {
        source: "/:city(amsterdam|haarlem|bloemendaal|edam-volendam|purmerend|zaanstad|haarlemmermeer|amstelveen|diemen|ouder-amstel|wijdemeren|de-ronde-venen)/:slug",
        destination: "/nl/:city/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
