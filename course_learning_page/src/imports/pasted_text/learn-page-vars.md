Create a HueSet `/learn` page content document. Output **variables only** in `KEY=VALUE` blocks grouped by section. No prose, no lesson body copy — just the variable map I can fill in or reuse.

Use these shipped values exactly. Do not invent features, prices, emails, or WCAG claims.

---

## PROMPT (copy from here)

Build a variables-only markdown file for the HueSet Learn page (`/learn`). Format: grouped `KEY=VALUE` blocks. Include every variable below. Leave lesson section bodies as empty placeholders (`SECTION_N_BODY=`) unless I provide copy later.

### Brand & colour

```
SITE_NAME=HueSet
SITE_ORIGIN=https://hueset.app
NPM_PACKAGE=pallet-preview

BRAND.brand=#20B9FA
BRAND.brandLight=#4BC6FB
BRAND.brandDark=#05A9F0
BRAND.cta=#13A8E7
BRAND.charcoal=#0E1821
BRAND.offwhite=#F8F8F6
BRAND.white=#FFFFFF
BRAND.softgrey=#E7E9ED
BRAND.medgrey=#7A818B
BRAND_CTA_ON_WHITE=#13A8E7
BRAND_TEXT_ON_WHITE=#0A6288
BRAND_INK=#0A6288
BRAND_SECONDARY=#0C6D96
CONTRAST_PRIMARY_FILL=#0B7BAA
CONTRAST_SECONDARY_FILL=#0C6D96
CONTRAST_GO_PRO=#0A6288
```

### Typography (CSS)

```
FONT_SANS=Inter
FONT_DISPLAY=Instrument Sans
FONT_MONO=JetBrains Mono
CSS_VAR_FONT_SANS=--font-sans
CSS_VAR_FONT_DISPLAY=--font-display
CSS_VAR_FONT_MONO=--font-mono
MIN_BODY_PX=16
MIN_PUBLIC_TEXT_PX=12
MIN_INTERACTIVE_HEIGHT_PX=44
```

### Routes

```
ROUTE_HOME=/
ROUTE_APP=/app
ROUTE_BUILDER=/builder
ROUTE_PREVIEW=/preview
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
ROUTE_404=/404
REDIRECT_PREVIEW_TO=/app
REDIRECT_BUILDER_TO=/app
REDIRECT_LIVE_CHANGES_TO=/quick-design
```

### Page meta

```
META_HOME_TITLE=HueSet — Preview your website or app style before you build
META_HOME_DESC=Preview your website or app style before you build. Make visual decisions faster before moving into Figma or development.
META_APP_TITLE=Design workspace — HueSet
META_GENERATE_TITLE=Generate Design — HueSet
META_QUICK_DESIGN_TITLE=Quick Design — HueSet
META_PRICING_TITLE=Pricing — HueSet
META_HELP_TITLE=Help & guide — HueSet
META_CONTACT_TITLE=Contact — HueSet
META_PRIVACY_TITLE=Privacy Policy — HueSet
META_TERMS_TITLE=Terms of Service — HueSet
META_LEARN_TITLE=Learn — HueSet
META_LEARN_DESC=Learn how experienced designers make good decisions about colour, type, layout, accessibility, and design systems.
META_EXAMPLES_TITLE=Examples — HueSet
META_EXAMPLES_DESC=Browse original HueSet examples for websites, apps, dashboards, pricing, authentication, and components.
META_ABOUT_TITLE=About — HueSet
META_ABOUT_DESC=About HueSet — a visual design and colour testing tool that sits between a palette generator and a professional design app.
LEGAL_LAST_UPDATED=1 September 2026
```

### Contact & support

```
SUPPORT_EMAIL=cavenlink.dev@gmail.com
MAILTO_BUG_SUBJECT=HueSet bug report
MAILTO_NOTIFY_PAYMENTS=HueSet — notify me when payments launch
MAILTO_NOTIFY_PRO=HueSet — notify me when Pro launches
MAILTO_NOTIFY_EXPORT=HueSet — notify me when export checkout launches
BRAND_UPLOAD_FORMATS=SVG, PNG, JPG/JPEG, WebP
BRAND_UPLOAD_MAX_MB=5
```

### Entitlement & pricing

