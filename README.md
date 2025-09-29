# Rate and Review Web Application

A full-stack web application that allows users to rate and review stores. The platform supports three user roles: **System Administrator**, **Store Owner**, and **Normal User**. Each role has access to different functionalities as described below.

---

## 🚀 Live Demo

[https://rate-and-review-frontend.vercel.app/](https://rate-and-review-frontend.vercel.app/)

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Express.js (deployed on Render)
- **Database:** PostgreSQL/MySQL (as per backend setup)
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 👤 User Roles & Features

### 1. System Administrator
- Add new stores, normal users, and admin users
- Dashboard with total number of submitted ratings
- View and filter lists of stores and users
- View user details (including ratings for store owners)
- Log out

### 2. Store Owner
- Dashboard with their stores and ratings
- View users who rated their stores
- View store rating statistics
- Log out

### 3. Normal User
- Sign up and log in
- Update password
- View and search all registered stores
- Submit and modify ratings for stores
- Log out

---

## 🔒 Admin Portal Access

**Admin Login Credentials:**

- **Email:** roxlier@gmail.com
- **Password:** Roxlier@123

---

## 📸 Screenshots
login page - 
<img width="1360" height="682" alt="image" src="https://github.com/user-attachments/assets/fa8803b7-184c-4ec3-b497-31204736b2b7" />
admin-dashboard -
<img width="1359" height="692" alt="image" src="https://github.com/user-attachments/assets/26e437d7-e7f1-44fc-b454-efb8d56953e4" />


## ⚙️ Project Structure

```
Rate_and_Review_Frontend/
├── public/
│   └── rate_and_review.png
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

---

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=https://rate-and-review-backend.onrender.com
```

---

## 📝 Setup & Development

1. **Clone the repository:**
   ```
   git clone <your-repo-url>
   cd Rate_and_Review_Frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Add environment variables:**  
   Create a `.env` file as shown above.

4. **Run locally:**
   ```
   npm run dev
   ```

5. **Build for production:**
   ```
   npm run build
   ```

---

## 🏗️ Deployment

- **Frontend:** Deployed on [Vercel](https://vercel.com/)
- **Backend:** Deployed on [Render](https://render.com/)

---

## 📄 License

This project is for demonstration and educational purposes.

---

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [Render](https://render.com/)
- [Vercel](https://vercel.com/)

---

**Feel free to contribute or raise issues!**
