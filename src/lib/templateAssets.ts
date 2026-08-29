export type TemplateArea = "Template"
export type TemplateCategory = "Website" | "Application" | "Components"
export type TemplateGroupKey = "website" | "application" | "components"
export type TemplateCollection = "Built-In" | "Imported"
export type TemplateLayout = "desktop" | "phone" | "component"

export type TemplateAsset = {
  id: string
  name: string
  area: TemplateArea
  category: TemplateCategory
  type: string
  variant: string
  thumbnail: string
  tags: string[]
  collection: TemplateCollection
  layout: TemplateLayout
  source: string | null
  renderer: "built-in" | "svg"
}

type TypeDefinition = { type: string; variants: [string, string] }

const BUILT_IN_DEFINITIONS: Record<TemplateCategory, TypeDefinition[]> = {
  Website: [
    { type: "SaaS", variants: ["Minimal", "Premium"] },
    { type: "Ecommerce", variants: ["Minimal", "Premium"] },
    { type: "Error Page", variants: ["404", "Playful"] },
    { type: "Blog", variants: ["Minimal", "Editorial"] },
    { type: "Landing Page", variants: ["Simple", "Bold"] },
    { type: "Portfolio", variants: ["Minimal", "Editorial"] },
    { type: "Pricing", variants: ["Simple", "Comparison"] },
    { type: "Dashboard", variants: ["Minimal", "Data Focused"] },
    { type: "Authentication", variants: ["Sign In", "Split"] },
    { type: "Help Center", variants: ["Simple", "Structured"] },
  ],
  Application: [
    { type: "Dashboard", variants: ["Minimal", "Data Focused"] },
    { type: "Finance", variants: ["Minimal", "Data Focused"] },
    { type: "iOS App", variants: ["Home", "Profile"] },
    { type: "Task Manager", variants: ["List", "Kanban"] },
    { type: "Social", variants: ["Feed", "Profile"] },
    { type: "Messaging", variants: ["Chat", "Conversation"] },
    { type: "Fitness", variants: ["Activity", "Progress"] },
    { type: "Food Delivery", variants: ["Browse", "Restaurant"] },
    { type: "Onboarding", variants: ["Minimal", "Illustrated"] },
    { type: "Settings", variants: ["Minimal", "Grouped"] },
  ],
  Components: [
    { type: "Buttons", variants: ["Glass", "Solid"] },
    { type: "Cards", variants: ["Bento", "Minimal"] },
    { type: "Navigation", variants: ["Floating", "Sidebar"] },
    { type: "Forms", variants: ["Simple", "Multi Step"] },
    { type: "Alerts", variants: ["Inline", "Toast"] },
    { type: "Modals", variants: ["Simple", "Confirmation"] },
    { type: "Tables", variants: ["Compact", "Data Heavy"] },
    { type: "Tabs", variants: ["Underline", "Pill"] },
    { type: "Inputs", variants: ["Outlined", "Filled"] },
    { type: "Badges", variants: ["Soft", "Solid"] },
    { type: "Avatars", variants: ["Stack", "Profile"] },
    { type: "Charts", variants: ["Bar", "Line"] },
    { type: "Empty States", variants: ["Simple", "Action"] },
    { type: "Pagination", variants: ["Simple", "Compact"] },
    { type: "Tooltips", variants: ["Simple", "Rich"] },
  ],
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

function templateName(type: string, variant: string) {
  if (type === "Error Page" && variant === "404") return "404 Error Page"
  return `${variant} ${type}`
}

function categoryLayout(category: TemplateCategory): TemplateLayout {
  if (category === "Application") return "phone"
  if (category === "Components") return "component"
  return "desktop"
}

const builtInAssets: TemplateAsset[] = (Object.entries(BUILT_IN_DEFINITIONS) as [TemplateCategory, TypeDefinition[]][]).flatMap(([category, definitions]) =>
  definitions.flatMap(({ type, variants }) => variants.map((variant) => {
    const id = `builtin-${slug(category)}-${slug(type)}-${slug(variant)}`
    return {
      id,
      name: templateName(type, variant),
      area: "Template" as const,
      category,
      type,
      variant,
      thumbnail: `builtin://${slug(category)}/${slug(type)}/${slug(variant)}`,
      tags: [category, type, variant, category === "Application" ? "phone" : category === "Components" ? "component" : "website"].map((tag) => tag.toLowerCase()),
      collection: "Built-In" as const,
      layout: categoryLayout(category),
      source: null,
      renderer: "built-in" as const,
    }
  })),
)

const IMPORTED_DEFINITIONS: [string, TemplateCategory, string, string][] = [
  ["website-404-simple", "Website", "404", "Simple"],
  ["website-404-playful", "Website", "404", "Playful"],
  ["website-about-simple", "Website", "About", "Simple"],
  ["website-about-editorial", "Website", "About", "Editorial"],
  ["website-ai-product-futuristic", "Website", "AI Product", "Futuristic"],
  ["website-blog-simple", "Website", "Blog", "Simple"],
  ["website-blog-magazine", "Website", "Blog", "Magazine"],
  ["website-business-service-focused", "Website", "Business", "Service Focused"],
  ["website-contact-simple", "Website", "Contact", "Simple"],
  ["website-dashboard-simple", "Website", "Dashboard", "Simple"],
  ["website-education-course-focused", "Website", "Education", "Course Focused"],
  ["website-help-center-simple", "Website", "Help Center", "Simple"],
  ["website-landing-page-simple", "Website", "Landing Page", "Simple"],
  ["website-login-simple", "Website", "Login", "Simple"],
  ["website-multi-page-premium", "Website", "Multi Page Website", "Premium"],
  ["website-pricing-simple", "Website", "Pricing", "Simple"],
  ["website-sign-in-split", "Website", "Sign In", "Split"],
  ["website-sign-up-simple", "Website", "Sign Up", "Simple"],
  ["website-analytics-data-heavy", "Website", "Analytics", "Data Heavy"],
  ["website-finance-minimal", "Website", "Finance", "Minimal"],
  ["application-authentication-sign-in", "Application", "Authentication", "Sign In"],
  ["application-authentication-sign-up", "Application", "Authentication", "Sign Up"],
  ["application-banking-dashboard", "Application", "Banking", "Dashboard"],
  ["application-fitness-activity-dashboard", "Application", "Fitness", "Activity Dashboard"],
  ["application-food-delivery-restaurant-detail", "Application", "Food Delivery", "Restaurant Detail"],
  ["application-messaging-chat", "Application", "Messaging", "Chat"],
  ["application-messaging-conversation-focused", "Application", "Messaging", "Conversation Focused"],
  ["application-notes-minimal", "Application", "Notes", "Minimal"],
  ["application-notifications-minimal", "Application", "Notifications", "Minimal"],
  ["application-onboarding-minimal", "Application", "Onboarding", "Minimal"],
  ["application-photo-gallery-grid", "Application", "Photo Gallery", "Grid"],
  ["application-search-results", "Application", "Search", "Results"],
  ["application-settings-minimal", "Application", "Settings", "Minimal"],
  ["application-social-community-feed", "Application", "Social", "Community Feed"],
  ["application-social-profile", "Application", "Social", "Profile"],
]

const importedAssets: TemplateAsset[] = IMPORTED_DEFINITIONS.map(([id, category, type, variant]) => ({
  id,
  name: templateName(type, variant),
  area: "Template",
  category,
  type,
  variant,
  source: `/template-assets/sources/${id}.svg`,
  thumbnail: `/template-assets/previews/${id}@2x.png`,
  tags: [category, type, variant, "imported"].map((tag) => tag.toLowerCase()),
  collection: "Imported",
  layout: categoryLayout(category),
  renderer: "svg",
}))

export const templateAssets: TemplateAsset[] = [...builtInAssets, ...importedAssets]
export const templateCategories: TemplateCategory[] = ["Website", "Application", "Components"]

export const templateStats = {
  builtInTemplates: builtInAssets.length,
  importedTemplates: importedAssets.length,
  uniqueTemplates: templateAssets.length,
  websiteTemplates: builtInAssets.filter((asset) => asset.category === "Website").length,
  applicationTemplates: builtInAssets.filter((asset) => asset.category === "Application").length,
  componentTemplates: builtInAssets.filter((asset) => asset.category === "Components").length,
} as const

export type TemplateVariantNode = {
  key: string
  label: string
  layout: TemplateLayout
  thumbnail: string
  source: string | null
}

export type TemplateTypeNode = {
  key: string
  label: string
  templates: TemplateVariantNode[]
}

export type TemplateCategoryNode = {
  key: TemplateGroupKey
  label: TemplateCategory
  subs: TemplateTypeNode[]
}

export const templateGroups: TemplateCategoryNode[] = templateCategories.map((category) => {
  const categoryAssets = templateAssets.filter((asset) => asset.category === category)
  const types = Array.from(new Set(categoryAssets.map((asset) => asset.type)))

  return {
    key: category.toLowerCase() as TemplateGroupKey,
    label: category,
    subs: types.map((type) => ({
      key: slug(type),
      label: type,
      templates: categoryAssets
        .filter((asset) => asset.type === type)
        .map((asset) => ({
          key: asset.id,
          label: asset.variant,
          layout: asset.layout,
          thumbnail: asset.thumbnail,
          source: asset.source,
        })),
    })),
  }
})

export const templateAssetById = new Map(templateAssets.map((asset) => [asset.id, asset]))
export const defaultTemplate = templateAssetById.get("builtin-website-landing-page-simple") ?? builtInAssets[0]