```
PAYMENTS_ENABLED=false
VITE_PAYMENTS_ENABLED=false
EARLY_ACCESS=true
EXPORT_LIVE=false
PRO_LIVE=false

PRICING.FIRST_EXPORT_CENTS=99
PRICING.FIRST_EXPORT_LABEL=$0.99
PRICING.FIRST_EXPORT_CADENCE=one-time
PRICING.PRO_MONTHLY_CENTS=1499
PRICING.PRO_LABEL=$14.99
PRICING.PRO_CADENCE=monthly

PLAN.free.price=$0
PLAN.firstExport.price=$0.99 USD one-time
PLAN.pro.price=$14.99 USD/month

ENTITLEMENT.free.generateFirstDesign=true
ENTITLEMENT.free.paletteEditing=true
ENTITLEMENT.free.copyColorValues=true
ENTITLEMENT.free.templatePreviewsFirstDesign=true
ENTITLEMENT.free.brandAssets=true
ENTITLEMENT.free.fullScreen=true
ENTITLEMENT.free.quickDesign=true
ENTITLEMENT.firstExport.exportFirstDesign=true
ENTITLEMENT.pro.unlimitedGenerateQuickDesign=true
ENTITLEMENT.pro.unlimitedExports=true
ENTITLEMENT.pro.typographyExport=true
ENTITLEMENT.pro.secondOpinion=true
ENTITLEMENT.pro.premiumTemplates=true
ENTITLEMENT.pro.savedProjects=true

FEATURE.generateFirstDesign=Generate your first full design
FEATURE.paletteEditing=Unlimited palette editing and randomisation
FEATURE.copyColorValues=Copy HEX, RGB and HSL values
FEATURE.templatePreviewsFirstDesign=Unlimited template previews (first design)
FEATURE.brandAssets=Brand assets (logo and app icon upload)
FEATURE.fullScreen=Full screen preview
FEATURE.quickDesign=Quick Design access
FEATURE.exportFirstDesign=Export your first design (palette, swatches, project file)
FEATURE.exportCode=Export code formats (CSS, JSON, design tokens, Tailwind)
FEATURE.unlimitedGenerateQuickDesign=Unlimited Generate Design and Quick Design
FEATURE.unlimitedExports=Unlimited exports (CSS, JSON, design tokens, project files)
FEATURE.typographyExport=Typography export
FEATURE.secondOpinion=Second Opinion (accessibility and contrast analysis)
FEATURE.premiumTemplates=Premium and future templates
FEATURE.savedProjects=Saved projects and all editing tools
```

### Storage & workspace

```
STORAGE_TYPE=localStorage
STORAGE_KEY_PROJECT=hueframe:v1
STORAGE_KEY_ENTITLEMENT=pallet-preview:ent:v3
STORAGE_KEY_ENTITLEMENT_OLD=pallet-preview:ent:v2
DEFAULT_BRAND_NAME=HueSet
WORKSPACE_HISTORY_MAX=40
PREVIEW_FIT_MIN_ZOOM=0.2
PREVIEW_FIT_MAX_ZOOM=1.5
PREVIEW_FIT_INSET=32
CROSS_DEVICE_SYNC=false
SERVER_UPLOAD=false
SIGNUP_REQUIRED=false
```

### Colour roles (singleton — one swatch per role)

```
ROLE.PageBackground=Page Background
ROLE.AppBackground=App Background
ROLE.FormBackground=Form Background
ROLE.CardBackground=Card Background
ROLE.NavBackground=Nav Background
ROLE.SecondaryBackground=Secondary Background
ROLE.BrandPrimary=Brand Primary
ROLE.Primary=Primary
ROLE.HeadingText=Heading Text
ROLE.Heading=Heading
ROLE.BodyText=Body Text
ROLE.Body=Body
ROLE.Surface=Surface
ROLE.Border=Border
ROLE.InputBorder=Input Border
ROLE.CardBorder=Card Border
ROLE.Divider=Divider
ROLE.Outline=Outline
ROLE.Accent=Accent
```

### Quick Design roles

```
QUICK_ROLE.background=Background
QUICK_ROLE.surface=Surface
QUICK_ROLE.button=Button
QUICK_ROLE.text=Text
QUICK_ROLE.border=Border
QUICK_ROLE.accent=Accent
QUICK_PREVIEW.website=Basic Website
QUICK_PREVIEW.app=Basic App
QUICK_PREVIEW.components=Basic Components
```

