/**
 * Booking Store (Zustand)
 * Centralized state management for booking flow
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookingStore = create(
  persist(
    (set, get) => ({
      eventDetails: {
        city: '',
        occasion: '',
        eventDate: '',
        timeSlot: '',
        guestCount: 100,
        vegCount: 50,
        nonVegCount: 50,
        venueAddress: '',
        deliveryType: 'GATE',
        deliveryCharge: 0,
        staffCount: 0,
        spiceLevel: 'MEDIUM',
        specialInstructions: '',
        dietPreference: 'NON_VEG',
      },

      // Step 2: Menu Preferences
      menuPreferences: {
        selectedPackage: null,
        servicePreference: 'NinjaBox', // 'NinjaBox' or 'NinjaBuffet'
        dietPreference: 'NON_VEG',  // kept for backwards compat
        menuItems: [],               // { id, name, categoryId, categoryName, type, quantity, unit, ruleId, extraCharge }
        addons: {},
      },

      // Step 3: Pricing
      pricing: {
        basePrice: 0,
        packingCost: 0,
        addonCost: 0,
        deliveryCharge: 0,
        staffCharge: 0,
        subtotal: 0,
        coupon: null,
        discount: 0,
        gst: 0,
        total: 0,
        pricePerPerson: 0,
      },

      // Guest Info
      guestInfo: {
        name: '',
        email: '',
        phone: '',
      },

      paymentPlan: 'FULL',

      // Setters
      setEventDetails: (details) =>
        set((state) => ({
          eventDetails: { ...state.eventDetails, ...details },
        })),

      setMenuPreferences: (prefs) =>
        set((state) => ({
          menuPreferences: { ...state.menuPreferences, ...prefs },
        })),

      // Adjust an individual item's quantity
      setItemQuantity: (itemId, quantity) =>
        set((state) => ({
          menuPreferences: {
            ...state.menuPreferences,
            menuItems: state.menuPreferences.menuItems.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          },
        })),

      setPricing: (pricing) =>
        set((state) => ({
          pricing: { ...state.pricing, ...pricing },
        })),

      setGuestInfo: (info) =>
        set((state) => ({
          guestInfo: { ...state.guestInfo, ...info },
        })),

      setPaymentPlan: (plan) => set({ paymentPlan: plan }),

      // Reset entire booking
      resetBooking: () =>
        set({
          eventDetails: {
            city: '',
            occasion: '',
            eventDate: '',
            timeSlot: '',
            guestCount: 100,
            vegCount: 50,
            nonVegCount: 50,
            venueAddress: '',
            deliveryType: 'GATE',
            deliveryCharge: 0,
            staffCount: 0,
            spiceLevel: 'MEDIUM',
            specialInstructions: '',
            dietPreference: 'NON_VEG',
          },
          menuPreferences: {
            selectedPackage: null,
            servicePreference: 'NinjaBox',
            dietPreference: 'NON_VEG',
            menuItems: [],
            addons: {},
          },
          pricing: {
            basePrice: 0,
            packingCost: 0,
            addonCost: 0,
            deliveryCharge: 0,
            staffCharge: 0,
            subtotal: 0,
            coupon: null,
            discount: 0,
            gst: 0,
            total: 0,
            pricePerPerson: 0,
          },
          guestInfo: {
            name: '',
            email: '',
            phone: '',
          },
          paymentPlan: 'FULL',
        }),

      // Get booking payload for API
      getBookingPayload: () => {
        const state = get()
        return {
          city: state.eventDetails.city,
          eventType: state.eventDetails.occasion,
          eventDate: state.eventDetails.eventDate,
          timeSlot: state.eventDetails.timeSlot,
          guestCount: state.eventDetails.guestCount,
          vegCount: state.eventDetails.vegCount,
          nonVegCount: state.eventDetails.nonVegCount,
          venueAddress: state.eventDetails.venueAddress,
          deliveryType: state.eventDetails.deliveryType,
          servicePreference: state.menuPreferences.servicePreference,
          deliveryCharge: state.eventDetails.deliveryCharge,
          staffCount: state.eventDetails.staffCount,
          addonCost: state.pricing.addonCost,
          dietPreference: state.eventDetails.dietPreference,
          spiceLevel: state.eventDetails.spiceLevel,
          specialInstructions: state.eventDetails.specialInstructions,
          menuItemIds: state.menuPreferences.menuItems.map((i) => i.id),
          packageId: state.menuPreferences.selectedPackage?.id,
          pricePerPerson: state.pricing.pricePerPerson,
          guestName: state.guestInfo.name,
          guestEmail: state.guestInfo.email,
          guestPhone: state.guestInfo.phone,
          coupon: state.pricing.coupon,
          paymentPlan: state.paymentPlan,
          totalAmount: state.pricing.total,
        }
      },
    }),
    {
      name: 'padma-booking-store',
      partialize: (state) => ({
        eventDetails: state.eventDetails,
        menuPreferences: state.menuPreferences,
        pricing: state.pricing,
        guestInfo: state.guestInfo,
        paymentPlan: state.paymentPlan,
      }),
    }
  )
)
