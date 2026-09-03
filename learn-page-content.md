# HueSet website content — Learn page source

Copy/paste reference for building or rewriting `/learn`. Values match shipped copy as of Phase 2.

---

## Site variables

```
SITE_NAME=HueSet
SITE_TAGLINE=Preview your website or app style before you build
SITE_ONE_LINER=A visual design and colour testing tool — sitting between a simple palette generator and a professional design application.

BRAND_CTA=#13A8E7
BRAND_INK=#0A6288
BRAND_SECONDARY=#0C6D96
SUPPORT_EMAIL=cavenlink.dev@gmail.com

ROUTE_HOME=/
ROUTE_APP=/app
ROUTE_GENERATE=/generate
ROUTE_QUICK_DESIGN=/quick-design
ROUTE_LEARN=/learn
ROUTE_EXAMPLES=/examples
ROUTE_HELP=/help
ROUTE_PRICING=/pricing
ROUTE_CONTACT=/contact
ROUTE_ABOUT=/about
ROUTE_PRIVACY=/privacy
ROUTE_TERMS=/terms
```

### Product facts (keep copy honest)

```
EARLY_ACCESS=true
EXPORT_LIVE=false
PAYMENTS_LIVE=false
STORAGE=local browser (localStorage); nothing uploaded to HueSet servers
FIRST_DESIGN_FREE=true
BRAND_ASSETS_FREE=true
FULL_SCREEN_FREE=true
FIRST_EXPORT_PRICE=$0.99 USD one-time (planned)
PRO_PRICE=$14.99 USD/month (planned)
SECOND_OPINION=Pro feature when available
```

### Primary CTAs

```
CTA_GENERATE=Generate a Design
CTA_QUICK_DESIGN=Quick Design
CTA_OPEN_HUESET=Open HueSet
CTA_START_LEARNING=Start Learning
CTA_VIEW_EXAMPLES=View Examples
CTA_HELP=Help & guide
CTA_TRY_IT_YOURSELF=Try it yourself
```

---

## Learn page — page meta

```
PAGE_TITLE=Learn — HueSet
META_DESCRIPTION=Learn how experienced designers make good decisions about colour, type, layout, accessibility, and design systems.
PATH=/learn
```

---

## Learn page — hero

```
H1=Learn

SUBTITLE=Practical lessons on colour, typography, layout, accessibility, and design systems. Written for designers and developers who want to make better visual decisions — no jargon walls, no prerequisites.
```

---

## Learn page — lesson index heading

```
INDEX_HEADING=Lessons
```

---

## Learn page — lessons

### Lesson 01 — Colour basics

```
ID=colour-basics
NUMBER=01
TITLE=Colour basics
SUMMARY=Hue, saturation, lightness, and how they shape what people feel when they look at your design.

SECTION_1_HEADING=Hue, saturation, lightness
SECTION_1_BODY=Every colour can be described with three numbers. Hue is the position on the colour wheel — red, orange, yellow, green, blue, violet. Saturation is how vivid the colour is: 100% is pure colour, 0% is grey. Lightness is how close the colour is to white or black. HueSet shows all three when you open a swatch editor so you can adjust each one independently.

SECTION_2_HEADING=Warm and cool
SECTION_2_BODY=Reds, oranges, and yellows feel warm — energetic, urgent, inviting. Blues, greens, and violets feel cool — calm, trustworthy, professional. Most palettes mix warm and cool colours to create contrast and guide attention. A landing page might use a cool blue background with a warm orange call-to-action button.

SECTION_3_HEADING=Colour relationships
SECTION_3_BODY=Complementary colours sit opposite each other on the wheel (blue and orange, red and green). They create strong contrast. Analogous colours sit next to each other (blue, teal, green) and feel harmonious. Triadic colours are evenly spaced (red, yellow, blue) and feel balanced but vibrant. You do not need to memorise these — just notice what feels right when you preview your palette in HueSet.
```

### Lesson 02 — Building palettes