### Semantic colour tokens

```
TOKEN.colour.background=background
TOKEN.colour.surface=surface
TOKEN.colour.surfaceElevated=surfaceElevated
TOKEN.colour.textPrimary=textPrimary
TOKEN.colour.textSecondary=textSecondary
TOKEN.colour.textMuted=textMuted
TOKEN.colour.brandPrimary=brandPrimary
TOKEN.colour.brandSecondary=brandSecondary
TOKEN.colour.accent=accent
TOKEN.colour.border=border
TOKEN.colour.focus=focus
TOKEN.colour.success=success
TOKEN.colour.warning=warning
TOKEN.colour.error=error
TOKEN.colour.info=info
```

### Design token primitives

```
TOKEN.space.1=4
TOKEN.space.2=8
TOKEN.space.3=12
TOKEN.space.4=16
TOKEN.space.6=24
TOKEN.radius.none=0
TOKEN.radius.sm=4
TOKEN.radius.md=8
TOKEN.radius.lg=12
TOKEN.radius.full=999
TOKEN.font.sm=12
TOKEN.font.md=15
TOKEN.font.lg=20
TOKEN.font.xl=30
TOKEN.weight.regular=400
TOKEN.weight.medium=500
TOKEN.weight.semibold=600
TOKEN.weight.bold=700
TOKEN.leading.tight=1.15
TOKEN.leading.normal=1.5
TOKEN.leading.relaxed=1.75
TOKEN.type.body=type.body
TOKEN.type.label=type.label
TOKEN.type.heading=type.heading
TOKEN.type.display=type.display
TOKEN.border.none=border.none
TOKEN.border.subtle=border.subtle
TOKEN.border.strong=border.strong
TOKEN.shadow.none=shadow.none
TOKEN.shadow.sm=shadow.sm
TOKEN.shadow.md=shadow.md
TOKEN.shadow.lg=shadow.lg
TOKEN.buttonPreset.solid=solid
TOKEN.buttonPreset.outline=outline
TOKEN.buttonPreset.soft=soft
TOKEN.buttonPreset.pill=pill
TOKEN.buttonPreset.minimal=minimal
```

### Template categories

```
TEMPLATE_CATEGORY.Website=Website
TEMPLATE_CATEGORY.Application=Application
TEMPLATE_CATEGORY.Components=Components
TEMPLATE_DEFAULT=builtin-website-landing-page-simple
```

### Navigation labels

```
NAV.Learn=Learn
NAV.Examples=Examples
NAV.OpenHueSet=Open HueSet
NAV.QuickDesign=Quick Design
NAV.Help=Help
NAV.Pricing=Pricing
NAV.Contact=Contact
NAV.About=About
NAV.Privacy=Privacy
NAV.Terms=Terms and Conditions
NAV.GenerateDesign=Generate a Design
NAV.GoPro=Go Pro+
CTA.GenerateDesign=Generate a Design
CTA.QuickDesign=Quick Design
CTA.OpenQuickDesign=Open Quick Design
CTA.StartLearning=Start Learning
CTA.ViewExamples=View Examples
CTA.HelpGuide=Help & guide
CTA.TryItYourself=Try it yourself
CTA.NotifyMe=Notify me
CTA.ReturnHome=Return Home
CTA.StartNewDesign=Start a New Design
CTA.CopyAddress=Copy address
CTA.Copied=Copied
```

### Learn page shell (structure only)

```
LEARN.H1=Learn
LEARN.SUBTITLE=
LEARN.INDEX_HEADING=Lessons
LEARN.CTA_HEADING=Try it yourself
LEARN.CTA_BODY=
LEARN.CTA_PRIMARY_LABEL=Open Quick Design
LEARN.CTA_PRIMARY_HREF=/quick-design
LEARN.CTA_SECONDARY_LABEL=Help & guide
LEARN.CTA_SECONDARY_HREF=/help
LEARN.CTA_BUTTON_FILL=#0A6288
LEARN.LESSON_COUNT=6
```

### Learn lessons (IDs + titles only — bodies empty)

