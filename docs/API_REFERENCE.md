# MechaniXpress API Reference

## Authentication (`/api/auth`)
- `POST /register`: Register a new user (Customer or Mechanic).
- `POST /login`: Login and retrieve JWT.
- `GET /me`: Get current user profile.

## Bookings (`/api/bookings`)
- `POST /`: Create a new booking (Customer).
- `GET /customer`: Get booking history (Customer).
- `GET /available`: Get pending jobs in area (Mechanic).
- `PATCH /:id/accept`: Accept a job (Mechanic).
- `PATCH /:id/status`: Update job status (IN_PROGRESS, COMPLETED).
- `GET /:id`: Get booking details.

## Reviews (`/api/reviews`)
- `POST /`: Create a review for a completed booking (Customer).
- `GET /mechanic/:mechanicId`: Get reviews for a specific mechanic.

## Payments (`/api/payments`)
- `POST /initiate`: Initiate JazzCash payment (Mock).
- `POST /callback`: Webhook for payment status updates.

## Admin (`/api/admin`)
- `GET /dashboard`: System stats (Revenue, Users, Avg Rating).
- `GET /mechanics`: List all mechanics.
- `PATCH /mechanics/:id/approve`: Approve mechanic profile.

## Uploads & Notifications
- `POST /api/upload`: Upload image/PDF (returns URL).
- `GET /api/notifications`: Get user notifications.