```
ID=building-palettes
NUMBER=02
TITLE=Building palettes
SUMMARY=How to choose colours that work together — and the roles those colours play in a real interface.

SECTION_1_HEADING=Start with one colour
SECTION_1_BODY=Pick the colour that matters most — usually your brand colour or primary action colour. Everything else should support it. In HueSet, set your first swatch to that colour, then build around it.

SECTION_2_HEADING=Assign roles, not just colours
SECTION_2_BODY=A palette is not a random list of colours. Each colour has a job: background, surface, primary action, heading text, body text, border. HueSet lets you assign roles to swatches so changing one colour updates every element that uses that role. This is how real design systems work.

SECTION_3_HEADING=Limit your palette
SECTION_3_BODY=Most good interfaces use three to six colours. A neutral background, a surface colour for cards and inputs, a primary accent for buttons and links, a text colour for headings, a softer text colour for body copy, and a border colour. More than that usually means the palette is doing too many jobs.

SECTION_4_HEADING=Use Randomise to explore
SECTION_4_BODY=Lock the colours you like, then press Randomise to generate new ones for the rest. This is faster than picking every colour manually and often produces combinations you would not have tried.
```

### Lesson 03 — Typography in interfaces

```
ID=typography
NUMBER=03
TITLE=Typography in interfaces
SUMMARY=Font size, weight, line height, and the small decisions that make text easy or painful to read.

SECTION_1_HEADING=Size hierarchy
SECTION_1_BODY=Body text in web interfaces should be at least 16 pixels. Headings should be noticeably larger — typically 24 to 48 pixels depending on importance. Labels and captions can be smaller (12 to 14 pixels) but should never be the main reading text. HueSet previews use this scale so your palette is tested at realistic sizes.

SECTION_2_HEADING=Weight and emphasis
SECTION_2_BODY=Bold text draws the eye. Use it for headings, labels, and buttons — not for entire paragraphs. Semibold (600 weight) is useful for navigation items and secondary headings. Regular weight (400) is for body text. Avoid using more than two or three weights in one interface.

SECTION_3_HEADING=Line height and spacing
SECTION_3_BODY=Body text needs generous line height — 1.5 to 1.7 times the font size. Headings can be tighter (1.1 to 1.3). Paragraphs need clear spacing between them. Cramped text is the fastest way to make a polished layout feel amateur.

SECTION_4_HEADING=Font pairing
SECTION_4_BODY=One font for headings, one for body text is a safe starting point. Sans-serif fonts (Inter, Poppins, Instrument Sans) are the standard for interfaces. Serif fonts (Instrument Serif, Georgia) work well for headings when you want a more editorial feel. Monospace fonts (JetBrains Mono, Fira Code) are for code and technical data only.
```

### Lesson 04 — Layout principles

```
ID=layout
NUMBER=04
TITLE=Layout principles
SUMMARY=Spacing, alignment, and visual hierarchy — the structure that makes a design feel intentional.

SECTION_1_HEADING=Consistent spacing
SECTION_1_BODY=Use a spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 pixels. Every margin, padding, and gap should come from this scale. This creates visual rhythm without thinking about every individual value. HueSet templates follow this pattern.

SECTION_2_HEADING=Alignment
SECTION_2_BODY=Left-align text in most interfaces (right-to-left languages excepted). Centre-align headings and hero text sparingly. Never mix alignment within the same section. Misaligned elements make a layout look unfinished even when the colours and typography are good.

SECTION_3_HEADING=Visual hierarchy
SECTION_3_BODY=The most important element should be the largest, highest-contrast, or most colourful thing on the page. Secondary elements should be smaller or lower-contrast. When everything is the same size and weight, nothing stands out and the user does not know where to look.

SECTION_4_HEADING=Responsive structure
SECTION_4_BODY=A layout that works at 1440 pixels wide needs to work at 390 pixels wide. This usually means single-column on mobile, two or three columns on desktop. Navigation collapses into a menu. Images scale down. HueSet previews show both desktop and mobile layouts so you can test your palette at both sizes.
```

### Lesson 05 — Colour and accessibility

