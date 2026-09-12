# Validation

Checked during creation:

- All 15 HTML files parsed; primary pages have exactly one H1.
- Internal links, local images, scripts, stylesheets and section anchors resolve.
- Public pages contain canonical URLs; JSON-LD and sitemap XML parse correctly.
- Eight public articles appear across two Blog pages, six on page 1 and two on page 2.
- The template is excluded from the sitemap.
- Rebuilding unchanged sources produces identical HTML.
- Copying the template, setting draft to false and rebuilding adds the article to the listing and sitemap.
- Deleting articles and rebuilding removes an obsolete pagination page.
- No Firebase code, admin login or service-account key is included in the package.

The two included photographs were visually inspected. Browser installation was unavailable in the workspace, so desktop/mobile browser rendering has not been visually verified. Open index.html and check the mobile menu, article layout and Blog page numbers in your browser before publishing.

No live GitHub deployment or Google indexing was performed.
