export interface Product {
  title: string;
  source: string;
  price: string;
  link: string;
  thumbnail?: string;
  sustainability_rating?: string | null;
}

export interface SearchResponse {
  query: string;
  filters: {
    min_price: number | null;
    max_price: number | null;
    sort_by: number | null;
  };
  results: Product[];
}
