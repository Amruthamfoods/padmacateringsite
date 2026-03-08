const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const existing = await p.menuPackage.findMany({ select: { id: true, name: true, servesMin: true, basePrice: true } })
  console.log('Existing packages:', JSON.stringify(existing, null, 2))

  const pkg = await p.menuPackage.create({
    data: {
      name: 'South Deluxe Thali',
      description: 'A rich and flavourful South Indian thali with premium curries, rice, breads and desserts.',
      image: '/booking/img/pkg-south-deluxe-thali.jpg',
      servesMin: 50,
      basePrice: 350,
      type: 'VEG',
      serviceType: 'Mealbox,PackedFood,Catering',
      pricingTiers: {
        create: [
          { minGuests: 50,  pricePerPerson: 350 },
          { minGuests: 100, pricePerPerson: 330 },
          { minGuests: 200, pricePerPerson: 310 },
        ]
      }
    }
  })
  console.log('Created:', pkg)
}

main().catch(console.error).finally(() => p.$disconnect())
