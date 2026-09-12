# Travel Vacation Adventure — start here

This is a complete static Sri Lanka travel website. The HTML pages, photographs, Blog listing and pagination are already built. There is no Firebase, login, database or image-upload service to configure.

## 1. See the website

Extract the ZIP. Open `index.html` in your browser. Use Home, Blog, the page numbers and the article links. Google fonts require internet access; the site uses system fonts if unavailable.

The package includes eight editable starter articles so you can see two pages of pagination. Review and replace the starter content with your own writing before launching. No posts have been fetched from your Firebase database. The old generic international demo posts are not included in this Sri Lanka version.

## 2. Put it on GitHub Pages

1. Back up your current repository before replacing its website files.
2. Upload the **contents** of this folder to the root of your website repository. `index.html`, `blog/`, `images/` and `assets/` must sit at that root. Do not upload the ZIP itself or put another wrapper folder around the files.
3. Remove the old Firebase/admin files from the published website; they are not needed. The supplied archive contains `serviceAccountKey.json`. If that file contains a real private key and was exposed in GitHub, revoke the key in Google Cloud IAM; deleting the file alone does not revoke it.
4. In GitHub, open **Settings → Pages → Deploy from a branch**, choose your publishing branch (usually `main`) and **/(root)**, then save. Wait for the Pages deployment to finish.

Publishing instructions: [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The SEO URL currently matches the address in your screenshots:

`https://travelvacationsadventure.github.io/blog/`

Because your repository is named `blog`, this is the homepage. The Blog folder inside it is therefore at:

`https://travelvacationsadventure.github.io/blog/blog/`

This is valid. If you later use a custom domain, change `url` in `site.config.json` to its homepage URL, ending with `/`, then run the updater and upload the rebuilt files. Do not point canonicals at a domain you are not using.

## 3. Add your next article

Install a current Node.js LTS release from [nodejs.org](https://nodejs.org/) once on your computer. Node is only used locally to update files. It is not a backend, server or dependency for your visitors.

1. Copy `blog/_template.html` and rename the copy, for example `blog/sri-lanka-honeymoon.html`. Use lowercase letters, numbers and hyphens; keep the `.html` extension.
2. Copy your featured photograph from your computer into `images/`, for example `images/sri-lanka-honeymoon.jpg`.
3. Open the new article in a plain-text/code editor. Search for `POST-META`. Edit the JSON inside that comment. Set the title, short description, category, author, real publication date, image path and image description. Set **`"draft": false`** to include it in the Blog.
4. Search for `ARTICLE-CONTENT-START`. Write your article between that marker and `ARTICLE-CONTENT-END`. Use `<p>` for paragraphs, `<h2>` for section headings, `<h3>` for subheadings and `<ul><li>` for lists. The main title is generated automatically; do not add another `<h1>`.
5. On Windows, double-click **UPDATE-BLOG.cmd**. On any system, open a terminal in this folder and run **`node build.mjs`**.
6. Open the website to check your article, then upload the updated website contents to GitHub. The updater has already refreshed the homepage stories, Blog listing, numbered pages, article metadata and sitemap.

Example metadata (keep the comment markers and JSON punctuation):

```html
<!-- POST-META
{
  "title": "My Sri Lanka honeymoon itinerary",
  "description": "A relaxed route with hill-country mornings and time by the sea.",
  "category": "Itineraries",
  "author": "Your name",
  "date": "2026-09-12",
  "image": "images/sri-lanka-honeymoon.jpg",
  "imageAlt": "Describe what is actually visible in your photograph",
  "draft": false
}
-->
```

Example article content:

```html
<!-- ARTICLE-CONTENT-START -->
<p>Your introduction goes here.</p>
<h2>Start with a comfortable base</h2>
<p>Your advice goes here. Use <strong>bold text</strong> sparingly.</p>
<h2>What to include</h2>
<ul><li>Your first point.</li><li>Your second point.</li></ul>
<figure>
  <img src="../images/sri-lanka-honeymoon.jpg"
       alt="Describe the photograph" loading="lazy"
       width="1200" height="800">
  <figcaption>Your caption goes here.</figcaption>
</figure>
<p><a href="index.html">Read more Sri Lanka articles</a>.</p>
<!-- ARTICLE-CONTENT-END -->
```

**Edit the marked metadata and content, not the generated page title, navigation or related stories.** The updater rebuilds those surrounding sections. For changes to the shared layout, edit `build.mjs`; for visual styling, edit `assets/site.css`.

Images: use JPG, PNG, WebP or AVIF. Use short filenames without spaces. Aim for appropriately compressed photos around 1,200–1,600 pixels wide. The main photo path in metadata starts `images/`; images inserted inside article text start `../images/` because the article is inside `blog/`.

## Editing, drafts and deletion

- **Edit:** change the same article file and run the updater. Add an optional `"updated": "YYYY-MM-DD"` field for a meaningful revision. Keep the filename stable to preserve the URL.
- **Preview:** run the updater and open the article HTML locally before uploading.
- **Draft:** set `"draft": true` and rebuild. Drafts receive `noindex` and are excluded from the Blog, related posts and sitemap. They are **not private** if you upload them. Keep confidential drafts outside the published folder.
- **Delete:** remove the article HTML, rebuild, and also delete that article from GitHub. Uploading other files does not delete the old online page.
- **Pagination:** six articles per page by default. Change `postsPerPage` in `site.config.json` if needed. Extra pages are generated automatically. When deleting enough posts to reduce page count, remove the obsolete `blog/page-N.html` files from GitHub too.
- **No updater installed?** Existing article HTML still displays, but adding a file alone does not add it to the listing. Run the updater to synchronise the listing and SEO fields.

## SEO and indexing

Every public article is a real HTML page with its body available without JavaScript. The site includes unique titles/descriptions, canonical URLs, image descriptions, social sharing metadata, BlogPosting structured data, breadcrumbs and a sitemap. Pagination is made of ordinary crawlable links. The template and drafts are noindex.

After deployment, add your website in Google Search Console, submit `sitemap.xml`, then inspect an article URL and request indexing. Indexing and ranking are Google's decisions; neither static HTML nor `index,follow` guarantees inclusion. [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

For a GitHub project website under `/blog/`, Google reads robots.txt from the **domain root**, not from `/blog/robots.txt`. The included robots.txt is useful if you deploy at a domain root. For your current project URL, submit the sitemap directly in Search Console and ensure any existing root robots.txt does not block `/blog/`.

## Folder guide

| File or folder | Purpose |
| --- | --- |
| `index.html` | Homepage |
| `blog/index.html` | Blog page 1 |
| `blog/page-2.html` | Blog page 2; more generated as needed |
| `blog/*.html` | Your individual article pages |
| `blog/_template.html` | Copy this when writing a new article |
| `images/` | Photos copied from your computer |
| `assets/site.css` | Shared responsive design |
| `assets/site.js` | Mobile menu only; articles need no JavaScript |
| `build.mjs` | Local Blog and SEO updater, with no npm packages |
| `site.config.json` | Website name, public URL and page size |
| `about.html` | About page |
| `404.html` | Missing-page design |
| `blog.html` | Compatibility redirect to the new Blog |
| `sitemap.xml`, `robots.txt` | Search-engine discovery files |

Nothing in this package has been deployed to your live site. Keep the original ZIP as a backup. The redesign does not automatically redirect old `posts/` URLs or Firebase query-string URLs; map any real previously published articles to their new URLs before replacing a site with search traffic.
