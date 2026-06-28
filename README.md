# Chhayapoth (ছায়াপথ)

A premium, Neobrutalist multipage publishing platform and social stream for serialized stories, blogs, and micro-posts. Built with a high-fidelity design system combining the best features of **Substack, Medium, Reddit, and Netflix**.

---

## 🎨 Architectural Design & Philosophy

Chhayapoth ("The Milky Way" in Bengali) is designed to solve the friction of traditional writing platforms. Instead of forcing authors to navigate complex setup wizards for every story, it introduces the concept of **Spaces** (equivalent to subreddits or publications). 

Authors can create three types of Spaces:
1. **Novel Series ( s/ )**: Sequential chapter-based stories (Novels, short stories) with automated episode numbering.
2. **Blog Spaces ( s/ )**: Traditional publications for essays, research, and standalone articles.
3. **Micro-Post Streams ( s/ )**: Twitter/Reddit-style feeds for quick thoughts, updates, or poetry.

---

## 🚀 Key Features

* **Feed Quick Composer**: Post thoughts, images, and formatted content in markdown directly from the feed timeline.
* **Tilted Space Covers**: Widescreen cover cards tilt dynamically (`transform: rotate(-2.5deg)`) behind posts, peeking out to invite engagement.
* **Interactive Episode Drawer**: Clicking a Space card opens an inline interactive modal browser that fetches and lists the space's table of contents dynamically.
* **Space Manager Dashboard**: Complete self-serve customizer for authors to edit space titles, descriptions, and upload covers directly to Cloudflare R2 storage.
* **Multi-Genre Hashtagging**: Support for up to 3 selected genres per post with custom filters applied directly on the stream feed.
* **Self-Healing Auth Sync**: Clerk session states automatically update and synchronize user credentials (usernames, emails, and avatars) to local PostgreSQL records upon active visits.

---

## 🛠️ Tech Stack

* **Core Framework**: Next.js 16 (App Router) & React 19
* **Styling**: Vanilla CSS (Tailored Design Tokens, Neobrutalist Layouts, 3D depths)
* **Database**: Supabase (PostgreSQL)
* **Authentication**: Clerk (User management & Session lifecycle)
* **Storage**: Cloudflare R2 (S3-compatible Object Storage for media assets)
* **Icons**: Lucide React

---

## 📂 Project Structure

```text
├── src/
│   ├── app/                      # Next.js App Router Pages & APIs
│   │   ├── api/                  # Backend Route Handlers
│   │   │   ├── auth/sync/        # Clerk profile database sync
│   │   │   ├── posts/            # CRUD operations for feed posts
│   │   │   ├── series/           # CRUD operations for spaces/series
│   │   │   └── upload/           # Cloudflare R2 bucket uploader
│   │   ├── author/               # Creator dashboard & write pages
│   │   ├── authors/[id]/         # Public author profile views
│   │   ├── explore/              # Netflix-style Space catalog
│   │   ├── posts/[id]/           # Single publication layout
│   │   ├── series/[id]/          # Dedicated space homepage
│   │   ├── globals.css           # Global design system tokens & animations
│   │   ├── layout.js             # Root layout & Clerk provider wrapping
│   │   └── page.js               # Main stream feed page
│   │
│   ├── components/               # Modular UI Elements
│   │   ├── Button3D.jsx          # Neobrutalist 3D-button layout
│   │   ├── QuickComposer.jsx     # Inline feed markdown uploader
│   │   ├── RichEditor.jsx        # Fullscreen editor with workspace customizer
│   │   ├── SocialPostCard.jsx    # Feed card featuring tilted background art
│   │   └── DashboardSpacesManager.js # Space configuration modal interface
│   │
│   └── lib/                      # Core Adapters & SDKs
│       ├── auth.js               # Clerk authentication helpers
│       ├── db.js                 # Supabase client query builders
│       └── storage.js            # Cloudflare R2 SDK S3 client
│
├── supabase_schema.sql           # Database Table Schema & Functions
└── .env.example                  # Environment Variables Template
```

---

## ⚙️ Local Setup Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/subhadipray99/chhayapoth.git
cd chhayapoth
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
cp .env.example .env.local
```

### 3. Initialize PostgreSQL Database
Copy the contents of `supabase_schema.sql` and run them inside your **Supabase SQL Editor** to set up tables, triggers, and RPC functions.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛡️ Production Deployment (Vercel)
This repository is pre-configured and fully Vercel-ready. 
1. Import this repository into Vercel.
2. In Vercel Project Settings, add all environment variables listed in `.env.example`.
3. Vercel automatically deploys the serverless route matches and server components.
