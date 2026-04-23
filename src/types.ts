export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  mainCategory: string;
  imageUrl: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
