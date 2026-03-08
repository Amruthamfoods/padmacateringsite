const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const PKG_ID = 37 // South Deluxe Thali

  // Use existing categories where matching, create new ones for Hots & Spl Veg Curry
  // Existing: Sweets(72), Flavoured Rice(73), Veg Curries(60), Veg Fry(62), Starters&Snacks(54)
  // Need new: "Spl Veg Curry", "Common Items"

  // Get or create categories
  async function getOrCreate(name) {
    let cat = await p.menuCategory.findFirst({ where: { name } })
    if (!cat) cat = await p.menuCategory.create({ data: { name, active: true } })
    return cat
  }

  const catSweets   = await p.menuCategory.findUnique({ where: { id: 72 } })
  const catRice     = await p.menuCategory.findUnique({ where: { id: 73 } })
  const catVegCurry = await p.menuCategory.findUnique({ where: { id: 60 } })
  const catVegFry   = await p.menuCategory.findUnique({ where: { id: 62 } })
  const catHots     = await getOrCreate('Hots & Starters')
  const catSplCurry = await getOrCreate('Spl Veg Curry')
  const catCommon   = await getOrCreate('Common Items')

  // Helper: get or create item
  async function upsertItem(name, categoryId, type = 'VEG') {
    let item = await p.menuItem.findFirst({ where: { name, categoryId } })
    if (!item) item = await p.menuItem.create({ data: { name, categoryId, type, style: 'ANDHRA', active: true } })
    return item
  }

  // ── SWEETS (choose 2) ──
  const sweetNames = ['Gulab Jamun','Bobattu','Boori','Chum Chum','Spl Mothichoor Ladoo','Rasgulla','Malai Puri','Bread Halwa','Pala Thalikelu','Payasam','Chandra Kala','Kala Jamun','Malai Roll','Kaju Katli','Gajar Ka Halwa','Shahi Gajar ka Kheer','Gummadikay Halwa','Rava Kesari','Jilebi']
  const sweetItems = []
  for (const n of sweetNames) sweetItems.push(await upsertItem(n, catSweets.id))

  // ── HOTS (choose 1) ──
  const hotNames = ['Mirchi Bajji','Banana Bajji','Aloo Bajji','Vada','Masala Vada','Cutlet','Spring Roll','Veg Bullet','Corn Samosa']
  const hotItems = []
  for (const n of hotNames) hotItems.push(await upsertItem(n, catHots.id))

  // ── FLAVOURED RICE (choose 2) ──
  const riceNames = ['Pulihora','Veg Biryani','Panasakay Biryani','Sweet Corn Biryani','Pudina Rice','Coconut Rice','Tomato Rice','Jeera Rice','Peas Pulao','Veg Dum Biryani','Lemon Rice']
  const riceItems = []
  for (const n of riceNames) riceItems.push(await upsertItem(n, catRice.id))

  // ── SPL VEG CURRY (choose 1) ──
  const splCurryNames = ['Paneer Mutter','Paneer Kadai','Cashew Paneer','Paneer Phool Makhana','Paneer Butter Masala','Phool Makhana Curry','Mushroom Masala','Babycorn Masala','Panasapottu','Methi Chaman']
  const splCurryItems = []
  for (const n of splCurryNames) splCurryItems.push(await upsertItem(n, catSplCurry.id))

  // ── VEG CURRY (choose 1) ──
  const vegCurryNames = ['Guti Vankay','Drumstick Tomato','Vankay Tomato Curry','Mix Veg Curry','Vadiyala Pulusu','Gobi Mutter','Chana Masala','Gongura Seanagapappu','Gongura Macaroni','Gobi Mutter Curry','Chikudu Kay Tomato','Potlakay Perugu','Dosakay Tomato']
  const vegCurryItems = []
  for (const n of vegCurryNames) vegCurryItems.push(await upsertItem(n, catVegCurry.id))

  // ── VEG FRY (choose 2) ──
  const vegFryNames = ['Aloo 65','Bendi 65','Gobi 65','Cabbage 65','Dondakay Pakodi Nut','Bendakay Pakodi Nut','Vankay Pakodi','Vankay Methi Karam','Kanda Pusa','Aloo Pusa','Carrot Beans Poriyal','Cabbage Senagapappu','Aloo Puttu','Carrot Vepudu']
  const vegFryItems = []
  for (const n of vegFryNames) vegFryItems.push(await upsertItem(n, catVegFry.id))

  // ── COMMON ITEMS (fixed) ──
  const commonNames = ['White Rice','Dal','Raitha','Sambar','Rasam','Curd','Roti Pachadi','Pickle','Ghee','Papad','Podi','Mineral Water Bottle','Premium Icecream']
  const commonItems = []
  for (const n of commonNames) commonItems.push(await upsertItem(n, catCommon.id))

  console.log('All items upserted. Creating package category rules...')

  // Delete existing rules for this package
  await p.packageCategoryRule.deleteMany({ where: { packageId: PKG_ID } })

  // Create category rules
  async function addRule(label, catId, items, minChoices, maxChoices) {
    const rule = await p.packageCategoryRule.create({
      data: {
        packageId: PKG_ID,
        categoryId: catId,
        label,
        minChoices,
        maxChoices,
      }
    })
    for (const item of items) {
      await p.packageCategoryRuleItem.create({ data: { ruleId: rule.id, menuItemId: item.id } })
    }
    console.log(`Rule: ${label} — ${items.length} items`)
    return rule
  }

  await addRule('Sweets',        catSweets.id,   sweetItems,   2, 2)
  await addRule('Hots',          catHots.id,     hotItems,     1, 1)
  await addRule('Flavoured Rice',catRice.id,     riceItems,    2, 2)
  await addRule('Spl Veg Curry', catSplCurry.id, splCurryItems,1, 1)
  await addRule('Veg Curry',     catVegCurry.id, vegCurryItems,1, 1)
  await addRule('Veg Fry',       catVegFry.id,   vegFryItems,  2, 2)
  await addRule('Common Items',  catCommon.id,   commonItems,  commonItems.length, commonItems.length)

  console.log('Done! South Deluxe Thali fully configured.')
}

main().catch(console.error).finally(() => p.$disconnect())