```
LESSON_01.id=colour-basics
LESSON_01.number=01
LESSON_01.title=Colour basics
LESSON_01.summary=
LESSON_01.section_1_heading=Hue, saturation, lightness
LESSON_01.section_1_body=
LESSON_01.section_2_heading=Warm and cool
LESSON_01.section_2_body=
LESSON_01.section_3_heading=Colour relationships
LESSON_01.section_3_body=

LESSON_02.id=building-palettes
LESSON_02.number=02
LESSON_02.title=Building palettes
LESSON_02.summary=
LESSON_02.section_1_heading=Start with one colour
LESSON_02.section_1_body=
LESSON_02.section_2_heading=Assign roles, not just colours
LESSON_02.section_2_body=
LESSON_02.section_3_heading=Limit your palette
LESSON_02.section_3_body=
LESSON_02.section_4_heading=Use Randomise to explore
LESSON_02.section_4_body=

LESSON_03.id=typography
LESSON_03.number=03
LESSON_03.title=Typography in interfaces
LESSON_03.summary=
LESSON_03.section_1_heading=Size hierarchy
LESSON_03.section_1_body=
LESSON_03.section_2_heading=Weight and emphasis
LESSON_03.section_2_body=
LESSON_03.section_3_heading=Line height and spacing
LESSON_03.section_3_body=
LESSON_03.section_4_heading=Font pairing
LESSON_03.section_4_body=

LESSON_04.id=layout
LESSON_04.number=04
LESSON_04.title=Layout principles
LESSON_04.summary=
LESSON_04.section_1_heading=Consistent spacing
LESSON_04.section_1_body=
LESSON_04.section_2_heading=Alignment
LESSON_04.section_2_body=
LESSON_04.section_3_heading=Visual hierarchy
LESSON_04.section_3_body=
LESSON_04.section_4_heading=Responsive structure
LESSON_04.section_4_body=

LESSON_05.id=accessibility
LESSON_05.number=05
LESSON_05.title=Colour and accessibility
LESSON_05.summary=
LESSON_05.section_1_heading=Why contrast matters
LESSON_05.section_1_body=
LESSON_05.section_2_heading=WCAG contrast requirements
LESSON_05.section_2_body=
LESSON_05.section_3_heading=Checking contrast in practice
LESSON_05.section_3_body=
LESSON_05.section_4_heading=Do not rely on colour alone
LESSON_05.section_4_body=

LESSON_06.id=design-systems
LESSON_06.number=06
LESSON_06.title=Design systems
LESSON_06.summary=
LESSON_06.section_1_heading=What is a design system?
LESSON_06.section_1_body=
LESSON_06.section_2_heading=Design tokens
LESSON_06.section_2_body=
LESSON_06.section_3_heading=Semantic vs primitive tokens
LESSON_06.section_3_body=
LESSON_06.section_4_heading=Starting small
LESSON_06.section_4_body=
```

### Examples gallery (IDs only)

```
EXAMPLE.ocean-saas.category=website
EXAMPLE.warm-editorial.category=website
EXAMPLE.mint-ecommerce.category=website
EXAMPLE.dark-dashboard.category=app
EXAMPLE.coral-wellness.category=app
EXAMPLE.indigo-productivity.category=app
EXAMPLE.slate-components.category=component
EXAMPLE.sunset-gradient.category=component
EXAMPLE.forest-components.category=component
EXAMPLE_COLOUR_ROLE.Background=Background
EXAMPLE_COLOUR_ROLE.Surface=Surface
EXAMPLE_COLOUR_ROLE.Primary=Primary
EXAMPLE_COLOUR_ROLE.Heading=Heading
EXAMPLE_COLOUR_ROLE.Body=Body
EXAMPLE_COLOUR_ROLE.Border=Border
```

### Copy constraints

```
RULE.export=Say "coming soon" or "when checkout is available" — never claim export is live
RULE.wcag=Do not claim WCAG AA unless rendered UI passes
RULE.email=Use SUPPORT_EMAIL only — no invented addresses
RULE.localFirst=No signup, no server upload for core editor
RULE.minTextPx=12
RULE.minTargetPx=44
RULE.whiteTextButtonFill=Use BRAND_INK (#0A6288) not BRAND.cta on small white-text buttons
RULE.preserveManualColourNames=true
RULE.templateApplyExplicit=true
```

Output the file as grouped `KEY=VALUE` blocks only. No JSX. No lesson prose unless I paste copy into empty placeholders.
