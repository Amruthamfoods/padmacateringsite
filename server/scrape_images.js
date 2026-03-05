// We will use a reliable, free image search scraping approach using puppeteer
// since we don't have a paid API key for Google Custom Search or Bing.

const { PrismaClient } = require('@prisma/client')
const puppeteer = require('puppeteer')

const prisma = new PrismaClient()

async function scrapeImages() {
    console.log('Starting Puppeteer for image scraping...')
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()

    const items = await prisma.menuItem.findMany({
        where: { image: { startsWith: 'https://images.unsplash' } } // Only update the generic ones
    })

    console.log(`Found ${items.length} items to update with specific images.`)

    let updated = 0

    // We will process a subset to avoid getting blocked, just to demonstrate the feature
    // for the most important/distinct items, or first 50 items.
    const subset = items.slice(0, 50)

    for (const item of subset) {
        try {
            const query = encodeURIComponent(`${item.name} indian catering food`)
            await page.goto(`https://www.google.com/search?q=${query}&tbm=isch`, { waitUntil: 'networkidle2' })

            // Extract the first good image URL
            const imageUrl = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img.YQ4gaf'))
                for (const img of imgs) {
                    if (img.src && img.src.startsWith('http') && !img.src.includes('favicon')) {
                        return img.src
                    }
                }
                return null
            })

            if (imageUrl) {
                await prisma.menuItem.update({
                    where: { id: item.id },
                    data: { image: imageUrl }
                })
                console.log(`Updated ${item.name} -> [Image Found]`)
                updated++
            } else {
                console.log(`No image found for ${item.name}`)
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 1000))

        } catch (err) {
            console.error(`Error fetching image for ${item.name}:`, err.message)
        }
    }

    await browser.close()
    console.log(`Successfully scraped and updated ${updated} images.`)
}

scrapeImages()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
