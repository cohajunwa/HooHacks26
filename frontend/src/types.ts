export interface Product {
  title: string;
  source: string;
  price: string;
  link: string;
  thumbnail?: string;
  sustainability_rating?: string | null;
}

export interface FilterOption {
  text: string;
  shoprs: string;
  selected: boolean;
}

export interface FilterGroup {
  type: string;
  input_type: 'checkbox' | 'link_with_icon' | 'price_range';
  options: FilterOption[];
}

export interface SearchResponse {
  query: string;
  filter_groups: FilterGroup[];
  results: Product[];
}
