import { Helmet } from 'react-helmet-async';

export function Seo({ title, description }: { title?: string; description?: string }) {
  const cleanTitle = title?.trim();
  const pageTitle = !cleanTitle || cleanTitle.toLowerCase() === 'home' || cleanTitle.toLowerCase() === 'home page'
    ? 'nityaghor.com'
    : cleanTitle;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={pageTitle} />
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  );
}
