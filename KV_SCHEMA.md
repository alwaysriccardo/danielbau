# Cloudflare KV Schema

## Storage Structure

All portfolio metadata is stored in Cloudflare Workers KV using a simple key-value structure.

## Keys

### 1. Projects List
**Key**: `projects`  
**Value**: JSON array of project objects

```json
[
  {
    "id": "project-1234567890",
    "title": "Kitchen Renovation",
    "coverKey": "projects/project-1234567890/1234567890-kitchen.jpg",
    "order": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "project-1234567891",
    "title": "Bathroom Remodel",
    "coverKey": null,
    "order": 1,
    "createdAt": "2024-01-16T14:20:00.000Z"
  }
]
```

### 2. Project Media
**Key**: `project:{projectId}:media`  
**Value**: JSON array of media objects

Example: `project:project-1234567890:media`

```json
[
  {
    "id": "media-1234567890",
    "type": "image",
    "r2Key": "projects/project-1234567890/1234567890-kitchen-1.jpg",
    "order": 0,
    "createdAt": "2024-01-15T10:35:00.000Z"
  },
  {
    "id": "media-1234567891",
    "type": "video",
    "r2Key": "projects/project-1234567890/1234567891-kitchen-video.mp4",
    "order": 1,
    "createdAt": "2024-01-15T10:40:00.000Z"
  }
]
```

## Field Descriptions

### Project Fields
- `id`: Unique project identifier (format: `project-{timestamp}`)
- `title`: Project name/title
- `coverKey`: R2 key for cover image (null if no cover)
- `order`: Display order (0, 1, 2, ...)
- `createdAt`: ISO timestamp

### Media Fields
- `id`: Unique media identifier (format: `media-{timestamp}`)
- `type`: Either `"image"` or `"video"`
- `r2Key`: Full R2 object key (e.g., `projects/project-1234567890/1234567890-file.jpg`)
- `order`: Display order within project (0, 1, 2, ...)
- `createdAt`: ISO timestamp

## Notes

- **No nested data**: Each project's media is stored in a separate key
- **Simple arrays**: Both projects and media are stored as JSON arrays
- **No relationships**: Media doesn't store `projectId` in KV (it's in the key)
- **Ordering**: Both projects and media use numeric `order` field for sorting
- **Cover images**: First image in a project automatically becomes cover (stored in `coverKey`)

## API Mapping

The API endpoints map between KV schema and frontend needs:

- KV `title` → Frontend `name` (for compatibility)
- KV `coverKey` → Frontend `coverImage` (full URL)
- KV `r2Key` → Frontend `key` and `url` (full URL)
- Frontend `mediaCount` → Computed from media array length
