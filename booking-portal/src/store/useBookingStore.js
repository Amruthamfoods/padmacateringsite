/**
 * Booking Store (Zustand)
 * Centralized state management for booking flow
 * Replaces sessionStorage with persistent state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookingStore = create(
  persist(
    (set, get) => ({
      // Step 1: Event Details
      eventDetails: {
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
      },

      // Step 2: Menu Preferences
      menuPreferences: {
        selectedPackage: null,
        dietPreference: 'NON_VEG',
        menuItems: [],
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
          },
          menuPreferences: {
            selectedPackage: null,
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
          },
          guestInfo: {
            name: '',
            email: '',
            phone: '',
          },
          paymentPlan: 'FULL',
        }),

      // Get current booking summary for API
      getBookingPayload: () => {
        const state = get()
        return {
          eventType: state.eventDetails.occasion,
          eventDate: state.eventDetails.eventDate,
          timeSlot: state.eventDetails.timeSlot,
          guestCount: state.eventDetails.guestCount,
          vegCount: state.eventDetails.vegCount,
          nonVegCount: state.eventDetails.nonVegCount,
          venueAddress: state.eventDetails.venueAddress,
          deliveryType: state.eventDetails.deliveryType,
          deliveryCharge: state.eventDetails.deliveryCharge,
          staffCount: state.eventDetails.staffCount,
          addonCost: state.pricing.addonCost,
          dietPreference: state.menuPreferences.dietPreference,
          spiceLevel: state.eventDetails.spiceLevel,
          specialInstructions: state.eventDetails.specialInstructions,
          menuItemIds: state.menuPreferences.menuItems.map((i) => i.id),
          packageId: state.menuPreferences.selectedPackage?.id,
          pricePerPerson: state.pricing.basePrice / Math.max(state.eventDetails.guestCount, 1),
          guestName: state.guestInfo.name,
          guestEmail: state.guestInfo.email,
          guestPhone: state.guestInfo.phone,
          coupon: state.pricing.coupon,
          paymentPlan: state.paymentPlan,
        }
      },
    }),
    {
      name: 'padma-booking-store', // unique key for localStorage
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
