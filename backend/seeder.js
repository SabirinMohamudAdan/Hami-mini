const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "Fresh Apples",
    price: 2.99,
    category: "fruits",
    image: "https://media.gettyimages.com/id/871227828/photo/unrecognizable-woman-shops-for-produce-in-supermarket.jpg?s=612x612&w=0&k=20&c=MIvrDLHynihoCE5hOQSJbPDfXV2eMYxTPmbCe_hoaYE=",
    description: "Crisp and juicy fresh apples, perfect for snacking or baking.",
    stockQuantity: 50
  },
  {
    name: "Organic Carrots",
    price: 1.49,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/1474339118/photo/carrots-for-sale-at-street-market-at-old-town-of-biel.jpg?s=612x612&w=0&k=20&c=a2VXh5kz7T3KR71v3QQ7a-iufJuPg-Oakt6SMU0DIQk=",
    description: "Fresh organic carrots, rich in vitamins and perfect for cooking.",
    stockQuantity: 40
  },
  {
    name: "Ripe Tomatoes",
    price: 2.29,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/1406728873/photo/ripe-red-cherry-tomatoes-at-a-retail-market-or-hypermarket-vegetarian-vegan-and-raw-food-and.jpg?s=612x612&w=0&k=20&c=clZtz2-4wNPbczK2r4lSpPFhoeksEhNIL19AHapOUX0=",
    description: "Vine-ripened tomatoes with rich flavor, ideal for salads and sauces.",
    stockQuantity: 35
  },
  {
    name: "Fresh Spinach",
    price: 3.49,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/628102266/photo/fruit-board-1.jpg?s=612x612&w=0&k=20&c=LVVaErnfFcQY2jW-hWob-5DRBeEvUzK-PY3IZ7wgM7E=",
    description: "Tender fresh spinach leaves, packed with nutrients.",
    stockQuantity: 25
  },
  {
    name: "Sweet Strawberries",
    price: 4.99,
    category: "fruits",
    image: "https://media.gettyimages.com/id/1132335445/photo/strawberry-isolated-on-a-white-background.jpg?s=612x612&w=0&k=20&c=Cn460vCremhFpEnx-hTZttBhaZZ_UDwDIzVzHCk-Jl0=",
    description: "Sweet and juicy strawberries, perfect for desserts or fresh eating.",
    stockQuantity: 30
  },
  {
    name: "Potatoes",
    price: 1.6,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/157430678/photo/three-potatoes.jpg?s=612x612&w=0&k=20&c=qkMoEgcj8ZvYbzDYEJEhbQ57v-nmkHS7e88q8dv7TSA=",
    description: "Versatile potatoes, great for boiling, baking, or frying.",
    stockQuantity: 60
  },
   {
    name: "Garlic",
    price: 1.6,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/1426800146/photo/garlic-cloves-and-bulb-flying-on-a-white-background.jpg?s=612x612&w=0&k=20&c=gz04almGMoBdvzRA1L2PoaqEb1fKU3qMwcd7xTNzl5M=",
    description: "Versatile potatoes, great for boiling, baking, or frying.",
    stockQuantity: 60
  },
  {
    name: "Onion",
    price: 1.6,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/463175283/photo/food.jpg?s=612x612&w=0&k=20&c=2QK_eHu-buw_Dnfi2L7dT7AIYl6Eb7w98XvUpTJ5Qrs=",
    description: "Versatile potatoes, great for boiling, baking, or frying.",
    stockQuantity: 60
  },
   {
    name: "green pepper",
    price: 1.6,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/503382026/video/fresh-vegetable.jpg?s=640x640&k=20&c=Y3eJjKreik7UchRY_KYzL5E0T6nsQjOxIg5jqK3pa6U=",
    description: "Versatile potatoes, great for boiling, baking, or frying.",
    stockQuantity: 20
  },
  {
    name: "lettuce",
    price: 1.6,
    category: "vegetables",
    image: "https://media.gettyimages.com/id/1144589453/photo/iceberg-lettuce.jpg?s=612x612&w=0&k=20&c=xMsmr7soXocw--2OFSQXOyNSBk9cBkaC_nFYT_XQKm4=",
    description: "Versatile potatoes, great for boiling, baking, or frying.",
    stockQuantity: 21
  },

  {
    name: "Avocado",
    price: 2.1,
    category: "fruits",
    image: "https://media.gettyimages.com/id/1222302648/photo/sliced-avocado-on-white-background.jpg?s=612x612&w=0&k=20&c=OzpHqML-HnOv0_FiPPndJohYk1eUIaNYVrS2YzMVlFI=",
    description: "Zesty fresh lemons, perfect for cooking, baking, or beverages.",
    stockQuantity: 35
  },
  {
    name: "Green Grapes",
    price: 2.1,
    category: "fruits",
    image: "https://media.gettyimages.com/id/183217648/photo/bunch-of-different-types-of-fresh-grapes.jpg?s=612x612&w=0&k=20&c=Uag1Gm9tL0HsGkdvE4L28qVkiANuoJZUCKzzOxautpc=",
    description: "Zesty fresh lemons, perfect for cooking, baking, or beverages.",
    stockQuantity: 35
  },

   {
    name: "watermelon",
    price: 2.1,
    category: "fruits",
    image:"https://media.gettyimages.com/id/1292640509/vector/melon-and-wedges.jpg?s=612x612&w=0&k=20&c=SL9JRVi8kOERlxMoAhyzGKeOxX9lYggmypx-Vpw_jrY=",
    description: "Zesty fresh lemons, perfect for cooking, baking, or beverages.",
    stockQuantity: 35
  },
  {
    name: "Banana",
    price: 1.99,
    category: "fruits",
    image: "https://media.gettyimages.com/id/182810893/photo/fruit-mix.jpg?s=612x612&w=0&k=20&c=v9jopDXbS5LCXY1d8uSwEldLJVVkOpYtYtyHD8azWDU=",
    description: "Ripe bananas, a perfect energy-boosting snack.",
    stockQuantity: 45
  },
  {
    name: "Fresh Lemons",
    price: 2.1,
    category: "fruits",
    image: "https://media.gettyimages.com/id/1371271948/photo/oranges-were-placed-on-the-wooden-bottom.jpg?s=612x612&w=0&k=20&c=3IF44rZ-XL50V0itA5sNQqS0wvqQ2vD8eEntwGD_qVg=",
    description: "Zesty fresh lemons, perfect for cooking, baking, or beverages.",
    stockQuantity: 35
  },
    {
    name: "Mango",
    price: 2.1,
    category: "fruits",
    image: "https://media.gettyimages.com/id/2211144904/photo/summer-fruits-isolated-on-clear-background.jpg?s=612x612&w=0&k=20&c=eGBlb33wuwdQbl3begQtyR8RJHMrwlR6Fs6wHTFniE8=",
    description: "Zesty fresh lemons, perfect for cooking, baking, or beverages.",
    stockQuantity: 35
  }
   
   
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hami_minimarket');
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    await Product.insertMany(products);
    console.log('Database seeded successfully');
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();