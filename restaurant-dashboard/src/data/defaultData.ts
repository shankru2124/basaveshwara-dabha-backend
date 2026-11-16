import { MenuItem, Category, RestaurantSettings, Order, AnalyticsDashboard } from '../types';

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurant_name: "Basaveshwara Dabha",
  tagline: "Pure Vegetarian Excellence Since 1998",
  logo_url: "/logo.jpg",
  cover_image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
  description: "Authentic North & South Indian pure vegetarian culinary heritage. Fresh ingredients, zero artificial colours, 100% pure desi ghee.",
  phone: "+91 98765 43210",
  email: "order@basaveshwaradabha.com",
  address: "Basaveshwara Circle, Old Madras Road, Bengaluru, Karnataka 560001",
  opening_time: "08:00",
  closing_time: "23:00",
  is_accepting_orders: true,
  closed_reason: "",
  min_order_value: 99.0,
  delivery_fee: 35.0,
  free_delivery_threshold: 499.0,
  packaging_fee: 15.0,
  tax_percentage: 5.0,
  is_pickup_available: true,
  is_delivery_available: true,
  header_top_announcement: "100% Pure Vegetarian Kitchen • Authentic Desi Ghee Flavours",
  header_notice: "Special Offers Available: Use WELCOME50 on checkout!",
  header_badge_text: "100% Pure Veg",
  header_show_announcement: true,
  header_show_phone: true,
  header_show_timings: true,
  header_tagline: "Authentic Pure Vegetarian Flavours",
  upi_id: "basaveshwara@okaxis",
  upi_payee_name: "Basaveshwara Dabha",
  is_upi_enabled: true
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat_1", name: "Breakfast", slug: "breakfast", description: "Crisp morning tiffins, steaming idlis and filter coffee.", image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", display_order: 1, is_active: true },
  { id: "cat_2", name: "South Indian", slug: "south-indian", description: "Authentic Karnataka & South Indian dosas, vadas & sambar.", image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80", display_order: 2, is_active: true },
  { id: "cat_3", name: "North Indian", slug: "north-indian", description: "Rich paneer gravies, slow-cooked dals, and tandoori breads.", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80", display_order: 3, is_active: true },
  { id: "cat_4", name: "Meals and Thalis", slug: "meals-thalis", description: "Grand authentic vegetarian thalis with unlimited joy.", image_url: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80", display_order: 4, is_active: true },
  { id: "cat_5", name: "Rice Items", slug: "rice-items", description: "Fragrant Bisi Bele Bath, Curd Rice and Ghee Pulao.", image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", display_order: 5, is_active: true },
  { id: "cat_6", name: "Biriyani (Veg Only)", slug: "veg-biriyani", description: "Dum cooked Basmati rice with marinated paneer & fresh veggies.", image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", display_order: 6, is_active: true },
  { id: "cat_7", name: "Snacks", slug: "snacks", description: "Crispy evening samosas, mirchi bhajji, and tea-time favorites.", image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", display_order: 7, is_active: true },
  { id: "cat_8", name: "Roti & Breads", slug: "roti-breads", description: "Hot butter naans, tandoori rotis, and stuffed kulchas.", image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", display_order: 8, is_active: true },
  { id: "cat_9", name: "Desserts & Beverages", slug: "desserts-beverages", description: "Hot gulab jamun, rasgulla, badam milk, and lassi.", image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80", display_order: 9, is_active: true }
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: "item_kaju_paneer",
    name: "Kaju Paneer Masala",
    description: "Roasted cashews and fresh cottage cheese simmered in rich makhani gravy with pure butter and cream.",
    category: "North Indian",
    price: 240,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: true,
    is_today_special: true,
    preparation_time_minutes: 20,
    spicy_level: 2,
    portion_size: "Serves 2"
  },
  {
    id: "item_paneer_butter",
    name: "Paneer Butter Masala",
    description: "Tender paneer cubes cooked in a mildly spiced, sweet and creamy rich tomato-butter gravy.",
    category: "North Indian",
    price: 220,
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: true,
    is_today_special: false,
    preparation_time_minutes: 18,
    spicy_level: 1,
    portion_size: "Serves 2"
  },
  {
    id: "item_dal_tadka",
    name: "Dal Tadka Desi Ghee",
    description: "Slow-cooked yellow lentils tempered with cumin, garlic, dry red chillies, and aromatic desi ghee.",
    category: "North Indian",
    price: 160,
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: true,
    is_today_special: false,
    preparation_time_minutes: 15,
    spicy_level: 2,
    portion_size: "Serves 1-2"
  },
  {
    id: "item_spl_thali",
    name: "Special North Indian Thali",
    description: "Paneer Sabzi, Dal Tadka, Veg Curry, 3 Butter Rotis, Jeera Rice, Gulab Jamun, Papad, Salad & Raita.",
    category: "Meals and Thalis",
    price: 220,
    image_url: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: true,
    is_today_special: true,
    preparation_time_minutes: 25,
    spicy_level: 2,
    portion_size: "1 Grand Meal"
  },
  {
    id: "item_masala_dosa",
    name: "Benne Masala Dosa",
    description: "Crispy golden South Indian crepe roasted with white butter, served with spiced aloo and coconut chutney.",
    category: "South Indian",
    price: 95,
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: true,
    is_today_special: false,
    preparation_time_minutes: 12,
    spicy_level: 1,
    portion_size: "1 Plate"
  },
  {
    id: "item_butter_naan",
    name: "Butter Naan (Tandoori)",
    description: "Soft, fluffy leavened flatbread baked in traditional clay oven and brushed with generous butter.",
    category: "Roti & Breads",
    price: 45,
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: false,
    is_today_special: false,
    preparation_time_minutes: 10,
    spicy_level: 1,
    portion_size: "1 Piece"
  },
  {
    id: "item_veg_biryani",
    name: "Basaveshwara Special Veg Dum Biryani",
    description: "Aromatic basmati rice slow-cooked on dum with saffron, marinated paneer, and farm-fresh garden vegetables.",
    category: "Biriyani (Veg Only)",
    price: 190,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: true,
    is_today_special: true,
    preparation_time_minutes: 20,
    spicy_level: 2,
    portion_size: "Serves 1-2"
  },
  {
    id: "item_bisi_bele",
    name: "Karnataka Bisi Bele Bath",
    description: "Traditional hot lentil rice prepared with special freshly ground spices, ghee, cashews, and boondi.",
    category: "Rice Items",
    price: 85,
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: false,
    is_today_special: false,
    preparation_time_minutes: 10,
    spicy_level: 2,
    portion_size: "1 Bowl"
  },
  {
    id: "item_jamun",
    name: "Gulab Jamun (2 Pcs)",
    description: "Soft khoya dumplings deep fried and soaked in cardamom and rose infused warm sugar syrup.",
    category: "Desserts & Beverages",
    price: 70,
    image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    is_veg: true,
    is_available: true,
    is_popular: true,
    is_today_special: false,
    preparation_time_minutes: 5,
    spicy_level: 1,
    portion_size: "2 Pieces"
  }
];

export const DEFAULT_ANALYTICS: AnalyticsDashboard = {
  today_sales: 14250,
  today_orders: 28,
  total_sales: 384500,
  total_orders: 842,
  average_order_value: 508.92,
  pending_orders: 2,
  accepted_orders: 3,
  preparing_orders: 2,
  completed_orders: 20,
  cancelled_orders: 1,
  best_selling_dishes: [
    { name: "Kaju Paneer Masala", units_sold: 18 },
    { name: "Special North Indian Thali", units_sold: 14 },
    { name: "Benne Masala Dosa", units_sold: 22 }
  ],
  least_selling_dishes: [
    { name: "Karnataka Bisi Bele Bath", units_sold: 4 }
  ],
  payment_method_stats: {
    "RAZORPAY_UPI": 22,
    "COD": 6
  },
  recent_sales_chart: [
    { date: "Mon", sales: 11200 },
    { date: "Tue", sales: 13400 },
    { date: "Wed", sales: 12800 },
    { date: "Thu", sales: 15100 },
    { date: "Fri", sales: 16900 },
    { date: "Sat", sales: 19800 },
    { date: "Sun", sales: 22400 }
  ]
};

export const DEFAULT_ORDERS: Order[] = [
  {
    id: "ord_1",
    order_id: "BD-8842",
    customer_name: "Anand Murthy",
    customer_phone: "+91 98450 11223",
    fulfillment_type: "DELIVERY",
    delivery_address: {
      address_line: "#42, 4th Main, Indiranagar",
      city: "Bengaluru",
      pincode: "560038"
    },
    items: [
      { item_id: "item_kaju_paneer", name: "Kaju Paneer Masala", price: 240, quantity: 2, total: 480 },
      { item_id: "item_butter_naan", name: "Butter Naan (Tandoori)", price: 45, quantity: 4, total: 180 }
    ],
    subtotal: 660,
    discount_amount: 50,
    tax_amount: 30.5,
    delivery_fee: 0,
    packaging_fee: 25,
    total_amount: 665.5,
    payment_method: "RAZORPAY_UPI",
    payment_status: "COMPLETED",
    order_status: "PLACED",
    estimated_prep_time_minutes: 25,
    status_history: [
      { status: "PLACED", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: "Order placed by customer" }
    ],
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: "ord_2",
    order_id: "BD-8841",
    customer_name: "Sneha Patil",
    customer_phone: "+91 99887 66554",
    fulfillment_type: "PICKUP",
    items: [
      { item_id: "item_spl_thali", name: "Special North Indian Thali", price: 220, quantity: 1, total: 220 },
      { item_id: "item_jamun", name: "Gulab Jamun (2 Pcs)", price: 70, quantity: 1, total: 70 }
    ],
    subtotal: 290,
    discount_amount: 0,
    tax_amount: 14.5,
    delivery_fee: 0,
    packaging_fee: 15,
    total_amount: 319.5,
    payment_method: "COD",
    payment_status: "PENDING",
    order_status: "ACCEPTED",
    estimated_prep_time_minutes: 20,
    status_history: [
      { status: "PLACED", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), note: "Order placed by customer" },
      { status: "ACCEPTED", timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), note: "Kitchen accepted order" }
    ],
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  }
];
