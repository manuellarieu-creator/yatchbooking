import { User, Listing, Booking, Review, Service, ListingImage } from '@prisma/client'

export type UserWithListings = User & {
  listings: Listing[]
}

export type ListingWithDetails = Listing & {
  images: ListingImage[]
  services: Service[]
  reviews: Review[]
  owner: User
  _count?: {
    bookings: number
    reviews: number
    favorites: number
  }
}

export type BookingWithDetails = Booking & {
  listing: Listing & { images: ListingImage[]; owner: User }
  client: User
}

export type ReviewWithAuthor = Review & {
  author: User
}

export type SearchParams = {
  location?: string
  dateStart?: string
  dateEnd?: string
  type?: string
  country?: string
  priceMin?: number
  priceMax?: number
  adults?: number
  captain?: string
  skipper?: string
  rating?: number
  sort?: string
  page?: number
}