```
ID=accessibility
NUMBER=05
TITLE=Colour and accessibility
SUMMARY=Contrast ratios, WCAG guidelines, and practical steps to make your colours work for everyone.

SECTION_1_HEADING=Why contrast matters
SECTION_1_BODY=Roughly 1 in 12 men and 1 in 200 women have some form of colour vision deficiency. Low contrast between text and background makes content hard to read for everyone — especially in bright sunlight, on low-quality screens, or for people with reduced vision.

SECTION_2_HEADING=WCAG contrast requirements
SECTION_2_BODY=The Web Content Accessibility Guidelines (WCAG) define minimum contrast ratios. Normal text (under 18 pixels, or under 14 pixels bold) needs at least 4.5:1 contrast against its background to pass AA. Large text (18 pixels and above, or 14 pixels bold and above) needs at least 3:1. These are minimums — higher contrast is usually better.

SECTION_3_HEADING=Checking contrast in practice
SECTION_3_BODY=HueSet shows contrast ratios when you use Second Opinion (a Pro feature when available). You can also check manually: pick your text colour and background colour, calculate the contrast ratio using the formula in the WCAG specification, and compare to the 4.5:1 or 3:1 threshold. Free online tools exist for quick checks.

SECTION_4_HEADING=Do not rely on colour alone
SECTION_4_BODY=Error states should not just turn text red — add an icon, underline, or label. Links should be underlined or visually distinct beyond just colour. Status indicators (success, warning, error) should include text labels. This ensures people who cannot distinguish certain colours still understand the interface.
```

### Lesson 06 — Design systems

```
ID=design-systems
NUMBER=06
TITLE=Design systems
SUMMARY=Tokens, roles, and the thinking behind reusable, consistent design that scales beyond one page.

SECTION_1_HEADING=What is a design system?
SECTION_1_BODY=A design system is a set of reusable decisions: colours, typography, spacing, component styles, and the rules for using them. Instead of writing #0A6288 in your CSS, you write --color-primary. If the brand colour changes, you update one token and everything follows. HueSet roles work the same way — assign a colour to a role, and every element using that role stays consistent.

SECTION_2_HEADING=Design tokens
SECTION_2_BODY=Tokens are named values that represent design decisions. Instead of writing #0A6288 in your CSS, you write --color-primary. If the brand colour changes, you update one token and everything follows. HueSet exports colour values in token-friendly formats (CSS custom properties, JSON, Tailwind config) when export is available.

SECTION_3_HEADING=Semantic vs primitive tokens
SECTION_3_BODY=Primitive tokens are raw values: blue-500, grey-200. Semantic tokens describe purpose: text-primary, surface-card, border-input. Semantic tokens are more useful because they tell you what the colour is for, not just what it looks like. When you switch themes (light to dark), semantic tokens let you swap entire palettes without renaming anything.

SECTION_4_HEADING=Starting small
SECTION_4_BODY=You do not need a full design system on day one. Start with a consistent palette, a clear type scale, and a spacing system. Add component patterns as you build. HueSet is designed for this starting point — test your colour decisions on real layouts before committing to a full system.
```

---

## Learn page — bottom CTA block

```
CTA_HEADING=Try it yourself
CTA_BODY=The fastest way to learn is to experiment. Open Quick Design and start testing colours on real layouts.
CTA_PRIMARY_LABEL=Open Quick Design
CTA_PRIMARY_HREF=/quick-design
CTA_SECONDARY_LABEL=Help & guide
CTA_SECONDARY_HREF=/help
CTA_BUTTON_FILL=#0A6288
```

---

## Learn page — plain markdown (paste-ready)

# Learn

Practical lessons on colour, typography, layout, accessibility, and design systems. Written for designers and developers who want to make better visual decisions — no jargon walls, no prerequisites.

## Lessons

1. **Colour basics** — Hue, saturation, lightness, and how they shape what people feel when they look at your design.
2. **Building palettes** — How to choose colours that work together — and the roles those colours play in a real interface.
3. **Typography in interfaces** — Font size, weight, line height, and the small decisions that make text easy or painful to read.
4. **Layout principles** — Spacing, alignment, and visual hierarchy — the structure that makes a design feel intentional.
5. **Colour and accessibility** — Contrast ratios, WCAG guidelines, and practical steps to make your colours work for everyone.
6. **Design systems** — Tokens, roles, and the thinking behind reusable, consistent design that scales beyond one page.

