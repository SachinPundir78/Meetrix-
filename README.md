# <img src="frontend/public/pwa-512x512.png" width="48" alt="Meetrix Icon" align="center"> 𝓜𝓮𝓮𝓽𝓻𝓲𝔁 𝓖𝓻𝓸𝓾𝓹𝓼

> 📖 **𝓔𝓷𝓰𝓵𝓲𝓼𝓱 𝓠𝓾𝓸𝓽𝓮:**
> *"𝓣𝓲𝓶𝓮 𝓲𝓼𝓷'𝓽 𝓪 𝓬𝓸𝓶𝓶𝓸𝓭𝓲𝓽𝔂, 𝓲𝓽'𝓼 𝓪 𝓬𝓪𝓷𝓿𝓪𝓼. 𝓦𝓱𝓮𝓷 𝔀𝓮 𝓪𝓵𝓲𝓰𝓷 𝓸𝓾𝓻 𝓶𝓸𝓶𝓮𝓷𝓽𝓼, 𝔀𝓮 𝓹𝓪𝓲𝓷𝓽 𝓸𝓾𝓻 𝓼𝓾𝓬𝓬𝓮𝓼𝓼 𝓽𝓸𝓰𝓮𝓽𝓱𝓮𝓻."* 🎨✨

Where effortless collaboration meets elegant scheduling.

Meetrix Groups is a refined full-stack platform designed to help hosts propose meeting options, collect guest availability, and confirm the perfect time with clarity and style.

---

## ✨ 𝓦𝓱𝔂 𝓲𝓽 𝓯𝓮𝓮𝓵𝓼 𝓭𝓲𝓯𝓯𝓮𝓻𝓮𝓷𝓽

- A graceful, modern experience for hosts and guests
- Fast and intuitive meeting creation flow
- Smart availability voting with visual clarity
- Polished UI crafted for both desktop and mobile
- Designed to make planning feel calm, confident, and effortless

---

## 🌟 𝓒𝓸𝓻𝓮 𝓕𝓮𝓪𝓽𝓾𝓻𝓮𝓼:

- Secure Google authentication for effortless sign-in
- Create meetings with multiple proposed time slots
- Guests vote on their availability with ease
- View availability insights through a clean dashboard experience
- Send invitations and confirmations through email workflows
- Finalize the best time with a smooth host-led decision flow

---

## 🖼️ 𝓥𝓲𝓼𝓾𝓪𝓵 𝓢𝓱𝓸𝔀𝓬𝓪𝓼𝓮

![P1](frontend/public/P1.png)

![P2](frontend/public/P2.png)

![P3](frontend/public/P3.png)

![P4](frontend/public/P4.png)

![P5](frontend/public/P5.png)

![P6](frontend/public/P6.png)

---

## 🏗️ 𝓟𝓻𝓸𝓳𝓮𝓬𝓽 𝓢𝓽𝓻𝓾𝓬𝓽𝓾𝓻𝓮

```text
meetrix/
├── backend/      # Express.js API and business logic
├── frontend/     # React + TypeScript experience
└── README.md     # Project overview
```

---

## ⚙️ 𝓣𝓮𝓬𝓱 𝓢𝓽𝓪𝓬𝓴

### 𝓑𝓪𝓬𝓴𝓮𝓷𝓭
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Clerk OAuth authentication
- Nodemailer for email delivery
- JWT-based session handling
- Zod for schema validation

### 𝓕𝓻𝓸𝓷𝓽𝓮𝓷𝓭
- React + TypeScript
- Vite for blazing-fast development
- Tailwind CSS for styling
- shadcn/ui for polished components
- Zustand for state management

---

## 🚀 𝓖𝓮𝓽𝓽𝓲𝓷𝓰 𝓢𝓽𝓪𝓻𝓽𝓮𝓭

### 𝓟𝓻𝓮𝓻𝓮𝓺𝓾𝓲𝓼𝓲𝓽𝓮𝓼
- Node.js 18+
- PostgreSQL
- Clerk OAuth credentials
- SMTP credentials for email sending

### 𝓑𝓪𝓬𝓴𝓮𝓷𝓭 𝓢𝓮𝓽𝓾𝓹

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file inside the backend folder:
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/meetrix

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET=your_super_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google OAuth / AI
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_API_KEY=your_google_ai_api_key

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_NAME=Meetrix Groups
BREVO_SENDER_EMAIL=no-reply@yourdomain.com
```

> Use your actual Clerk and email credentials from the respective dashboards. Keep this file private and do not commit it.

4. Run migrations:
```bash
npm run db:push
```

5. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### 𝓕𝓻𝓸𝓷𝓽𝓮𝓷𝓭 𝓢𝓮𝓽𝓾𝓹

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file inside the frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

> The frontend uses the same Clerk publishable key that is configured in the backend authentication flow.

4. Start the frontend app:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 𝓚𝓮𝔂 𝓐𝓟𝓘 𝓡𝓸𝓾𝓽𝓮𝓼

- `POST /auth/google` - Sign in with Google
- `POST /meetings` - Create a meeting
- `GET /meetings/mine` - Fetch meetings created by the host
- `GET /meetings/admin/:meetingId` - Access meeting dashboard data
- `POST /meetings/:meetingId/confirm` - Confirm final scheduling
- `GET /meetings/guest/:guestSlug` - View guest-facing meeting details
- `POST /meetings/guest/:guestSlug/vote` - Submit guest availability

---

## 🧪 𝓐𝓿𝓪𝓲𝓵𝓪𝓫𝓵𝓮 𝓢𝓬𝓻𝓲𝓹𝓽𝓼

### 𝓑𝓪𝓬𝓴𝓮𝓷𝓭
```bash
npm run dev
npm start
npm run db:push
```

### 𝓕𝓻𝓸𝓷𝓽𝓮𝓷𝓭
```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run test:watch
```

---

## 🖋️ 𝓒𝓵𝓸𝓼𝓲𝓷𝓰 𝓝𝓸𝓽𝓮

Designed to make coordination feel simple, elegant, and beautifully organized.

---

© 2026 Meetrix Groups. All rights reserved by Sachin.

ISC

## 👥 𝓒𝓸𝓷𝓽𝓻𝓲𝓫𝓾𝓽𝓲𝓷𝓰

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 𝓢𝓾𝓹𝓹𝓸𝓻𝓽

For issues and questions, please create an issue in the repository.
