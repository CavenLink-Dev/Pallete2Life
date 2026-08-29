export type TemplateArea = "Template"
export type TemplateCategory = "Website" | "Application"
export type TemplateGroupKey = "website" | "application"

export type TemplateAsset = {
  id: string
  name: string
  area: TemplateArea
  category: TemplateCategory
  type: string
  variant: string
  source: string
  thumbnail: string
}

const makeTemplate = (
  id: string,
  category: TemplateCategory,
  type: string,
  variant: string,
): TemplateAsset => ({
  id,
  name: `${type} · ${variant}`,
  area: "Template",
  category,
  type,
  variant,
  source: `/template-assets/sources/${id}.svg`,
  thumbnail: `/template-assets/previews/${id}@2x.png`,
})

export const templateAssets: TemplateAsset[] = [
  makeTemplate("website-404-simple", "Website", "404", "Simple"),
  makeTemplate("website-404-playful", "Website", "404", "Playful"),
  makeTemplate("website-about-simple", "Website", "About", "Simple"),
  makeTemplate("website-about-editorial", "Website", "About", "Editorial"),
  makeTemplate("website-ai-product-futuristic", "Website", "AI Product", "Futuristic"),
  makeTemplate("website-blog-simple", "Website", "Blog", "Simple"),
  makeTemplate("website-blog-magazine", "Website", "Blog", "Magazine"),
  makeTemplate("website-business-service-focused", "Website", "Business", "Service Focused"),
  makeTemplate("website-contact-simple", "Website", "Contact", "Simple"),
  makeTemplate("website-dashboard-simple", "Website", "Dashboard", "Simple"),
  makeTemplate("website-education-course-focused", "Website", "Education", "Course Focused"),
  makeTemplate("website-help-center-simple", "Website", "Help Center", "Simple"),
  makeTemplate("website-landing-page-simple", "Website", "Landing Page", "Simple"),
  makeTemplate("website-login-simple", "Website", "Login", "Simple"),
  makeTemplate("website-multi-page-premium", "Website", "Multi Page Website", "Premium"),
  makeTemplate("website-pricing-simple", "Website", "Pricing", "Simple"),
  makeTemplate("website-sign-in-split", "Website", "Sign In", "Split"),
  makeTemplate("website-sign-up-simple", "Website", "Sign Up", "Simple"),
  makeTemplate("website-analytics-data-heavy", "Website", "Analytics", "Data Heavy"),
  makeTemplate("website-finance-minimal", "Website", "Finance", "Minimal"),

  makeTemplate("application-authentication-sign-in", "Application", "Authentication", "Sign In"),
  makeTemplate("application-authentication-sign-up", "Application", "Authentication", "Sign Up"),
  makeTemplate("application-banking-dashboard", "Application", "Banking", "Dashboard"),
  makeTemplate("application-fitness-activity-dashboard", "Application", "Fitness", "Activity Dashboard"),
  makeTemplate("application-food-delivery-restaurant-detail", "Application", "Food Delivery", "Restaurant Detail"),
  makeTemplate("application-messaging-chat", "Application", "Messaging", "Chat"),
  makeTemplate("application-messaging-conversation-focused", "Application", "Messaging", "Conversation Focused"),
  makeTemplate("application-notes-minimal", "Application", "Notes", "Minimal"),
  makeTemplate("application-notifications-minimal", "Application", "Notifications", "Minimal"),
  makeTemplate("application-onboarding-minimal", "Application", "Onboarding", "Minimal"),
  makeTemplate("application-photo-gallery-grid", "Application", "Photo Gallery", "Grid"),
  makeTemplate("application-search-results", "Application", "Search", "Results"),
  makeTemplate("application-settings-minimal", "Application", "Settings", "Minimal"),
  makeTemplate("application-social-community-feed", "Application", "Social", "Community Feed"),
  makeTemplate("application-social-profile", "Application", "Social", "Profile"),
]

export const templateCategories: TemplateCategory[] = ["Website", "Application"]

export const templateStats = {
  totalFiles: templateAssets.length * 2,
  uniqueTemplates: templateAssets.length,
  websiteTemplates: templateAssets.filter((asset) => asset.category === "Website").length,
  applicationTemplates: templateAssets.filter((asset) => asset.category === "Application").length,
  components: 0,
  otherAssets: 0,
} as const

export type TemplateVariantNode = {
  key: string
  label: string
  layout: "desktop" | "phone"
  thumbnail: string
  source: string
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

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

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
          layout: category === "Application" ? "phone" : "desktop",
          thumbnail: asset.thumbnail,
          source: asset.source,
        })),
    })),
  }
})

export const templateAssetById = new Map(templateAssets.map((asset) => [asset.id, asset]))
export const defaultTemplate = templateAssetById.get("website-landing-page-simple") ?? templateAssets[0]
