import { defineMiddleware } from 'astro:middleware';
import { typograph } from './typograph';

/** Every page goes through the typograph: no hanging prepositions at any width. */
export const onRequest = defineMiddleware(async (_, next) => {
  const response = await next();
  // Prerendered pages come without a content type
  const type = response.headers.get('content-type');
  if (type && !type.includes('text/html')) return response;
  return new Response(typograph(await response.text()), {
    status: response.status,
    headers: response.headers,
  });
});
