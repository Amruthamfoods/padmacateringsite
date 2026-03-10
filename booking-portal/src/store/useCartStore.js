import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      // item shape: { id, pkg, eventDetails, pricePerPerson, addedAt }

      addToCart: (pkg, eventDetails, pricePerPerson) => {
        const already = get().items.find(i => i.pkg.id === pkg.id)
        if (already) return false
        const item = { id: `${pkg.id}-${Date.now()}`, pkg, eventDetails, pricePerPerson, addedAt: Date.now() }
        set(s => ({ items: [...s.items, item] }))
        return true
      },

      removeFromCart: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

      clearCart: () => set({ items: [] }),

      isInCart: (pkgId) => get().items.some(i => i.pkg.id === pkgId),
    }),
    { name: 'padma-cart' }
  )
)
