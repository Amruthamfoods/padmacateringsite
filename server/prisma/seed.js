require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.bookingMenuItem.deleteMany()
  await prisma.menuPackageItem.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.menuPackage.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.blockedDate.deleteMany()
  await prisma.user.deleteMany()

  // Categories
  const categories = await Promise.all([
    prisma.menuCategory.create({ data: { name: 'Welcome Drinks', sortOrder: 1 } }),
    prisma.menuCategory.create({ data: { name: 'Snacks & Starters', sortOrder: 2 } }),
    prisma.menuCategory.create({ data: { name: 'Live Counters', sortOrder: 3 } }),
    prisma.menuCategory.create({ data: { name: 'Soups & Salads', sortOrder: 4 } }),
    prisma.menuCategory.create({ data: { name: 'Rice Varieties', sortOrder: 5 } }),
    prisma.menuCategory.create({ data: { name: 'Dal & Pappu', sortOrder: 6 } }),
    prisma.menuCategory.create({ data: { name: 'Curries & Fry', sortOrder: 7 } }),
    prisma.menuCategory.create({ data: { name: 'Chutneys & Pickles', sortOrder: 8 } }),
    prisma.menuCategory.create({ data: { name: 'Breads', sortOrder: 9 } }),
    prisma.menuCategory.create({ data: { name: 'Sweets & Desserts', sortOrder: 10 } }),
  ])
  const [drinks, snacks, live, soups, rice, dal, curries, chutneys, breads, sweets] = categories
  console.log('Categories created')

  // Menu Items
  const items = await prisma.menuItem.createManyAndReturn({
    data: [
      // Welcome Drinks
      { name: 'Mango Lassi', categoryId: drinks.id, style: 'ANDHRA', type: 'VEG', price: 15, description: 'Fresh mango blended with chilled curd' },
      { name: 'Jaljeera', categoryId: drinks.id, style: 'NORTH_INDIAN', type: 'VEG', price: 10, description: 'Spiced cumin water with mint' },
      { name: 'Rose Sharbat', categoryId: drinks.id, style: 'MIXED', type: 'VEG', price: 12, description: 'Chilled rose syrup drink' },
      { name: 'Buttermilk (Majjiga)', categoryId: drinks.id, style: 'ANDHRA', type: 'VEG', price: 8, description: 'Traditional spiced buttermilk' },

      // Snacks & Starters
      { name: 'Mirchi Bajji', categoryId: snacks.id, style: 'ANDHRA', type: 'VEG', price: 20, description: 'Crispy green chilli fritters' },
      { name: 'Chicken 65', categoryId: snacks.id, style: 'ANDHRA', type: 'NON_VEG', price: 60, description: 'Spicy deep-fried chicken bites' },
      { name: 'Samosa', categoryId: snacks.id, style: 'NORTH_INDIAN', type: 'VEG', price: 18, description: 'Crispy pastry filled with spiced potatoes' },
      { name: 'Paneer Tikka', categoryId: snacks.id, style: 'NORTH_INDIAN', type: 'VEG', price: 55, description: 'Grilled marinated paneer cubes' },
      { name: 'Gobi Manchurian', categoryId: snacks.id, style: 'FUSION', type: 'VEG', price: 40, description: 'Crispy cauliflower in spicy sauce' },
      { name: 'Fish Fry', categoryId: snacks.id, style: 'ANDHRA', type: 'NON_VEG', price: 70, description: 'Andhra-spiced shallow fried fish' },
      { name: 'Mutton Seekh Kebab', categoryId: snacks.id, style: 'NORTH_INDIAN', type: 'NON_VEG', price: 80, description: 'Minced mutton skewers grilled in tandoor' },

      // Live Counters
      { name: 'Dosa Counter', categoryId: live.id, style: 'ANDHRA', type: 'VEG', price: 35, description: 'Live crispy dosas with chutneys' },
      { name: 'Pani Puri Counter', categoryId: live.id, style: 'NORTH_INDIAN', type: 'VEG', price: 30, description: 'Fresh puri with spiced water and fillings' },
      { name: 'Pasta Counter', categoryId: live.id, style: 'FUSION', type: 'VEG', price: 50, description: 'Live pasta cooked to order' },
      { name: 'Idly Counter', categoryId: live.id, style: 'ANDHRA', type: 'VEG', price: 20, description: 'Soft steamed idlies with sambar' },

      // Soups & Salads
      { name: 'Sweet Corn Soup', categoryId: soups.id, style: 'FUSION', type: 'VEG', price: 25, description: 'Creamy sweet corn vegetable soup' },
      { name: 'Tomato Shorba', categoryId: soups.id, style: 'NORTH_INDIAN', type: 'VEG', price: 20, description: 'Spiced tomato consommé' },
      { name: 'Mixed Vegetable Salad', categoryId: soups.id, style: 'MIXED', type: 'VEG', price: 15, description: 'Fresh garden salad with lemon dressing' },
      { name: 'Chicken Clear Soup', categoryId: soups.id, style: 'MIXED', type: 'NON_VEG', price: 35, description: 'Light chicken broth with vegetables' },

      // Rice Varieties
      { name: 'Steamed Rice', categoryId: rice.id, style: 'ANDHRA', type: 'VEG', price: 25, description: 'Plain steamed basmati rice' },
      { name: 'Vegetable Biryani', categoryId: rice.id, style: 'ANDHRA', type: 'VEG', price: 60, description: 'Fragrant basmati with mixed vegetables' },
      { name: 'Chicken Biryani', categoryId: rice.id, style: 'ANDHRA', type: 'NON_VEG', price: 90, description: 'Andhra-style spicy chicken biryani' },
      { name: 'Mutton Biryani', categoryId: rice.id, style: 'ANDHRA', type: 'NON_VEG', price: 120, description: 'Slow-cooked mutton dum biryani' },
      { name: 'Pulihora (Tamarind Rice)', categoryId: rice.id, style: 'ANDHRA', type: 'VEG', price: 30, description: 'Tangy tamarind rice tempered with spices' },
      { name: 'Coconut Rice', categoryId: rice.id, style: 'ANDHRA', type: 'VEG', price: 28, description: 'Aromatic coconut tempered rice' },
      { name: 'Jeera Rice', categoryId: rice.id, style: 'NORTH_INDIAN', type: 'VEG', price: 30, description: 'Cumin flavoured basmati rice' },

      // Dal & Pappu
      { name: 'Tomato Pappu', categoryId: dal.id, style: 'ANDHRA', type: 'VEG', price: 30, description: 'Toor dal cooked with tomato and tamarind' },
      { name: 'Spinach Dal (Palak Pappu)', categoryId: dal.id, style: 'ANDHRA', type: 'VEG', price: 32, description: 'Lentils cooked with fresh spinach' },
      { name: 'Dal Makhani', categoryId: dal.id, style: 'NORTH_INDIAN', type: 'VEG', price: 45, description: 'Creamy black lentils simmered overnight' },
      { name: 'Dal Fry', categoryId: dal.id, style: 'NORTH_INDIAN', type: 'VEG', price: 35, description: 'Toor dal with ghee tempering' },

      // Curries & Fry
      { name: 'Paneer Butter Masala', categoryId: curries.id, style: 'NORTH_INDIAN', type: 'VEG', price: 55, description: 'Paneer in rich tomato-cream sauce' },
      { name: 'Aloo Gobi', categoryId: curries.id, style: 'NORTH_INDIAN', type: 'VEG', price: 35, description: 'Potato and cauliflower dry curry' },
      { name: 'Chicken Curry', categoryId: curries.id, style: 'ANDHRA', type: 'NON_VEG', price: 75, description: 'Spicy Andhra-style chicken masala' },
      { name: 'Mutton Curry', categoryId: curries.id, style: 'ANDHRA', type: 'NON_VEG', price: 100, description: 'Slow-cooked mutton in onion-tomato gravy' },
      { name: 'Gutti Vankaya (Stuffed Brinjal)', categoryId: curries.id, style: 'ANDHRA', type: 'VEG', price: 40, description: 'Whole brinjals stuffed and cooked in masala' },
      { name: 'Palak Paneer', categoryId: curries.id, style: 'NORTH_INDIAN', type: 'VEG', price: 50, description: 'Paneer in smooth spinach gravy' },
      { name: 'Bendakaya Fry (Okra)', categoryId: curries.id, style: 'ANDHRA', type: 'VEG', price: 30, description: 'Crispy stir-fried okra with spices' },

      // Chutneys & Pickles
      { name: 'Coconut Chutney', categoryId: chutneys.id, style: 'ANDHRA', type: 'VEG', price: 5, description: 'Fresh ground coconut with green chilli' },
      { name: 'Tomato Chutney', categoryId: chutneys.id, style: 'ANDHRA', type: 'VEG', price: 5, description: 'Spiced tomato chutney' },
      { name: 'Avakaya (Mango Pickle)', categoryId: chutneys.id, style: 'ANDHRA', type: 'VEG', price: 8, description: 'Classic Andhra raw mango pickle' },
      { name: 'Pudina Chutney', categoryId: chutneys.id, style: 'NORTH_INDIAN', type: 'VEG', price: 5, description: 'Fresh mint and coriander chutney' },

      // Breads
      { name: 'Roti / Chapati', categoryId: breads.id, style: 'NORTH_INDIAN', type: 'VEG', price: 8, description: 'Soft whole wheat flatbread' },
      { name: 'Naan', categoryId: breads.id, style: 'NORTH_INDIAN', type: 'VEG', price: 15, description: 'Leavened bread baked in tandoor' },
      { name: 'Puri', categoryId: breads.id, style: 'ANDHRA', type: 'VEG', price: 10, description: 'Deep-fried puffed wheat bread' },
      { name: 'Paratha', categoryId: breads.id, style: 'NORTH_INDIAN', type: 'VEG', price: 20, description: 'Layered whole wheat flatbread' },

      // Sweets & Desserts
      { name: 'Gulab Jamun', categoryId: sweets.id, style: 'NORTH_INDIAN', type: 'VEG', price: 20, description: 'Soft milk dumplings in sugar syrup' },
      { name: 'Pootharekulu', categoryId: sweets.id, style: 'ANDHRA', type: 'VEG', price: 25, description: 'Traditional Andhra rice paper sweet' },
      { name: 'Kheer (Payasam)', categoryId: sweets.id, style: 'ANDHRA', type: 'VEG', price: 22, description: 'Creamy vermicelli/rice pudding' },
      { name: 'Rasgulla', categoryId: sweets.id, style: 'MIXED', type: 'VEG', price: 18, description: 'Soft spongy paneer balls in syrup' },
      { name: 'Ice Cream (2 scoops)', categoryId: sweets.id, style: 'FUSION', type: 'VEG', price: 30, description: 'Vanilla / Chocolate / Strawberry' },
      { name: 'Halwa', categoryId: sweets.id, style: 'ANDHRA', type: 'VEG', price: 25, description: 'Semolina or carrot halwa with dry fruits' },
    ],
  })
  console.log(`Created ${items.length} menu items`)

  // Helper to get items by name
  const item = (name) => items.find(i => i.name === name)

  // Packages
  const pkg1 = await prisma.menuPackage.create({
    data: {
      name: 'Standard Veg', eventType: 'Any', style: 'ANDHRA', type: 'VEG', servesMin: 50,
      basePrice: 200,
      description: 'Perfect for intimate gatherings. Classic Andhra vegetarian spread.',
      items: {
        create: [
          item('Mango Lassi'), item('Mirchi Bajji'), item('Steamed Rice'), item('Tomato Pappu'),
          item('Gutti Vankaya (Stuffed Brinjal)'), item('Coconut Chutney'), item('Avakaya (Mango Pickle)'),
          item('Puri'), item('Kheer (Payasam)'),
        ].filter(Boolean).map(i => ({ menuItemId: i.id })),
      },
    },
  })

  const pkg2 = await prisma.menuPackage.create({
    data: {
      name: 'Deluxe Veg', eventType: 'Wedding', style: 'MIXED', type: 'VEG', servesMin: 100,
      basePrice: 300,
      description: 'Comprehensive veg menu for weddings and large celebrations.',
      items: {
        create: [
          item('Mango Lassi'), item('Rose Sharbat'), item('Mirchi Bajji'), item('Paneer Tikka'),
          item('Dosa Counter'), item('Sweet Corn Soup'), item('Mixed Vegetable Salad'),
          item('Vegetable Biryani'), item('Jeera Rice'), item('Dal Makhani'), item('Palak Paneer'),
          item('Paneer Butter Masala'), item('Roti / Chapati'), item('Naan'),
          item('Coconut Chutney'), item('Tomato Chutney'), item('Gulab Jamun'), item('Kheer (Payasam)'),
        ].filter(Boolean).map(i => ({ menuItemId: i.id })),
      },
    },
  })

  const pkg3 = await prisma.menuPackage.create({
    data: {
      name: 'Non-Veg Special', eventType: 'Wedding', style: 'ANDHRA', type: 'NON_VEG', servesMin: 100,
      basePrice: 350,
      description: 'Andhra-style non-veg feast for special occasions.',
      items: {
        create: [
          item('Buttermilk (Majjiga)'), item('Chicken 65'), item('Fish Fry'),
          item('Chicken Clear Soup'), item('Chicken Biryani'), item('Steamed Rice'),
          item('Tomato Pappu'), item('Chicken Curry'), item('Bendakaya Fry (Okra)'),
          item('Coconut Chutney'), item('Avakaya (Mango Pickle)'), item('Puri'),
          item('Gulab Jamun'), item('Ice Cream (2 scoops)'),
        ].filter(Boolean).map(i => ({ menuItemId: i.id })),
      },
    },
  })

  const pkg4 = await prisma.menuPackage.create({
    data: {
      name: 'North Indian Grand', eventType: 'Corporate', style: 'NORTH_INDIAN', type: 'VEG', servesMin: 50,
      basePrice: 400,
      description: 'Premium North Indian spread perfect for corporate events.',
      items: {
        create: [
          item('Jaljeera'), item('Samosa'), item('Paneer Tikka'), item('Pani Puri Counter'),
          item('Tomato Shorba'), item('Jeera Rice'), item('Dal Makhani'), item('Dal Fry'),
          item('Paneer Butter Masala'), item('Palak Paneer'), item('Aloo Gobi'),
          item('Roti / Chapati'), item('Naan'), item('Paratha'), item('Pudina Chutney'),
          item('Gulab Jamun'), item('Rasgulla'),
        ].filter(Boolean).map(i => ({ menuItemId: i.id })),
      },
    },
  })

  const pkg5 = await prisma.menuPackage.create({
    data: {
      name: 'Amrutham Premium', eventType: 'Wedding', style: 'MIXED', type: 'NON_VEG', servesMin: 200,
      basePrice: 500,
      description: 'Our signature all-inclusive premium package for grand weddings and receptions.',
      items: {
        create: [
          item('Mango Lassi'), item('Rose Sharbat'), item('Jaljeera'), item('Buttermilk (Majjiga)'),
          item('Mirchi Bajji'), item('Chicken 65'), item('Paneer Tikka'), item('Mutton Seekh Kebab'),
          item('Fish Fry'), item('Dosa Counter'), item('Pani Puri Counter'),
          item('Sweet Corn Soup'), item('Mixed Vegetable Salad'),
          item('Chicken Biryani'), item('Mutton Biryani'), item('Vegetable Biryani'), item('Pulihora (Tamarind Rice)'),
          item('Dal Makhani'), item('Tomato Pappu'), item('Mutton Curry'), item('Chicken Curry'),
          item('Paneer Butter Masala'), item('Gutti Vankaya (Stuffed Brinjal)'),
          item('Roti / Chapati'), item('Naan'), item('Puri'),
          item('Coconut Chutney'), item('Avakaya (Mango Pickle)'), item('Pudina Chutney'),
          item('Gulab Jamun'), item('Pootharekulu'), item('Kheer (Payasam)'), item('Ice Cream (2 scoops)'), item('Halwa'),
        ].filter(Boolean).map(i => ({ menuItemId: i.id })),
      },
    },
  })
  console.log('Packages created:', [pkg1, pkg2, pkg3, pkg4, pkg5].map(p => p.name).join(', '))

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@padmacatering.com' },
    update: { passwordHash, role: 'ADMIN' },
    create: { name: 'Padma Admin', email: 'admin@padmacatering.com', passwordHash, role: 'ADMIN' },
  })
  console.log('Admin user:', admin.email)

  // Sample coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', discountType: 'PERCENTAGE', value: 10, minOrderValue: 5000, usageLimit: 100 },
  })
  console.log('Sample coupon WELCOME10 created')

  console.log('Seeding complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
