/*
 * A JSON-LD block. `<` is escaped so a case title or a review typed in the
 * admin can never close the script tag it sits in.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
