# BrainBox

A personal idea management system designed for **frictionless capture**. BrainBox recognizes that inspiration strikes at unpredictable moments and optimizes for speed of entry rather than elaborate categorization at the point of capture.

## Features

- **Quick Capture** - Rapidly save ideas from the web interface or external tools
- **Keyboard-First Navigation** - Vim-style keybindings for efficient idea management
- **Pinterest-Style Layout** - Masonry grid for visual organization
- **Pin & Color Coding** - Pin important ideas and customize card backgrounds
- **Trash with Recovery** - Soft delete with time tracking and permanent delete option
- **External API** - Connect with automation tools like n8n, Make, Zapier, or any HTTP client

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
| `BRAINBOX_API_KEY` | Secret key for API authentication (32+ characters recommended) |

---

## API Reference

### Base URL
```
https://your-app.vercel.app/api/ideas
```

### Authentication

External API requests require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_BRAINBOX_API_KEY
```

### Endpoints

#### Create Idea
```http
POST /api/ideas
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

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
    "source": "telegram",
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

---

## Connecting with n8n

BrainBox is designed to integrate seamlessly with [n8n](https://n8n.io) for automation workflows. A common use case is capturing ideas from Telegram messages.

### Setup Steps

#### 1. Generate an API Key

Create a strong, random API key (minimum 32 characters):

```bash
openssl rand -base64 32
```

Add this as `BRAINBOX_API_KEY` in your Vercel project environment variables.

#### 2. Create n8n Credentials

In n8n, create a new **Header Auth** credential:

- **Name:** `BrainBox API`
- **Header Name:** `Authorization`
- **Header Value:** `Bearer YOUR_BRAINBOX_API_KEY`

#### 3. Build the Workflow

**Example: Telegram to BrainBox**

```
[Telegram Trigger] --> [HTTP Request] --> [Telegram (Send Reply)]
```

**Telegram Trigger Node:**
- Set up your Telegram bot via BotFather
- Configure the trigger to receive messages

**HTTP Request Node:**
- **Method:** `POST`
- **URL:** `https://your-app.vercel.app/api/ideas`
- **Authentication:** Select your BrainBox API credential
- **Body Content Type:** `JSON`
- **Body:**
```json
{
  "content": "{{ $json.message.text }}"
}
```

**Telegram Reply Node (Optional):**
- Send a confirmation message back to the user

### Example n8n Workflow JSON

```json
{
  "nodes": [
    {
      "name": "Telegram Trigger",
      "type": "n8n-nodes-base.telegramTrigger",
      "parameters": {
        "updates": ["message"]
      }
    },
    {
      "name": "Save to BrainBox",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-app.vercel.app/api/ideas",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "content",
              "value": "={{ $json.message.text }}"
            }
          ]
        }
      }
    },
    {
      "name": "Send Confirmation",
      "type": "n8n-nodes-base.telegram",
      "parameters": {
        "operation": "sendMessage",
        "chatId": "={{ $json.message.chat.id }}",
        "text": "Idea saved!"
      }
    }
  ]
}
```

---

## Connecting with Other Tools

BrainBox works with any tool that can make HTTP requests.

### cURL Example

```bash
curl -X POST "https://your-app.vercel.app/api/ideas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"content": "Idea from terminal"}'
```

### iOS Shortcuts

Create a shortcut that:
1. Asks for input text
2. Makes HTTP request to BrainBox API
3. Shows confirmation

### Zapier / Make

Use the **Webhooks** action to POST to the BrainBox API with your Bearer token.

### Alfred / Raycast

Create a workflow that captures selected text or clipboard and sends to BrainBox.

---

## Database Schema

```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
