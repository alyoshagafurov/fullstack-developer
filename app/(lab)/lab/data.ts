export type LabData = {
  name: string;
  offer: string;
  note: string;
  works: { title: string; year: string; image: string; href: string }[];
  reviews: { text: string; name: string; who: string }[];
  directions: { word: string; line: string; price: string }[];
  whatsapp: string;
  start: string;
};
