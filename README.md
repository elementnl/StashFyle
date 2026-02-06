# StashFyle

File storage API that works with any stack. No SDK required.

Skip the S3/IAM/CORS dance. POST a file, get a URL. Works from curl, Python, Go, Ruby, PHP - anything that can make HTTP requests.

## Why StashFyle?

Most file upload services lock you into their SDK or require complex widget integrations. StashFyle is just a REST API with simple, predictable pricing.

- **Any language** - No SDK required. If you can make HTTP requests, you can use StashFyle.
- **Simple pricing** - Flat monthly tiers. No per-request fees, no calculators.
- **Fast** - Files served from Cloudflare's edge network.
- **Private files** - Signed URLs with configurable expiration.

## Quick Start

```bash
# Upload a file
curl -X POST https://api.stashfyle.com/v1/upload \
  -H "Authorization: Bearer sk_live_xxx" \
  -F "file=@photo.jpg"

# Response
{
  "id": "f_abc123",
  "url": "https://cdn.stashfyle.com/f_abc123/photo.jpg",
  "size_bytes": 245678
}
```

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Auth**: Supabase Auth (dashboard), API keys (API)
- **Billing**: Stripe
- **Rate Limiting**: Upstash Redis

## Documentation

Full API reference available in [docs/](docs/).

## License

MIT
