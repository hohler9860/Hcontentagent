import 'dotenv/config'
import { writeFileSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../src/data')
const POSTS_FILE = resolve(DATA_DIR, 'competitor-posts.json')
const LOG_FILE = resolve(DATA_DIR, 'scrape-log.json')

const TOKEN = process.env.APIFY_API_TOKEN
if (!TOKEN) {
  console.error('Missing APIFY_API_TOKEN. Copy .env.example to .env and add your token.')
  process.exit(1)
}

const PROFILES = ['dula.mov', 'ciaociaochau']
const RESULTS_LIMIT = 20

async function runActor(usernames) {
  const input = {
    usernames,
    resultsLimit: RESULTS_LIMIT,
  }

  console.log(`Starting scrape for: ${usernames.join(', ')}...`)

  const res = await fetch('https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=' + TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error(`Apify API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

function extractPosts(profiles) {
  const posts = []

  for (const profile of profiles) {
    if (!profile.latestPosts) continue

    for (const post of profile.latestPosts) {
      posts.push({
        id: post.id,
        shortCode: post.shortCode,
        type: post.type,
        caption: post.caption || '',
        timestamp: post.timestamp,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        videoViewCount: post.videoViewCount || null,
        videoPlayCount: post.videoPlayCount || null,
        displayUrl: post.displayUrl || '',
        ownerUsername: post.ownerUsername || profile.username,
        url: post.url || `https://www.instagram.com/p/${post.shortCode}/`,
        isPinned: post.isPinned || false,
      })
    }
  }

  return posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

async function main() {
  try {
    const profiles = await runActor(PROFILES)
    const posts = extractPosts(profiles)

    writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2))

    const log = {
      lastRun: new Date().toISOString(),
      postsScraped: posts.length,
      byProfile: PROFILES.map(handle => ({
        handle: '@' + handle,
        count: posts.filter(p => p.ownerUsername === handle).length,
      })),
      status: 'success',
    }
    writeFileSync(LOG_FILE, JSON.stringify(log, null, 2))

    const summary = log.byProfile.map(p => `${p.count} from ${p.handle}`).join(', ')
    console.log(`Scraped ${posts.length} posts (${summary}). Saved to competitor-posts.json.`)
  } catch (err) {
    console.error('Scrape failed:', err.message)

    const log = {
      lastRun: new Date().toISOString(),
      postsScraped: 0,
      status: 'error',
      error: err.message,
    }
    writeFileSync(LOG_FILE, JSON.stringify(log, null, 2))

    // Keep existing posts file intact
    try {
      readFileSync(POSTS_FILE)
      console.log('Existing competitor-posts.json preserved.')
    } catch {
      console.log('No existing data found.')
    }

    process.exit(1)
  }
}

main()
