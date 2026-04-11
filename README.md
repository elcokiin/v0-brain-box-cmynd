# BrainBox

A personal idea management system designed for **frictionless capture**. BrainBox recognizes that inspiration strikes at unpredictable moments and optimizes for speed of entry rather than elaborate categorization at the point of capture.

## Features

- **Quick Capture** - Rapidly save ideas from the web interface or external tools
- **Keyboard-First Navigation** - Vim-style keybindings for efficient idea management
- **Pinterest-Style Layout** - Masonry grid for visual organization
- **Pin & Color Coding** - Pin important ideas and customize card backgrounds
- **Trash with Recovery** - Soft delete with time tracking and permanent delete option
- **API Keys for HTTP Capture** - Create per-user keys from Settings and send ideas via HTTP
- **PWA Install Support** - Install BrainBox on mobile home screen

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | Create new idea |
| `j` / `k` | Navigate down / up |
| `h` / `l` | Navigate left / right |
| `Enter` | Open card menu |
| `Esc` | Close menu / deselect |
| `e` | Open settings |
| `Ctrl+1` | Switch to Inbox |
| `Ctrl+2` | Switch to Archived |
| `Ctrl+3` | Switch to Trash |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |

---

## API Reference

### Base URL
```
https://your-app.vercel.app/api/ideas
```

### Authentication

You can authenticate API requests in two ways:

1. Browser session cookie (when logged in to the web app)
2. API key in header:

```http
Authorization: Bearer bb_your_api_key_here
```

### Endpoints

#### Create Idea
```http
POST /api/ideas
Content-Type: application/json
Authorization: Bearer bb_your_api_key_here

{
  "content": "My brilliant idea"
}
```

**Response (201):**
```json
{
  "idea": {
    "id": "uuid",
    "content": "My brilliant idea",
    "source": "api",
    "status": "inbox",
    "pinned": false,
    "background_color": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### List Ideas
```http
GET /api/ideas?status=inbox
GET /api/ideas?status=archived
GET /api/ideas?status=deleted
GET /api/ideas?status=inbox&search=keyword
```

#### Update Idea
```http
PATCH /api/ideas/{id}
Content-Type: application/json

{
  "status": "archived",
  "pinned": true,
  "background_color": "mint"
}
```

**Available colors:** `coral`, `peach`, `sand`, `mint`, `sage`, `fog`, `storm`, `dusk`, `lavender`, `blossom`, `rose`

#### Delete Idea Permanently
```http
DELETE /api/ideas/{id}
```

### Generate API Keys

Open Settings and go to `API Keys`:

- Create a named key
- Copy it once (full value is only shown on creation)
- Rename or delete keys anytime

### cURL Example

```bash
curl -X POST "http://localhost:3000/api/ideas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bb_your_api_key_here" \
  -d '{"content":"Idea from terminal"}'
```

---

## Database Schema

```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'web',
  status TEXT DEFAULT 'inbox',
  tags TEXT[],
  pinned BOOLEAN DEFAULT false,
  background_color TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Neon (Serverless PostgreSQL)
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Deployment:** Vercel

---

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## License

MIT
