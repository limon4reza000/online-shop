import { Helmet } from 'react-helmet-async';

export function Seo({ title, description }: { title: string; description?: string }) {
  const fullTitle = `${title} | নিত্যঘর`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  );
}
