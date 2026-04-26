# 🎉 CouponCare

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

CouponCare is a full-stack web application that connects generous donors with those in need through the sharing of discount coupons. Built with modern web technologies, it fosters a community-driven platform where unused coupons find new life, helping bridge gaps in access to discounts and deals.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Signup/Login**: User registration with email verification and secure password hashing
- **Password Reset**: Direct password reset functionality for account recovery
- **JWT Authentication**: Token-based authentication with configurable expiration
- **User Profiles**: Display names, roles (donor/recipient), and impact statistics

### 🎁 Coupon Management
- **Donate Coupons**: Easily list unused coupons with detailed information
  - Brand, discount code, value description, expiry date
  - Categories: Food, Grocery, Entertainment, Shopping, Travel, Payment, Other
  - Optional: City restrictions, usage restrictions, enhanced descriptions
  - Media: Brand logos and product images
- **Browse Coupons**: Filter and search available coupons by category, brand, or city
- **Coupon Details**: View comprehensive coupon information with donor trust scores

### 🤝 Request & Approval System
- **Flexible Reveal Modes**:
  - **Auto-Release**: Instant approval for immediate access
  - **Donor Approval**: Manual approval process for controlled sharing
- **Request Management**: Track incoming and outgoing requests
- **Approval Workflow**: Donors can approve or reject requests with ease

### 📊 Trust & Impact Tracking
- **Trust Scores**: Calculated based on donation history and community impact
- **User Statistics**: Track donated, received, and impact scores
- **Community Building**: Foster trust through transparent donor information

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Intuitive Navigation**: Clean, user-friendly interface
- **Brand Integration**: Support for popular brands and services

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for APIs
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing

### DevOps & Tools
- **Docker** - Containerized MongoDB for development
- **Vercel** - Frontend deployment
- **tsx** - TypeScript execution and REPL
- **Morgan** - HTTP request logger

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker (optional, for local MongoDB)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd couponcare
```

### 2. Start MongoDB
**Option A: Using Docker (Recommended)**
```bash
docker compose up -d
```

**Option B: Using Local MongoDB**
Ensure MongoDB is running on `mongodb://localhost:27017/couponcare`

### 3. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/couponcare
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
```

Start the backend:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_BASE=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```

### 5. Access the Application
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📚 API Documentation

### Authentication Endpoints

#### `POST /auth/signup`
Register a new user account.
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "User Name"
}
```

#### `POST /auth/login`
Authenticate and receive JWT token.
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### `POST /auth/reset-password-direct`
Reset password using email and display name.
```json
{
  "email": "user@example.com",
  "displayName": "User Name",
  "password": "newsecurepassword"
}
```

#### `GET /auth/me`
Get current user information (requires authentication).

### Coupon Endpoints

#### `POST /coupons`
Create a new coupon for donation (requires authentication).
```json
{
  "brand": "Amazon",
  "code": "SAVE20",
  "valueDescription": "20% off on electronics",
  "expiryDate": "2024-12-31T23:59:59Z",
  "category": "Shopping",
  "city": "Mumbai",
  "restrictions": "Valid on orders above ₹1000",
  "enhancedDescription": "Great deal on laptops and accessories",
  "brandLogoUrl": "https://example.com/logo.png",
  "productImageUrl": "https://example.com/product.jpg",
  "revealMode": "donorApproval",
  "showDonorName": true
}
```

#### `GET /coupons`
List available coupons with optional filters.
Query parameters: `category`, `brand`, `city`

#### `GET /coupons/:id`
Get detailed information about a specific coupon.

### Request Endpoints

#### `GET /requests/incoming`
Get requests for coupons donated by the current user (requires authentication).

#### `GET /requests/outgoing`
Get requests made by the current user (requires authentication).

#### `POST /coupons/:couponId/requests`
Request access to a specific coupon (requires authentication).

#### `POST /requests/:id/approve`
Approve a pending request (requires authentication, donor only).

#### `POST /requests/:id/reject`
Reject a pending request (requires authentication, donor only).

## 🧪 Testing

Run the smoke test to verify basic functionality:
```bash
.\smoke-test.ps1
```

## 🚀 Deployment

### Frontend Deployment (Vercel)
The frontend is configured for deployment on Vercel with the included `vercel.json` configuration.

### Backend Deployment
Deploy the backend to any Node.js hosting service (Heroku, Railway, Render, etc.) with the following environment variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`
- `PORT`

## 🤝 Contributing

We welcome contributions from the community! Here's how you can get involved:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Adding Collaborators
To add a collaborator to this project, please invite **@Adarsh011732** as a collaborator on GitHub. They have been identified as a key contributor and should have write access to the repository.

### Development Guidelines
- Follow TypeScript best practices
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed
- Respect the existing code style and architecture

## 👥 Collaborators

We'd like to recognize our amazing collaborators who have contributed to making CouponCare a reality:

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/Adarsh011732.png" width="100" height="100" alt="Adarsh011732" style="border-radius: 50%;"><br>
      <strong>@Adarsh011732</strong><br>
      <em>Collaborator</em>
    </td>
    <td align="center">
      <img src="https://github.com/yashsinghal1234.png" width="100" height="100" alt="yashsinghal1234" style="border-radius: 50%;"><br>
      <strong>@yashsinghal1234</strong><br>
      <em>Key Contributor</em>
    </td>
  </tr>
</table>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors and the open-source community
- Special recognition to @Adarsh011732 and @yashsinghal1234 for their valuable contributions
- Icons and branding elements courtesy of various open-source projects

---

**Made with ❤️ for a more connected and generous world**
