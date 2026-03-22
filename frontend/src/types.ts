export interface Product {
  title: string;
  source: string;
  price: string;
  link: string;
  product_link?: string;
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
  has_more: boolean;
}

export interface OutfitItem {
  label: string;
  search_query: string;
  results: Product[];
}

export interface StyleAssistantResponse {
  summary: string;
  outfit_items: OutfitItem[];
}