---

## 01 Colour basics

Hue, saturation, lightness, and how they shape what people feel when they look at your design.

### Hue, saturation, lightness

Every colour can be described with three numbers. Hue is the position on the colour wheel — red, orange, yellow, green, blue, violet. Saturation is how vivid the colour is: 100% is pure colour, 0% is grey. Lightness is how close the colour is to white or black. HueSet shows all three when you open a swatch editor so you can adjust each one independently.

### Warm and cool

Reds, oranges, and yellows feel warm — energetic, urgent, inviting. Blues, greens, and violets feel cool — calm, trustworthy, professional. Most palettes mix warm and cool colours to create contrast and guide attention. A landing page might use a cool blue background with a warm orange call-to-action button.

### Colour relationships

Complementary colours sit opposite each other on the wheel (blue and orange, red and green). They create strong contrast. Analogous colours sit next to each other (blue, teal, green) and feel harmonious. Triadic colours are evenly spaced (red, yellow, blue) and feel balanced but vibrant. You do not need to memorise these — just notice what feels right when you preview your palette in HueSet.

---

## 02 Building palettes

How to choose colours that work together — and the roles those colours play in a real interface.

### Start with one colour

Pick the colour that matters most — usually your brand colour or primary action colour. Everything else should support it. In HueSet, set your first swatch to that colour, then build around it.

### Assign roles, not just colours

A palette is not a random list of colours. Each colour has a job: background, surface, primary action, heading text, body text, border. HueSet lets you assign roles to swatches so changing one colour updates every element that uses that role. This is how real design systems work.

### Limit your palette

Most good interfaces use three to six colours. A neutral background, a surface colour for cards and inputs, a primary accent for buttons and links, a text colour for headings, a softer text colour for body copy, and a border colour. More than that usually means the palette is doing too many jobs.

### Use Randomise to explore

Lock the colours you like, then press Randomise to generate new ones for the rest. This is faster than picking every colour manually and often produces combinations you would not have tried.

---

## 03 Typography in interfaces

Font size, weight, line height, and the small decisions that make text easy or painful to read.

### Size hierarchy

Body text in web interfaces should be at least 16 pixels. Headings should be noticeably larger — typically 24 to 48 pixels depending on importance. Labels and captions can be smaller (12 to 14 pixels) but should never be the main reading text. HueSet previews use this scale so your palette is tested at realistic sizes.

### Weight and emphasis

Bold text draws the eye. Use it for headings, labels, and buttons — not for entire paragraphs. Semibold (600 weight) is useful for navigation items and secondary headings. Regular weight (400) is for body text. Avoid using more than two or three weights in one interface.

### Line height and spacing

Body text needs generous line height — 1.5 to 1.7 times the font size. Headings can be tighter (1.1 to 1.3). Paragraphs need clear spacing between them. Cramped text is the fastest way to make a polished layout feel amateur.

### Font pairing

One font for headings, one for body text is a safe starting point. Sans-serif fonts (Inter, Poppins, Instrument Sans) are the standard for interfaces. Serif fonts (Instrument Serif, Georgia) work well for headings when you want a more editorial feel. Monospace fonts (JetBrains Mono, Fira Code) are for code and technical data only.

---

## 04 Layout principles

Spacing, alignment, and visual hierarchy — the structure that makes a design feel intentional.

### Consistent spacing

Use a spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 pixels. Every margin, padding, and gap should come from this scale. This creates visual rhythm without thinking about every individual value. HueSet templates follow this pattern.

### Alignment

Left-align text in most interfaces (right-to-left languages excepted). Centre-align headings and hero text sparingly. Never mix alignment within the same section. Misaligned elements make a layout look unfinished even when the colours and typography are good.

### Visual hierarchy

The most important element should be the largest, highest-contrast, or most colourful thing on the page. Secondary elements should be smaller or lower-contrast. When everything is the same size and weight, nothing stands out and the user does not know where to look.

### Responsive structure

