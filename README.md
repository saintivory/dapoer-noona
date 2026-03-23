# Dapoer Noona - Online Snacks & Catering

Welcome to **Dapoer Noona**, a modern website to order your favorite snacks and catering services directly from your browser! 🎉  
Built with **Next.js** and fully integrated with **Supabase** for database & storage.

---

## 🌟 Key Features

### 1. Home Page / Customer Experience
- **Interactive Header**
  - Brand logo.
  - Search bar for quick product lookup.
  - Cart icon showing real-time item count and opens a cart drawer.

- **Responsive Product Grid**
  - Product cards include:
    - Image (auto-fallback if loading fails).
    - Product name, category, price.
    - "+ Add to Cart" button.
  - Smooth hover animations and transitions.

- **Filter & Sort**
  - Filter products by category.
  - Sorting options:
    - Price: High → Low / Low → High
    - Name: A → Z / Z → A

- **Pagination**
  - Display 25 products per page with easy navigation.

- **Cart Drawer**
  - View products in your cart.
  - Manage quantities: increase, decrease, remove.
  - Checkout directly via **WhatsApp** with auto-generated order messages.

- **Toast Notifications**
  - Instant feedback when products are added to the cart or other actions occur.

---

### 2. Admin Page / Backend Management
- **Admin Login**
  - Secure login
  - Access to manage products and categories.

- **Product Management**
  - Add / edit products:
    - Name, price, category, image (uploaded to Supabase Storage).
  - Delete single or multiple products at once (bulk delete).
  - Product search with pagination (5 products per page).

- **Category Management**
  - Add new categories.
  - Edit existing category names.
  - Delete categories.
  - Dropdown auto-updates when new categories are added.

- **Toast Notifications**
  - Real-time feedback for every admin action (e.g., add product, update category, delete).

---

### 3. Technology & Integrations
- **Next.js** – modern React framework for fast, SEO-friendly web apps.
- **Supabase**
  - Database for products & categories.
  - Storage for product images.
- **LocalStorage**
  - Persistent cart data even after page reloads.
- **WhatsApp Checkout**
  - Auto-generates order messages for admin.

---

## 🚀 Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