A layout that works at 1440 pixels wide needs to work at 390 pixels wide. This usually means single-column on mobile, two or three columns on desktop. Navigation collapses into a menu. Images scale down. HueSet previews show both desktop and mobile layouts so you can test your palette at both sizes.

---

## 05 Colour and accessibility

Contrast ratios, WCAG guidelines, and practical steps to make your colours work for everyone.

### Why contrast matters

Roughly 1 in 12 men and 1 in 200 women have some form of colour vision deficiency. Low contrast between text and background makes content hard to read for everyone — especially in bright sunlight, on low-quality screens, or for people with reduced vision.

### WCAG contrast requirements

The Web Content Accessibility Guidelines (WCAG) define minimum contrast ratios. Normal text (under 18 pixels, or under 14 pixels bold) needs at least 4.5:1 contrast against its background to pass AA. Large text (18 pixels and above, or 14 pixels bold and above) needs at least 3:1. These are minimums — higher contrast is usually better.

### Checking contrast in practice

HueSet shows contrast ratios when you use Second Opinion (a Pro feature when available). You can also check manually: pick your text colour and background colour, calculate the contrast ratio using the formula in the WCAG specification, and compare to the 4.5:1 or 3:1 threshold. Free online tools exist for quick checks.

### Do not rely on colour alone

Error states should not just turn text red — add an icon, underline, or label. Links should be underlined or visually distinct beyond just colour. Status indicators (success, warning, error) should include text labels. This ensures people who cannot distinguish certain colours still understand the interface.

---

## 06 Design systems

Tokens, roles, and the thinking behind reusable, consistent design that scales beyond one page.

### What is a design system?

A design system is a set of reusable decisions: colours, typography, spacing, component styles, and the rules for using them. Instead of writing #0A6288 in your CSS, you write --color-primary. If the brand colour changes, you update one token and everything follows. HueSet roles work the same way — assign a colour to a role, and every element using that role stays consistent.

### Design tokens

Tokens are named values that represent design decisions. Instead of writing #0A6288 in your CSS, you write --color-primary. If the brand colour changes, you update one token and everything follows. HueSet exports colour values in token-friendly formats (CSS custom properties, JSON, Tailwind config) when export is available.

### Semantic vs primitive tokens

Primitive tokens are raw values: blue-500, grey-200. Semantic tokens describe purpose: text-primary, surface-card, border-input. Semantic tokens are more useful because they tell you what the colour is for, not just what it looks like. When you switch themes (light to dark), semantic tokens let you swap entire palettes without renaming anything.

### Starting small

You do not need a full design system on day one. Start with a consistent palette, a clear type scale, and a spacing system. Add component patterns as you build. HueSet is designed for this starting point — test your colour decisions on real layouts before committing to a full system.

---

## Try it yourself

The fastest way to learn is to experiment. Open Quick Design and start testing colours on real layouts.

- Open Quick Design → /quick-design
- Help & guide → /help

---

## Related site copy (for tone / cross-links)

### Landing hero

From palette to preview.

Choose colours, preview them on real website, app, and component layouts, then fine-tune until everything looks right. Export is coming soon.

### Landing — What We Offer card (Learn)

Title: Free Designing Lessons
Description: Learn how experienced designers make good decisions about colour, type, layout, accessibility and design systems.
Action: Start Learning
Link: /learn

### Help — Learn more section

Want to understand colour theory, typography, layout, and accessibility in more depth? Visit the Learn page for practical design lessons.

### About — one-liner

A visual design and colour testing tool — sitting between a simple palette generator and a professional design application.

### Examples — hero

Colour palettes designed for real interfaces. Browse them for inspiration, then open Quick Design to build your own.

---

## Copy rules (do not break)

- Do not claim export is live — say "coming soon" or "when checkout is available"
- Do not claim WCAG AA passes unless the rendered UI actually passes
- Do not invent support emails — use SUPPORT_EMAIL only
- Public text minimum 12px; interactive targets minimum 44px height
- White text on buttons: use #0A6288 (BRAND_INK) for AA contrast, not #13A8E7 on small buttons
- HueSet is local-first; no signup required for core editor
