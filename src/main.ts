import { once, showUI, emit } from '@create-figma-plugin/utilities'
import { 
  ExpandBriefHandler, 
  UltimateProductBrief, 
  SetAPIKeyHandler, 
  GetAPIKeyHandler, 
  APIKeyResponseHandler, 
  UserPersona, 
  UserJourneyStep,
  Competitor,
  TechnicalRequirement,
  UserFlow,
  DesignToken,
  MarketInsight,
  ComponentSpec
} from './types'

const _COLORS = {
  // Primary palette
  systemBlue: { r: 0.0, g: 0.478, b: 1.0 },
  systemIndigo: { r: 0.345, g: 0.337, b: 0.839 },
  systemPurple: { r: 0.686, g: 0.322, b: 0.871 },
  systemTeal: { r: 0.188, g: 0.690, b: 0.780 },
  systemGreen: { r: 0.196, g: 0.843, b: 0.294 },
  systemYellow: { r: 1.0, g: 0.800, b: 0.0 },
  systemOrange: { r: 1.0, g: 0.584, b: 0.0 },
  systemRed: { r: 1.0, g: 0.231, b: 0.188 },
  systemPink: { r: 1.0, g: 0.176, b: 0.333 },
  
  // Colors for UI elements
  reservedBlue: { r: 0.4, g: 0.6, b: 0.8 },
  reservedGreen: { r: 0.5, g: 0.7, b: 0.5 },
  reservedOrange: { r: 0.8, g: 0.6, b: 0.4 },
  reservedRed: { r: 0.8, g: 0.5, b: 0.5 },
  reservedPurple: { r: 0.6, g: 0.5, b: 0.7 },
  reservedTeal: { r: 0.5, g: 0.6, b: 0.6 },
  
  // Neutral palette
  systemGray: { r: 0.557, g: 0.557, b: 0.576 },
  systemGray2: { r: 0.682, g: 0.682, b: 0.698 },
  systemGray3: { r: 0.780, g: 0.780, b: 0.800 },
  systemGray4: { r: 0.820, g: 0.820, b: 0.839 },
  systemGray5: { r: 0.898, g: 0.898, b: 0.918 },
  systemGray6: { r: 0.949, g: 0.949, b: 0.969 },
  
  // Background colors
  systemBackground: { r: 1.0, g: 1.0, b: 1.0 },
  secondarySystemBackground: { r: 0.949, g: 0.949, b: 0.969 },
  tertiarySystemBackground: { r: 1.0, g: 1.0, b: 1.0 },
  
  // Label colors
  label: { r: 0.0, g: 0.0, b: 0.0 },
  secondaryLabel: { r: 0.235, g: 0.235, b: 0.263 },
  tertiaryLabel: { r: 0.302, g: 0.302, b: 0.302 },
  quaternaryLabel: { r: 0.462, g: 0.462, b: 0.502 }
}

// Spacing system
const _SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } {
  if (!hex || typeof hex !== 'string') {
    return _COLORS.systemBlue
  }
  
  const cleanHex = hex.replace('#', '')
  if (cleanHex.length !== 6) {
    return _COLORS.systemBlue
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex)
  if (!result) {
    return _COLORS.systemBlue
  }
  
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  }
}

// Generate color palette
function generateColorPalette(designTokens: DesignToken[]): { 
  light: Record<string, string>, 
  dark: Record<string, string>, 
  combinations: Array<{name: string, colors: string[], emotion: string, description: string}> 
} {
  const lightPalette: Record<string, string> = {}
  const darkPalette: Record<string, string> = {}
  
  // Extract all color tokens from AI response
  const colorTokens = designTokens.filter(t => t.category === 'color')
  
  colorTokens.forEach(token => {
    if (typeof token.value === 'string' && token.value.startsWith('#')) {
      lightPalette[token.name] = token.value
      darkPalette[token.name] = adjustColorForDarkTheme(token.value)
    }
  })

  // Fallback palette if AI doesn't provide enough colors
  if (Object.keys(lightPalette).length < 10) {
    const Light = {
      'primary-50': '#f0f9ff', 'primary-100': '#e0f2fe', 'primary-500': '#007AFF', 'primary-600': '#0056b3', 'primary-900': '#003d82',
      'secondary-500': '#5856d6', 'accent-500': '#ff9500',
      'gray-50': '#f2f2f7', 'gray-100': '#e5e5ea', 'gray-500': '#8e8e93', 'gray-900': '#1c1c1e',
      'success': '#32d74b', 'warning': '#ff9500', 'error': '#ff453a', 'info': '#007aff',
      'surface': '#ffffff', 'background': '#f2f2f7'
    }
    Object.assign(lightPalette, Light)

    const Dark = {
      'primary-50': '#003d82', 'primary-100': '#0056b3', 'primary-500': '#0a84ff', 'primary-600': '#007aff', 'primary-900': '#e0f2fe',
      'secondary-500': '#5e5ce6', 'accent-500': '#ff9f0a',
      'gray-50': '#1c1c1e', 'gray-100': '#2c2c2e', 'gray-500': '#8e8e93', 'gray-900': '#f2f2f7',
      'success': '#30d158', 'warning': '#ff9f0a', 'error': '#ff6961', 'info': '#0a84ff',
      'surface': '#1c1c1e', 'background': '#000000'
    }
    Object.assign(darkPalette, Dark)
  }

  // Color combinations for brand identity 
  const combinations = [
    { 
      name: 'Primary & Surface', 
      colors: [lightPalette['primary-500'] || '#007AFF', lightPalette['surface'] || '#ffffff'], 
      emotion: 'Confidence',
      description: 'Primary brand color with clean surface creates trustworthy, professional interactions'
    },
    { 
      name: 'Primary & Accent', 
      colors: [lightPalette['primary-500'] || '#007AFF', lightPalette['accent-500'] || '#ff9500'], 
      emotion: 'Energy',
      description: 'Primary paired with accent color conveys dynamic, engaging experiences'
    },
    { 
      name: 'Secondary & Background', 
      colors: [lightPalette['secondary-500'] || '#5856d6', lightPalette['background'] || '#f2f2f7'], 
      emotion: 'Harmony',
      description: 'Secondary brand color with background promotes balanced, focused experiences'
    },
    { 
      name: 'Success & Primary', 
      colors: [lightPalette['success'] || '#32d74b', lightPalette['primary-500'] || '#007AFF'], 
      emotion: 'Achievement',
      description: 'Success indicators with primary brand color inspire confidence in positive outcomes'
    }
  ]

  return { light: lightPalette, dark: darkPalette, combinations }
}

// Shadow system
function createShadow(level: 'subtle' | 'medium' | 'prominent' = 'medium') {
  const shadows = {
    subtle: {
      color: { r: 0, g: 0, b: 0, a: 0.04 },
      offset: { x: 0, y: 1 },
      radius: 3,
      spread: 0
    },
    medium: {
      color: { r: 0, g: 0, b: 0, a: 0.08 },
      offset: { x: 0, y: 4 },
      radius: 12,
      spread: 0
    },
    prominent: {
      color: { r: 0, g: 0, b: 0, a: 0.12 },
      offset: { x: 0, y: 8 },
      radius: 24,
      spread: 0
    }
  }
  
  return {
    type: 'DROP_SHADOW' as const,
    ...shadows[level],
    visible: true,
    blendMode: 'NORMAL' as const
  }
}

// Helper functions for color manipulation
function darkenColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex)
  return rgbToHex(
    Math.round(rgb.r * 255 * (1 - factor)),
    Math.round(rgb.g * 255 * (1 - factor)),
    Math.round(rgb.b * 255 * (1 - factor))
  )
}

function lightenColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex)
  return rgbToHex(
    Math.round(rgb.r * 255 + (255 - rgb.r * 255) * factor),
    Math.round(rgb.g * 255 + (255 - rgb.g * 255) * factor),
    Math.round(rgb.b * 255 + (255 - rgb.b * 255) * factor)
  )
}

function adjustColorForDarkTheme(hex: string): string {
  const rgb = hexToRgb(hex)
  const brightness = (rgb.r + rgb.g + rgb.b) / 3
  
  if (brightness > 0.5) {
    return darkenColor(hex, 0.4)
  } else {
    return lightenColor(hex, 0.3)
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Typography scale
function generateTypographyScale(designTokens: DesignToken[]): Record<string, number> {
  const scale: Record<string, number> = {}

  // Extract typography tokens from AI response
  const typographyTokens = designTokens.filter(t => t.category === 'typography')
  typographyTokens.forEach(token => {
    if (typeof token.value === 'number') {
      scale[token.name] = token.value
    }
  })

  // Typography scale fallback
  if (Object.keys(scale).length === 0) {
    scale['largeTitle'] = 34
    scale['title1'] = 28
    scale['title2'] = 22
    scale['title3'] = 20
    scale['headline'] = 17
    scale['body'] = 17
    scale['callout'] = 16
    scale['subhead'] = 15
    scale['footnote'] = 13
    scale['caption1'] = 12
    scale['caption2'] = 11
  }

  return scale
}

// Helper function to safely get array
function safeArray(arr: any): any[] {
  return Array.isArray(arr) ? arr : []
}

// Helper function to safely get string
function safeString(str: any): string {
  return typeof str === 'string' ? str : ''
}

// Text creation with SF Pro font system
async function createStyledText(
  content: string,
  fontSize: number = 17,
  fontWeight: 'Regular' | 'Medium' | 'Semibold' | 'Bold' = 'Regular',
  color: { r: number, g: number, b: number } = _COLORS.label
): Promise<TextNode> {
  try {
    const text = figma.createText()
    
    // Load SF Pro or fallback to Inter
    try {
      await figma.loadFontAsync({ family: "SF Pro Display", style: fontWeight })
      text.fontName = { family: "SF Pro Display", style: fontWeight }
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: fontWeight })
      text.fontName = { family: "Inter", style: fontWeight }
    }
    
    text.fontSize = fontSize
    text.characters = content || 'Text not available'
    text.fills = [{ type: 'SOLID', color }]
    text.lineHeight = { unit: 'PERCENT', value: 120 }
    text.letterSpacing = { unit: 'PERCENT', value: -1 }
    return text
  } catch (error) {
    const text = figma.createText()
    text.characters = content || 'Text not available'
    text.fontSize = fontSize
    return text
  }
}

// Create color system
async function createColorSystem(paletteData: { light: Record<string, string>, dark: Record<string, string>, combinations: Array<{name: string, colors: string[], emotion: string, description: string}> }, x: number, y: number): Promise<FrameNode> {
  const colorSystem = figma.createFrame()
  colorSystem.name = "Color System & Themes"
  colorSystem.resize(1600, 580)
  colorSystem.x = x
  colorSystem.y = y
  colorSystem.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  colorSystem.cornerRadius = 16
  colorSystem.effects = [createShadow('medium')]

  const title = await createStyledText("Color System", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  colorSystem.appendChild(title)

  let currentY = 80

  // Light Theme Section
  const lightThemeTitle = await createStyledText("Light Appearance", 20, 'Semibold', _COLORS.secondaryLabel)
  lightThemeTitle.x = _SPACING.lg
  lightThemeTitle.y = currentY
  colorSystem.appendChild(lightThemeTitle)
  currentY += 35

  await createThemeSwatches(paletteData.light, colorSystem, _SPACING.lg, currentY, 750)

  // Dark Theme Section
  const darkThemeTitle = await createStyledText("Dark Appearance", 20, 'Semibold', _COLORS.secondaryLabel)
  darkThemeTitle.x = 820
  darkThemeTitle.y = currentY
  colorSystem.appendChild(darkThemeTitle)

  await createThemeSwatches(paletteData.dark, colorSystem, 820, currentY + 35, 750)
  currentY += 140

  // Color Combinations Section
  const combinationsTitle = await createStyledText("Brand Color Palettes", 20, 'Semibold', _COLORS.secondaryLabel)
  combinationsTitle.x = _SPACING.lg
  combinationsTitle.y = currentY
  colorSystem.appendChild(combinationsTitle)
  currentY += 40

  // Color combination cards
  for (let i = 0; i < Math.min(paletteData.combinations.length, 4); i++) {
    const combo = paletteData.combinations[i]
    const comboX = _SPACING.lg + (i * 390)

    const comboCard = figma.createRectangle()
    comboCard.resize(370, 120)
    comboCard.x = comboX
    comboCard.y = currentY
    comboCard.fills = [{ type: 'SOLID', color: _COLORS.secondarySystemBackground }]
    comboCard.cornerRadius = 12
    comboCard.effects = [createShadow('subtle')]
    colorSystem.appendChild(comboCard)

    const comboName = await createStyledText(combo.name, 17, 'Semibold', _COLORS.label)
    comboName.x = comboX + _SPACING.md
    comboName.y = currentY + _SPACING.md
    colorSystem.appendChild(comboName)

    // Color swatches
    for (let j = 0; j < Math.min(combo.colors.length, 2); j++) {
      const colorSwatch = figma.createRectangle()
      colorSwatch.resize(36, 36)
      colorSwatch.x = comboX + _SPACING.md + (j * 48)
      colorSwatch.y = currentY + 40
      colorSwatch.fills = [{ type: 'SOLID', color: hexToRgb(combo.colors[j]) }]
      colorSwatch.cornerRadius = 8
      colorSwatch.effects = [createShadow('subtle')]
      colorSystem.appendChild(colorSwatch)

      const hexLabel = await createStyledText(combo.colors[j].toUpperCase(), 11, 'Medium', _COLORS.tertiaryLabel)
      hexLabel.x = comboX + _SPACING.md + (j * 48)
      hexLabel.y = currentY + 82
      colorSystem.appendChild(hexLabel)
    }

    const description = await createStyledText(combo.description, 13, 'Regular', _COLORS.secondaryLabel)
    description.x = comboX + 120
    description.y = currentY + 45
    description.resize(240, description.height)
    colorSystem.appendChild(description)
  }

  currentY += 140
  colorSystem.resize(1600, currentY + _SPACING.lg)
  return colorSystem
}

// Theme swatches
async function createThemeSwatches(palette: Record<string, string>, parent: FrameNode, startX: number, startY: number, maxWidth: number): Promise<void> {
  const colorGroups = [
    { name: 'Primary', colors: Object.entries(palette).filter(([name]) => name.toLowerCase().includes('primary')) },
    { name: 'Secondary', colors: Object.entries(palette).filter(([name]) => name.toLowerCase().includes('secondary')) },
    { name: 'Grays', colors: Object.entries(palette).filter(([name]) => name.toLowerCase().includes('gray') || name.toLowerCase().includes('neutral')) },
    { name: 'System', colors: Object.entries(palette).filter(([name]) => 
      ['success', 'warning', 'error', 'info'].some(semantic => name.toLowerCase().includes(semantic.toLowerCase()))
    ) },
    { name: 'Surfaces', colors: Object.entries(palette).filter(([name]) => 
      ['surface', 'background', 'accent'].some(type => name.toLowerCase().includes(type.toLowerCase()))
    ) }
  ].filter(group => group.colors.length > 0)

  let currentX = startX
  let currentY = startY

  for (const group of colorGroups) {
    if (currentX > startX + maxWidth - 150) {
      currentX = startX
      currentY += 75
    }

    const groupLabel = await createStyledText(group.name, 15, 'Semibold', _COLORS.secondaryLabel)
    groupLabel.x = currentX
    groupLabel.y = currentY
    parent.appendChild(groupLabel)

    let swatchX = currentX
    for (let i = 0; i < Math.min(group.colors.length, 5); i++) {
      const [name, hex] = group.colors[i]
      
      const swatch = figma.createRectangle()
      swatch.resize(28, 28)
      swatch.x = swatchX
      swatch.y = currentY + 20
      swatch.fills = [{ type: 'SOLID', color: hexToRgb(hex) }]
      swatch.cornerRadius = 6
      swatch.effects = [createShadow('subtle')]
      parent.appendChild(swatch)

      const swatchLabel = await createStyledText(name.split('-').pop() || name.slice(0, 2), 9, 'Medium', _COLORS.quaternaryLabel)
      swatchLabel.x = swatchX
      swatchLabel.y = currentY + 52
      parent.appendChild(swatchLabel)

      swatchX += 36
    }

    currentX += Math.min(group.colors.length, 5) * 36 + 40
  }
}

// Typography system
async function createTypographySystem(scale: Record<string, number>, x: number, y: number): Promise<FrameNode> {
  const typographySystem = figma.createFrame()
  typographySystem.name = "Typography System"
  typographySystem.resize(860, 580)
  typographySystem.x = x
  typographySystem.y = y
  typographySystem.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  typographySystem.cornerRadius = 16
  typographySystem.effects = [createShadow('medium')]

  const title = await createStyledText("Typography", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  typographySystem.appendChild(title)

  let currentY = 80

  // Sort typography by size (largest first)
  const sortedTypography = Object.entries(scale).sort(([, a], [, b]) => b - a)

  for (const [name, size] of sortedTypography.slice(0, 8)) {
    if (currentY > 520) break

    const label = await createStyledText(`${name} · ${size}px`, 13, 'Medium', _COLORS.tertiaryLabel)
    label.x = _SPACING.lg
    label.y = currentY
    typographySystem.appendChild(label)

    const weight = size > 24 ? 'Bold' : size > 18 ? 'Semibold' : 'Regular'
    const sampleText = size > 36 ? 'Typography' : size > 20 ? 'Sample Text' : 'The quick brown fox jumps over the lazy dog'
    
    const sample = await createStyledText(sampleText, Math.min(size, 36), weight as any, _COLORS.label)
    sample.x = _SPACING.lg
    sample.y = currentY + 18
    sample.resize(820, sample.height)
    typographySystem.appendChild(sample)

    currentY += Math.max(sample.height + 32, 60)
  }

  typographySystem.resize(860, Math.max(580, currentY + _SPACING.lg))
  return typographySystem
}

// Market intelligence section
async function createMarketIntelligence(insights: MarketInsight[], competitive: Competitor[], x: number, y: number): Promise<FrameNode> {
  const safeInsights = safeArray(insights)
  const safeCompetitors = safeArray(competitive)
  
  const maxItems = Math.max(safeInsights.length, safeCompetitors.length)
  const baseHeight = 480
  const dynamicHeight = Math.max(baseHeight, 200 + (maxItems * 130))
  
  const marketFrame = figma.createFrame()
  marketFrame.name = "Market Intelligence"
  marketFrame.resize(2450, dynamicHeight)
  marketFrame.x = x
  marketFrame.y = y
  marketFrame.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  marketFrame.cornerRadius = 16
  marketFrame.effects = [createShadow('medium')]

  const title = await createStyledText("Market Intelligence", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  marketFrame.appendChild(title)

  let currentY = 80

  // Market Insights - LEFT SIDE
  if (safeInsights.length > 0) {
    const insightsTitle = await createStyledText(`Market Insights · ${safeInsights.length} insights`, 20, 'Semibold', _COLORS.secondaryLabel)
    insightsTitle.x = _SPACING.lg
    insightsTitle.y = currentY
    marketFrame.appendChild(insightsTitle)

    for (let i = 0; i < safeInsights.length; i++) {
      const insight = safeInsights[i]
      const cardY = currentY + 35 + (i * 130)

      const insightCard = figma.createRectangle()
      insightCard.resize(1190, 120)
      insightCard.x = _SPACING.lg
      insightCard.y = cardY
      insightCard.fills = [{ type: 'SOLID', color: _COLORS.secondarySystemBackground }]
      insightCard.cornerRadius = 12
      insightCard.effects = [createShadow('subtle')]
      marketFrame.appendChild(insightCard)

      const categoryText = await createStyledText(safeString(insight.category), 15, 'Semibold', _COLORS.reservedBlue)
      categoryText.x = _SPACING.lg + _SPACING.md
      categoryText.y = cardY + _SPACING.md
      marketFrame.appendChild(categoryText)

      const insightText = await createStyledText(safeString(insight.insight), 13, 'Regular', _COLORS.label)
      insightText.x = _SPACING.lg + _SPACING.md
      insightText.y = cardY + 35
      insightText.resize(1140, insightText.height)
      marketFrame.appendChild(insightText)

      const impactColors: Record<string, { r: number, g: number, b: number }> = { 
        'High': _COLORS.reservedRed, 
        'Medium': _COLORS.reservedOrange, 
        'Low': _COLORS.reservedGreen 
      }
      const impactColor = impactColors[insight.impact as keyof typeof impactColors] || _COLORS.systemGray
      
      const impact = await createStyledText(`Impact: ${safeString(insight.impact)}`, 11, 'Medium', impactColor)
      impact.x = _SPACING.lg + _SPACING.md
      impact.y = cardY + 90
      marketFrame.appendChild(impact)
    }
  }

  // Competitive Analysis
  if (safeCompetitors.length > 0) {
    const competitorsTitle = await createStyledText(`Competitive Analysis · ${safeCompetitors.length} competitors`, 20, 'Semibold', _COLORS.secondaryLabel)
    competitorsTitle.x = 1260
    competitorsTitle.y = currentY
    marketFrame.appendChild(competitorsTitle)

    for (let i = 0; i < safeCompetitors.length; i++) {
      const competitor = safeCompetitors[i]
      const cardY = currentY + 35 + (i * 130)

      const competitorCard = figma.createRectangle()
      competitorCard.resize(1170, 120)
      competitorCard.x = 1260
      competitorCard.y = cardY
      competitorCard.fills = [{ type: 'SOLID', color: _COLORS.secondarySystemBackground }]
      competitorCard.cornerRadius = 12
      competitorCard.effects = [createShadow('subtle')]
      marketFrame.appendChild(competitorCard)

      const compName = await createStyledText(safeString(competitor.name), 17, 'Semibold', _COLORS.label)
      compName.x = 1260 + _SPACING.md
      compName.y = cardY + _SPACING.md
      marketFrame.appendChild(compName)

      const positioning = await createStyledText(safeString(competitor.positioning), 13, 'Regular', _COLORS.secondaryLabel)
      positioning.x = 1260 + _SPACING.md
      positioning.y = cardY + 35
      positioning.resize(1140, positioning.height)
      marketFrame.appendChild(positioning)

      const strengths = safeArray(competitor.strengths)
      if (strengths.length > 0) {
        const strengthsText = await createStyledText(`Strengths: ${strengths.slice(0, 2).join(', ')}`, 11, 'Regular', _COLORS.reservedGreen)
        strengthsText.x = 1260 + _SPACING.md
        strengthsText.y = cardY + 65
        strengthsText.resize(1140, strengthsText.height)
        marketFrame.appendChild(strengthsText)
      }

      const pricing = await createStyledText(`Pricing: ${safeString(competitor.pricing_model)}`, 11, 'Medium', _COLORS.reservedBlue)
      pricing.x = 1260 + _SPACING.md
      pricing.y = cardY + 90
      pricing.resize(1140, pricing.height)
      marketFrame.appendChild(pricing)
    }
  }

  const finalHeight = Math.max(dynamicHeight, 200 + (maxItems * 130) + _SPACING.lg)
  marketFrame.resize(2450, finalHeight)
  return marketFrame
}

// User flows section
async function createUserFlowsSection(flows: UserFlow[], journey: UserJourneyStep[], x: number, y: number): Promise<FrameNode> {
  const safeFlows = safeArray(flows)
  const safeJourney = safeArray(journey)
  
  const flowsPerRow = 6
  const flowRows = Math.ceil(safeFlows.length / flowsPerRow)
  const flowsHeight = flowRows * 180 + 100
  const journeyHeight = safeJourney.length > 0 ? 300 : 0
  const dynamicHeight = Math.max(900, flowsHeight + journeyHeight + 200)
  
  const flowsFrame = figma.createFrame()
  flowsFrame.name = "User Flows & Journey"
  flowsFrame.resize(2450, dynamicHeight)
  flowsFrame.x = x
  flowsFrame.y = y
  flowsFrame.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  flowsFrame.cornerRadius = 16
  flowsFrame.effects = [createShadow('medium')]

  const title = await createStyledText("User Flows & Journey", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  flowsFrame.appendChild(title)

  let currentY = 80

  // User Flows
  if (safeFlows.length > 0) {
    const flowsTitle = await createStyledText(`User Flows · ${safeFlows.length} flows`, 20, 'Semibold', _COLORS.secondaryLabel)
    flowsTitle.x = _SPACING.lg
    flowsTitle.y = currentY
    flowsFrame.appendChild(flowsTitle)
    currentY += 40

    const flowWidth = 390
    const flowHeight = 165

    for (let i = 0; i < safeFlows.length; i++) {
      const flow = safeFlows[i]
      const col = i % flowsPerRow
      const row = Math.floor(i / flowsPerRow)
      const flowX = _SPACING.lg + (col * 405)
      const flowY = currentY + (row * 180)

      const flowCard = figma.createRectangle()
      flowCard.resize(flowWidth, flowHeight)
      flowCard.x = flowX
      flowCard.y = flowY
      flowCard.fills = [{ type: 'SOLID', color: _COLORS.secondarySystemBackground }]
      flowCard.cornerRadius = 12
      flowCard.effects = [createShadow('subtle')]
      flowsFrame.appendChild(flowCard)

      const flowName = await createStyledText(safeString(flow.flow_name), 17, 'Semibold', _COLORS.label)
      flowName.x = flowX + _SPACING.md
      flowName.y = flowY + _SPACING.md
      flowsFrame.appendChild(flowName)

      const flowDesc = await createStyledText(safeString(flow.description), 13, 'Regular', _COLORS.secondaryLabel)
      flowDesc.x = flowX + _SPACING.md
      flowDesc.y = flowY + 40
      flowDesc.resize(365, flowDesc.height)
      flowsFrame.appendChild(flowDesc)

      const steps = safeArray(flow.steps)
      const stepsText = await createStyledText(`${steps.length} steps · User: ${safeString(flow.user_type)}`, 11, 'Medium', _COLORS.tertiaryLabel)
      stepsText.x = flowX + _SPACING.md
      stepsText.y = flowY + 80
      flowsFrame.appendChild(stepsText)

      const businessValue = await createStyledText(`Value: ${safeString(flow.business_value)}`, 11, 'Regular', _COLORS.reservedGreen)
      businessValue.x = flowX + _SPACING.md
      businessValue.y = flowY + 100
      businessValue.resize(365, businessValue.height)
      flowsFrame.appendChild(businessValue)

      if (steps.length > 0) {
        const firstSteps = steps.slice(0, 3)
        const stepsPreview = await createStyledText(
          `Steps: ${firstSteps.map(s => s.screen_title || 'Step').join(' → ')}${steps.length > 3 ? '...' : ''}`,
          10, 'Regular', _COLORS.quaternaryLabel
        )
        stepsPreview.x = flowX + _SPACING.md
        stepsPreview.y = flowY + 130
        stepsPreview.resize(365, stepsPreview.height)
        flowsFrame.appendChild(stepsPreview)
      }
    }

    currentY += (flowRows * 180) + 40
  }

  // User Journey
  if (safeJourney.length > 0) {
    const journeyTitle = await createStyledText(`User Journey · ${safeJourney.length} stages`, 20, 'Semibold', _COLORS.secondaryLabel)
    journeyTitle.x = _SPACING.lg
    journeyTitle.y = currentY
    flowsFrame.appendChild(journeyTitle)
    currentY += 40

    const maxStagesPerRow = 8
    const stagesThisRow = Math.min(safeJourney.length, maxStagesPerRow)
    const stageWidth = Math.min(280, (2410) / stagesThisRow)
    
    const journeyRows = Math.ceil(safeJourney.length / maxStagesPerRow)
    
    for (let i = 0; i < safeJourney.length; i++) {
      const stage = safeJourney[i]
      const row = Math.floor(i / maxStagesPerRow)
      const col = i % maxStagesPerRow
      const stageX = _SPACING.lg + (col * (stageWidth + _SPACING.sm))
      const stageY = currentY + (row * 240)

      const stageCard = figma.createRectangle()
      stageCard.resize(stageWidth, 220)
      stageCard.x = stageX
      stageCard.y = stageY
      stageCard.fills = [{ type: 'SOLID', color: _COLORS.secondarySystemBackground }]
      stageCard.cornerRadius = 12
      stageCard.effects = [createShadow('subtle')]
      flowsFrame.appendChild(stageCard)

      const stageName = await createStyledText(safeString(stage.stage), 15, 'Semibold', _COLORS.label)
      stageName.x = stageX + _SPACING.md
      stageName.y = stageY + _SPACING.md
      flowsFrame.appendChild(stageName)

      // Emotion indicator
      const emotionColors: Record<string, { r: number, g: number, b: number }> = {
        'frustrated': _COLORS.reservedRed,
        'confused': _COLORS.reservedOrange,
        'excited': _COLORS.reservedGreen,
        'satisfied': _COLORS.reservedBlue,
        'curious': _COLORS.reservedPurple,
        'confident': _COLORS.reservedTeal,
        'optimistic': _COLORS.reservedOrange,
        'neutral': _COLORS.systemGray
      }
      const emotion = stage.emotions || 'neutral'
      const emotionDot = figma.createEllipse()
      emotionDot.resize(12, 12)
      emotionDot.x = stageX + stageWidth - 28
      emotionDot.y = stageY + _SPACING.md
      emotionDot.fills = [{ type: 'SOLID', color: emotionColors[emotion as keyof typeof emotionColors] || emotionColors.neutral }]
      flowsFrame.appendChild(emotionDot)

      const emotionLabel = await createStyledText(emotion, 9, 'Medium', emotionColors[emotion as keyof typeof emotionColors] || emotionColors.neutral)
      emotionLabel.x = stageX + stageWidth - 70
      emotionLabel.y = stageY + 18
      flowsFrame.appendChild(emotionLabel)

      let stageYPos = stageY + 45

      // Actions
      const actions = safeArray(stage.user_actions)
      if (actions.length > 0) {
        const actionsText = await createStyledText(`Actions:\n• ${actions.slice(0, 2).join('\n• ')}`, 11, 'Regular', _COLORS.secondaryLabel)
        actionsText.x = stageX + _SPACING.md
        actionsText.y = stageYPos
        actionsText.resize(stageWidth - 16, actionsText.height)
        flowsFrame.appendChild(actionsText)
        stageYPos += actionsText.height + 12
      }

      // Pain Points
      const painPoints = safeArray(stage.pain_points)
      if (painPoints.length > 0) {
        const painText = await createStyledText(`Pain Points:\n• ${painPoints.slice(0, 2).join('\n• ')}`, 11, 'Regular', _COLORS.reservedRed)
        painText.x = stageX + _SPACING.md
        painText.y = stageYPos
        painText.resize(stageWidth - 16, painText.height)
        flowsFrame.appendChild(painText)
        stageYPos += painText.height + 12
      }

      // Opportunities
      const opportunities = safeArray(stage.opportunities)
      if (opportunities.length > 0 && stageYPos < stageY + 180) {
        const oppsText = await createStyledText(`Opportunities:\n• ${opportunities.slice(0, 1).join('\n• ')}`, 11, 'Regular', _COLORS.reservedGreen)
        oppsText.x = stageX + _SPACING.md
        oppsText.y = stageYPos
        oppsText.resize(stageWidth - 16, oppsText.height)
        flowsFrame.appendChild(oppsText)
        stageYPos += oppsText.height + 10
      }

      // Touchpoints
      const touchpoints = safeArray(stage.touchpoints)
      if (touchpoints.length > 0 && stageYPos < stageY + 200) {
        const touchpointsText = await createStyledText(`Touchpoints: ${touchpoints.slice(0, 2).join(', ')}`, 10, 'Regular', _COLORS.reservedBlue)
        touchpointsText.x = stageX + _SPACING.md
        touchpointsText.y = stageYPos
        touchpointsText.resize(stageWidth - 16, touchpointsText.height)
        flowsFrame.appendChild(touchpointsText)
      }
    }
    currentY += (journeyRows * 240)
  }

  const finalHeight = Math.max(dynamicHeight, currentY + _SPACING.lg)
  flowsFrame.resize(2450, finalHeight)
  return flowsFrame
}

// Key features section
async function createKeyFeaturesSection(mvpFeatures: any[], phase2Features: any[], x: number, y: number): Promise<FrameNode> {
  const allFeatures = [...safeArray(mvpFeatures), ...safeArray(phase2Features)]
  
  const cardHeight = 190
  const cardsPerRow = 6
  const cardSpacing = _SPACING.md
  const totalRows = Math.ceil(allFeatures.length / cardsPerRow)
  const dynamicHeight = Math.max(650, 150 + (totalRows * (cardHeight + cardSpacing)) + _SPACING.xl)
  
  const featuresFrame = figma.createFrame()
  featuresFrame.name = "Key Features"
  featuresFrame.resize(2450, dynamicHeight)
  featuresFrame.x = x
  featuresFrame.y = y
  featuresFrame.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  featuresFrame.cornerRadius = 16
  featuresFrame.effects = [createShadow('medium')]

  const title = await createStyledText("Key Features", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  featuresFrame.appendChild(title)

  let currentY = 80
  
  if (allFeatures.length === 0) {
    const noFeatures = await createStyledText("No features specified", 17, 'Regular', _COLORS.tertiaryLabel)
    noFeatures.x = _SPACING.lg
    noFeatures.y = currentY
    featuresFrame.appendChild(noFeatures)
    return featuresFrame
  }

  const cardWidth = 390

  for (let i = 0; i < allFeatures.length; i++) {
    const feature = allFeatures[i]
    const col = i % cardsPerRow
    const row = Math.floor(i / cardsPerRow)
    
    const cardX = _SPACING.lg + (col * (cardWidth + cardSpacing))
    const cardY = currentY + (row * (cardHeight + cardSpacing))

    const featureName = typeof feature === 'string' ? feature : safeString(feature.name) || 'Unnamed Feature'
    const featureCategory = typeof feature === 'object' ? safeString(feature.category) || 'core' : 'core'
    const featurePriority = typeof feature === 'object' ? safeString(feature.priority) || 'medium' : 'medium'
    const featureDescription = typeof feature === 'object' ? safeString(feature.description) : 'No description provided'
    const featureUserStory = typeof feature === 'object' ? safeString(feature.user_story) : 'No user story provided'

    // Feature card
    const featureCard = figma.createRectangle()
    featureCard.resize(cardWidth, cardHeight)
    featureCard.x = cardX
    featureCard.y = cardY
    featureCard.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
    featureCard.cornerRadius = 12
    featureCard.strokes = [{ type: 'SOLID', color: _COLORS.systemGray4 }]
    featureCard.strokeWeight = 1
    featureCard.effects = [createShadow('subtle')]
    featuresFrame.appendChild(featureCard)

    // Priority indicator
    const priorityColors: Record<string, { r: number, g: number, b: number }> = { 
      'high': _COLORS.reservedRed, 
      'medium': _COLORS.reservedOrange, 
      'low': _COLORS.reservedGreen 
    }
    const priorityColor = priorityColors[featurePriority.toLowerCase() as keyof typeof priorityColors] || _COLORS.systemGray

    const priorityBadge = figma.createRectangle()
    priorityBadge.resize(60, 20)
    priorityBadge.x = cardX + cardWidth - 70
    priorityBadge.y = cardY + _SPACING.md
    priorityBadge.fills = [{ type: 'SOLID', color: priorityColor }]
    priorityBadge.cornerRadius = 10
    featuresFrame.appendChild(priorityBadge)

    const priorityText = await createStyledText(featurePriority.toUpperCase(), 9, 'Semibold', _COLORS.systemBackground)
    priorityText.x = cardX + cardWidth - 58
    priorityText.y = cardY + 20
    featuresFrame.appendChild(priorityText)

    // Category badge
    const categoryColors = { 
      'core': _COLORS.reservedBlue, 
      'additional': _COLORS.reservedPurple 
    }
    const categoryColor = categoryColors[featureCategory.toLowerCase() as keyof typeof categoryColors] || _COLORS.systemGray

    const categoryBadge = figma.createRectangle()
    categoryBadge.resize(70, 20)
    categoryBadge.x = cardX + _SPACING.md
    categoryBadge.y = cardY + _SPACING.md
    categoryBadge.fills = [{ type: 'SOLID', color: categoryColor }]
    categoryBadge.cornerRadius = 10
    featuresFrame.appendChild(categoryBadge)

    const categoryText = await createStyledText(featureCategory.toUpperCase(), 9, 'Semibold', _COLORS.systemBackground)
    categoryText.x = cardX + 22
    categoryText.y = cardY + 20
    featuresFrame.appendChild(categoryText)

    // Feature title
    const featureTitle = await createStyledText(featureName, 17, 'Semibold', _COLORS.label)
    featureTitle.x = cardX + _SPACING.md
    featureTitle.y = cardY + 45
    featureTitle.resize(cardWidth - 32, featureTitle.height)
    featuresFrame.appendChild(featureTitle)

    // Feature description
    const description = await createStyledText(featureDescription, 13, 'Regular', _COLORS.secondaryLabel)
    description.x = cardX + _SPACING.md
    description.y = cardY + 70
    description.resize(cardWidth - 32, Math.min(description.height, 50))
    featuresFrame.appendChild(description)

    // User story section
    const userStoryLabel = await createStyledText("User Story:", 11, 'Semibold', _COLORS.tertiaryLabel)
    userStoryLabel.x = cardX + _SPACING.md
    userStoryLabel.y = cardY + 135
    featuresFrame.appendChild(userStoryLabel)

    const userStory = await createStyledText(featureUserStory, 10, 'Regular', _COLORS.quaternaryLabel)
    userStory.x = cardX + _SPACING.md
    userStory.y = cardY + 150
    userStory.resize(cardWidth - 32, Math.min(userStory.height, 30))
    featuresFrame.appendChild(userStory)
  }

  featuresFrame.resize(2450, dynamicHeight)
  return featuresFrame
}

// Persona card
async function createEnhancedPersonaCard(persona: UserPersona, x: number, y: number): Promise<FrameNode> {
  const card = figma.createFrame()
  card.name = `Persona: ${safeString(persona.name)}`
  card.resize(320, 380)
  card.x = x
  card.y = y
  card.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  card.cornerRadius = 16
  card.effects = [createShadow('medium')]

  let yPos = _SPACING.lg

  // Avatar
  const avatar = figma.createEllipse()
  avatar.resize(60, 60)
  avatar.x = 130
  avatar.y = yPos
  avatar.fills = [{ type: 'SOLID', color: _COLORS.systemGray5 }]
  avatar.effects = [createShadow('subtle')]
  card.appendChild(avatar)

  const avatarIcon = await createStyledText("👤", 30, 'Regular', _COLORS.systemGray)
  avatarIcon.x = 145
  avatarIcon.y = yPos + 11
  card.appendChild(avatarIcon)
  yPos += 80

  // Name and details
  const name = await createStyledText(safeString(persona.name) || 'User Persona', 20, 'Semibold', _COLORS.label)
  name.x = _SPACING.lg
  name.y = yPos
  card.appendChild(name)
  yPos += 30

  const details = await createStyledText(`${safeString(persona.occupation)} · ${safeString(persona.age)}`, 13, 'Regular', _COLORS.secondaryLabel)
  details.x = _SPACING.lg
  details.y = yPos
  card.appendChild(details)
  yPos += 25

  // Quote
  const quote = await createStyledText(`"${safeString(persona.quote)}"`, 13, 'Regular', _COLORS.tertiaryLabel)
  quote.x = _SPACING.lg
  quote.y = yPos
  quote.resize(280, quote.height)
  try {
    await figma.loadFontAsync({ family: "SF Pro Display", style: "Italic" })
    quote.fontName = { family: "SF Pro Display", style: "Italic" }
  } catch (e) {
  }
  card.appendChild(quote)
  yPos += quote.height + 20

  // Goals
  const goalsTitle = await createStyledText("Goals", 15, 'Semibold', _COLORS.label)
  goalsTitle.x = _SPACING.lg
  goalsTitle.y = yPos
  card.appendChild(goalsTitle)
  yPos += 20

  const goals = await createStyledText(safeString(persona.goals), 12, 'Regular', _COLORS.secondaryLabel)
  goals.x = _SPACING.lg
  goals.y = yPos
  goals.resize(280, goals.height)
  card.appendChild(goals)
  yPos += goals.height + 16

  // Needs
  const needs = safeArray(persona.needs)
  if (needs.length > 0) {
    const needsTitle = await createStyledText("Key Needs", 15, 'Semibold', _COLORS.label)
    needsTitle.x = _SPACING.lg
    needsTitle.y = yPos
    card.appendChild(needsTitle)
    yPos += 20

    const needsText = await createStyledText(`• ${needs.slice(0, 2).join('\n• ')}`, 12, 'Regular', _COLORS.secondaryLabel)
    needsText.x = _SPACING.lg
    needsText.y = yPos
    needsText.resize(280, needsText.height)
    card.appendChild(needsText)
  }

  return card
}

// Technical strategy section
async function createTechnicalStrategy(ultimateBrief: UltimateProductBrief, x: number, y: number): Promise<FrameNode> {
  const techReqs = safeArray(ultimateBrief.technical_requirements)
  const security = safeArray(ultimateBrief.security_requirements)
  const scalability = safeArray(ultimateBrief.scalability_considerations)
  
  const baseHeight = 420
  const maxItems = Math.max(techReqs.length, security.length, scalability.length)
  const dynamicHeight = Math.max(baseHeight, 280 + (maxItems * 25))
  
  const techFrame = figma.createFrame()
  techFrame.name = "Technical Strategy"
  techFrame.resize(2450, dynamicHeight)
  techFrame.x = x
  techFrame.y = y
  techFrame.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  techFrame.cornerRadius = 16
  techFrame.effects = [createShadow('medium')]

  const title = await createStyledText("Technical Strategy", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  techFrame.appendChild(title)

  let currentY = 80

  // Technical Architecture (Left)
  const archTitle = await createStyledText("Technical Architecture", 20, 'Semibold', _COLORS.secondaryLabel)
  archTitle.x = _SPACING.lg
  archTitle.y = currentY
  techFrame.appendChild(archTitle)

  const archText = await createStyledText(safeString(ultimateBrief.technical_architecture), 13, 'Regular', _COLORS.secondaryLabel)
  archText.x = _SPACING.lg
  archText.y = currentY + 25
  archText.resize(1200, archText.height)
  techFrame.appendChild(archText)

  // Technical Requirements (Right)
  const reqTitle = await createStyledText(`Technical Requirements · ${techReqs.length} requirements`, 20, 'Semibold', _COLORS.secondaryLabel)
  reqTitle.x = 1260
  reqTitle.y = currentY
  techFrame.appendChild(reqTitle)

  const reqsText = techReqs.length > 0 ? 
    techReqs.map(req => `${req.category}: ${req.complexity} (${req.timeline_estimate})`).join('\n') :
    'No requirements specified'
  
  const reqText = await createStyledText(reqsText, 13, 'Regular', _COLORS.reservedGreen)
  reqText.x = 1260
  reqText.y = currentY + 25
  reqText.resize(1170, reqText.height)
  techFrame.appendChild(reqText)

  currentY += Math.max(archText.height, reqText.height) + 45

  // Security Requirements (Left)
  const securityTitle = await createStyledText(`Security Requirements · ${security.length} requirements`, 20, 'Semibold', _COLORS.secondaryLabel)
  securityTitle.x = _SPACING.lg
  securityTitle.y = currentY
  techFrame.appendChild(securityTitle)

  const securityText = await createStyledText(security.length > 0 ? `• ${security.join('\n• ')}` : 'No security requirements specified', 13, 'Regular', _COLORS.reservedRed)
  securityText.x = _SPACING.lg
  securityText.y = currentY + 25
  securityText.resize(1200, securityText.height)
  techFrame.appendChild(securityText)

  // Scalability Considerations (Right)
  const scalabilityTitle = await createStyledText(`Scalability Considerations · ${scalability.length} considerations`, 20, 'Semibold', _COLORS.secondaryLabel)
  scalabilityTitle.x = 1260
  scalabilityTitle.y = currentY
  techFrame.appendChild(scalabilityTitle)

  const scalabilityText = await createStyledText(scalability.length > 0 ? `• ${scalability.join('\n• ')}` : 'No scalability considerations specified', 13, 'Regular', _COLORS.reservedBlue)
  scalabilityText.x = 1260
  scalabilityText.y = currentY + 25
  scalabilityText.resize(1170, scalabilityText.height)
  techFrame.appendChild(scalabilityText)

  currentY += Math.max(securityText.height, scalabilityText.height) + _SPACING.xl
  techFrame.resize(2450, Math.max(dynamicHeight, currentY))
  return techFrame
}

// Design system details
async function createDesignSystemDetails(ultimateBrief: UltimateProductBrief, x: number, y: number): Promise<FrameNode> {
  const designFrame = figma.createFrame()
  designFrame.name = "Design System Details"
  designFrame.resize(2450, 380)
  designFrame.x = x
  designFrame.y = y
  designFrame.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  designFrame.cornerRadius = 16
  designFrame.effects = [createShadow('medium')]

  const title = await createStyledText("Design System Details", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  designFrame.appendChild(title)

  let currentY = 80

  // Brand Identity (Left)
  const brandTitle = await createStyledText("Brand Identity", 20, 'Semibold', _COLORS.secondaryLabel)
  brandTitle.x = _SPACING.lg
  brandTitle.y = currentY
  designFrame.appendChild(brandTitle)

  const personality = safeArray(ultimateBrief.brand_personality)
  const personalityText = await createStyledText(`Personality: ${personality.length > 0 ? personality.join(' · ') : 'Not defined'}`, 13, 'Medium', _COLORS.reservedPurple)
  personalityText.x = _SPACING.lg
  personalityText.y = currentY + 25
  personalityText.resize(1200, personalityText.height)
  designFrame.appendChild(personalityText)

  const mood = safeArray(ultimateBrief.mood_keywords)
  const moodText = await createStyledText(`Mood: ${mood.length > 0 ? mood.join(', ') : 'Not defined'}`, 13, 'Regular', _COLORS.reservedTeal)
  moodText.x = _SPACING.lg
  moodText.y = currentY + 50
  moodText.resize(1200, moodText.height)
  designFrame.appendChild(moodText)

  // Visual Direction & Inspiration (Right)
  const visualTitle = await createStyledText("Visual Direction & Inspiration", 20, 'Semibold', _COLORS.secondaryLabel)
  visualTitle.x = 1260
  visualTitle.y = currentY
  designFrame.appendChild(visualTitle)

  const visualText = await createStyledText(safeString(ultimateBrief.visual_direction), 13, 'Regular', _COLORS.secondaryLabel)
  visualText.x = 1260
  visualText.y = currentY + 25
  visualText.resize(1170, visualText.height)
  designFrame.appendChild(visualText)

  const inspiration = safeArray(ultimateBrief.inspiration_references)
  const inspirationText = await createStyledText(`Inspiration: ${inspiration.length > 0 ? inspiration.join(', ') : 'None provided'}`, 13, 'Regular', _COLORS.reservedBlue)
  inspirationText.x = 1260
  inspirationText.y = currentY + 50
  inspirationText.resize(1170, inspirationText.height)
  designFrame.appendChild(inspirationText)

  currentY += 100

  // Component Specifications (Left)
  const compTitle = await createStyledText("Component Specifications", 20, 'Semibold', _COLORS.secondaryLabel)
  compTitle.x = _SPACING.lg
  compTitle.y = currentY
  designFrame.appendChild(compTitle)

  const components = safeArray(ultimateBrief.component_specifications)
  if (components.length > 0) {
    const comp = components[0]
    const compText = await createStyledText(`${safeString(comp.component_name)}: ${safeString(comp.description)}`, 13, 'Regular', _COLORS.label)
    compText.x = _SPACING.lg
    compText.y = currentY + 25
    compText.resize(1200, compText.height)
    designFrame.appendChild(compText)

    const states = safeArray(comp.states)
    const statesText = await createStyledText(`States: ${states.join(', ')}`, 11, 'Regular', _COLORS.tertiaryLabel)
    statesText.x = _SPACING.lg
    statesText.y = currentY + 50
    statesText.resize(1200, statesText.height)
    designFrame.appendChild(statesText)
  } else {
    const noCompText = await createStyledText('No component specifications provided', 13, 'Regular', _COLORS.tertiaryLabel)
    noCompText.x = _SPACING.lg
    noCompText.y = currentY + 25
    designFrame.appendChild(noCompText)
  }

  // Accessibility Requirements (Right)
  const accessibility = safeArray(ultimateBrief.accessibility_requirements)
  const accessTitle = await createStyledText(`Accessibility Requirements · ${accessibility.length} requirements`, 20, 'Semibold', _COLORS.secondaryLabel)
  accessTitle.x = 1260
  accessTitle.y = currentY
  designFrame.appendChild(accessTitle)

  const accessText = await createStyledText(accessibility.length > 0 ? `• ${accessibility.join('\n• ')}` : 'No accessibility requirements specified', 13, 'Regular', _COLORS.reservedOrange)
  accessText.x = 1260
  accessText.y = currentY + 25
  accessText.resize(1170, accessText.height)
  designFrame.appendChild(accessText)

  currentY += 100
  designFrame.resize(2450, Math.max(380, currentY))
  return designFrame
}

// Strategic planning section
async function createStrategicPlanning(ultimateBrief: UltimateProductBrief, x: number, y: number): Promise<FrameNode> {
  const jobs = safeArray(ultimateBrief.jobs_to_be_done)
  const vision = safeArray(ultimateBrief.long_term_vision)
  const gtm = safeArray(ultimateBrief.go_to_market_recommendations)
  const risks = safeArray(ultimateBrief.risk_mitigation)
  
  // Calculate dynamic height
  const maxItems = Math.max(jobs.length, vision.length, gtm.length)
  const baseHeight = 420
  const dynamicHeight = Math.max(baseHeight, 300 + (maxItems * 20) + (risks.length * 15))
  
  const strategyFrame = figma.createFrame()
  strategyFrame.name = "Strategic Planning"
  strategyFrame.resize(2450, dynamicHeight)
  strategyFrame.x = x
  strategyFrame.y = y
  strategyFrame.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
  strategyFrame.cornerRadius = 16
  strategyFrame.effects = [createShadow('medium')]

  const title = await createStyledText("Strategic Planning", 28, 'Bold', _COLORS.label)
  title.x = _SPACING.lg
  title.y = _SPACING.lg
  strategyFrame.appendChild(title)

  let currentY = 80

  // Jobs to be Done (Left)
  const jobsTitle = await createStyledText(`Jobs to be Done · ${jobs.length} jobs`, 20, 'Semibold', _COLORS.secondaryLabel)
  jobsTitle.x = _SPACING.lg
  jobsTitle.y = currentY
  strategyFrame.appendChild(jobsTitle)

  const jobsText = await createStyledText(jobs.length > 0 ? `• ${jobs.join('\n• ')}` : 'No jobs specified', 13, 'Regular', _COLORS.reservedGreen)
  jobsText.x = _SPACING.lg
  jobsText.y = currentY + 25
  jobsText.resize(1200, jobsText.height)
  strategyFrame.appendChild(jobsText)

  // Positioning Strategy (Right)
  const positioningTitle = await createStyledText("Positioning Strategy", 20, 'Semibold', _COLORS.secondaryLabel)
  positioningTitle.x = 1260
  positioningTitle.y = currentY
  strategyFrame.appendChild(positioningTitle)

  const positioningText = await createStyledText(safeString(ultimateBrief.positioning_strategy), 13, 'Regular', _COLORS.secondaryLabel)
  positioningText.x = 1260
  positioningText.y = currentY + 25
  positioningText.resize(1170, positioningText.height)
  strategyFrame.appendChild(positioningText)

  currentY += Math.max(jobsText.height, positioningText.height) + 40

  // Long-term Vision (Left)
  const visionTitle = await createStyledText(`Long-term Vision · ${vision.length} vision points`, 20, 'Semibold', _COLORS.secondaryLabel)
  visionTitle.x = _SPACING.lg
  visionTitle.y = currentY
  strategyFrame.appendChild(visionTitle)

  const visionText = await createStyledText(vision.length > 0 ? `• ${vision.join('\n• ')}` : 'No vision specified', 13, 'Regular', _COLORS.reservedPurple)
  visionText.x = _SPACING.lg
  visionText.y = currentY + 25
  visionText.resize(1200, visionText.height)
  strategyFrame.appendChild(visionText)

  // Go-to-Market Strategy (Right)
  const gtmTitle = await createStyledText(`Go-to-Market Strategy · ${gtm.length} recommendations`, 20, 'Semibold', _COLORS.secondaryLabel)
  gtmTitle.x = 1260
  gtmTitle.y = currentY
  strategyFrame.appendChild(gtmTitle)

  const gtmText = await createStyledText(gtm.length > 0 ? `• ${gtm.join('\n• ')}` : 'No recommendations provided', 13, 'Regular', _COLORS.reservedBlue)
  gtmText.x = 1260
  gtmText.y = currentY + 25
  gtmText.resize(1170, gtmText.height)
  strategyFrame.appendChild(gtmText)

  currentY += Math.max(visionText.height, gtmText.height) + 35

  // Risk Mitigation (Full width)
  const riskTitle = await createStyledText(`Risk Mitigation · ${risks.length} risks identified`, 20, 'Semibold', _COLORS.secondaryLabel)
  riskTitle.x = _SPACING.lg
  riskTitle.y = currentY
  strategyFrame.appendChild(riskTitle)

  const riskText = await createStyledText(risks.length > 0 ? `• ${risks.join(' • ')}` : 'No risks identified', 13, 'Regular', _COLORS.reservedRed)
  riskText.x = _SPACING.lg
  riskText.y = currentY + 25
  riskText.resize(2410, riskText.height)
  strategyFrame.appendChild(riskText)

  currentY += riskText.height + _SPACING.xl
  strategyFrame.resize(2450, Math.max(dynamicHeight, currentY))
  return strategyFrame
}

export default function () {
  // Handle API key storage
  once<SetAPIKeyHandler>('SET_API_KEY', async function (apiKey: string) {
    try {
      await figma.clientStorage.setAsync('openai_api_key', apiKey)
    } catch (error) {
      console.error('Error saving API key:', error)
    }
  })
  
  once<GetAPIKeyHandler>('GET_API_KEY', async function () {
    try {
      const storedKey = await figma.clientStorage.getAsync('openai_api_key')
      emit<APIKeyResponseHandler>('API_KEY_RESPONSE', storedKey || null)
    } catch (error) {
      console.error('Error retrieving API key:', error)
      emit<APIKeyResponseHandler>('API_KEY_RESPONSE', null)
    }
  })

  once<ExpandBriefHandler>('EXPAND_BRIEF', async function (ultimateBrief: UltimateProductBrief) {
    try {

      // Generate design systems
      const paletteData = generateColorPalette(ultimateBrief.design_tokens || [])
      const typographyScale = generateTypographyScale(ultimateBrief.design_tokens || [])

      // Create main container
      const mainFrame = figma.createFrame()
      mainFrame.name = "Product Design System"
      mainFrame.resize(2500, 7200)
      mainFrame.fills = [{ type: 'SOLID', color: _COLORS.secondarySystemBackground }]

      let currentY = _SPACING.xl

      // Main title
      const mainTitle = await createStyledText("Product Design System", 34, 'Bold', _COLORS.label)
      mainTitle.x = _SPACING.xl
      mainTitle.y = currentY
      mainFrame.appendChild(mainTitle)

      const subtitle = await createStyledText(safeString(ultimateBrief.refined_brief), 17, 'Regular', _COLORS.secondaryLabel)
      subtitle.x = _SPACING.xl
      subtitle.y = currentY + 45
      subtitle.resize(2430, subtitle.height)
      mainFrame.appendChild(subtitle)
      currentY += 100

      // Color System + Typography (Side by side)
      const colorSystem = await createColorSystem(paletteData, _SPACING.xl, currentY)
      mainFrame.appendChild(colorSystem)

      const typographySystem = await createTypographySystem(typographyScale, 1670, currentY)
      mainFrame.appendChild(typographySystem)
      currentY += Math.max(colorSystem.height, typographySystem.height) + _SPACING.xl

      // Market Intelligence
      const marketIntelligence = await createMarketIntelligence(
        ultimateBrief.market_insights || [],
        ultimateBrief.competitive_analysis || [],
        _SPACING.xl,
        currentY
      )
      mainFrame.appendChild(marketIntelligence)
      currentY += marketIntelligence.height + _SPACING.xl

      // User Flows & Journey
      const userFlowsSection = await createUserFlowsSection(
        ultimateBrief.user_flows || [],
        ultimateBrief.user_journey || [],
        _SPACING.xl,
        currentY
      )
      mainFrame.appendChild(userFlowsSection)
      currentY += userFlowsSection.height + _SPACING.xl

      // Key Features
      const keyFeaturesSection = await createKeyFeaturesSection(
        ultimateBrief.mvp_features || [],
        ultimateBrief.phase_2_features || [],
        _SPACING.xl,
        currentY
      )
      mainFrame.appendChild(keyFeaturesSection)
      currentY += keyFeaturesSection.height + _SPACING.xl

      // Technical Strategy
      const technicalStrategy = await createTechnicalStrategy(ultimateBrief, _SPACING.xl, currentY)
      mainFrame.appendChild(technicalStrategy)
      currentY += technicalStrategy.height + _SPACING.xl

      // Design System Details
      const designSystemDetails = await createDesignSystemDetails(ultimateBrief, _SPACING.xl, currentY)
      mainFrame.appendChild(designSystemDetails)
      currentY += designSystemDetails.height + _SPACING.xl

      // Strategic Planning
      const strategicPlanning = await createStrategicPlanning(ultimateBrief, _SPACING.xl, currentY)
      mainFrame.appendChild(strategicPlanning)
      currentY += strategicPlanning.height + _SPACING.xl

      // User Personas
      const personasTitle = await createStyledText("User Personas", 28, 'Bold', _COLORS.label)
      personasTitle.x = _SPACING.xl
      personasTitle.y = currentY
      mainFrame.appendChild(personasTitle)
      currentY += 50

      const personas = safeArray(ultimateBrief.target_users)
      const personasPerRow = 6
      // Show ALL personas instead of limiting to 18
      for (let i = 0; i < personas.length; i++) {
        const persona = personas[i]
        const cardX = _SPACING.xl + (i % personasPerRow) * 410
        const cardY = currentY + Math.floor(i / personasPerRow) * 460
        
        const personaCard = await createEnhancedPersonaCard(persona, cardX, cardY)
        mainFrame.appendChild(personaCard)
      }
      currentY += Math.ceil(personas.length / personasPerRow) * 460 + _SPACING.xl

      // Strategic Overview
      const strategyTitle = await createStyledText("Strategic Overview & KPIs", 28, 'Bold', _COLORS.label)
      strategyTitle.x = _SPACING.xl
      strategyTitle.y = currentY
      mainFrame.appendChild(strategyTitle)
      currentY += 50

      const metrics = safeArray(ultimateBrief.success_metrics)
      const metricsRows = Math.ceil(metrics.length / 6)
      const strategyFrameHeight = Math.max(280, 180 + (metricsRows * 70))

      const strategyFrame = figma.createFrame()
      strategyFrame.name = "Strategic Overview & KPIs"
      strategyFrame.resize(2430, strategyFrameHeight)
      strategyFrame.x = _SPACING.xl
      strategyFrame.y = currentY
      strategyFrame.fills = [{ type: 'SOLID', color: _COLORS.systemBackground }]
      strategyFrame.cornerRadius = 16
      strategyFrame.effects = [createShadow('medium')]
      mainFrame.appendChild(strategyFrame)

      // Value Proposition and Business Model
      const valueTitle = await createStyledText("Value Proposition", 20, 'Semibold', _COLORS.secondaryLabel)
      valueTitle.x = _SPACING.lg
      valueTitle.y = _SPACING.lg
      strategyFrame.appendChild(valueTitle)

      const valueText = await createStyledText(safeString(ultimateBrief.value_proposition), 15, 'Regular', _COLORS.secondaryLabel)
      valueText.x = _SPACING.lg
      valueText.y = 45
      valueText.resize(1180, valueText.height)
      strategyFrame.appendChild(valueText)

      const businessTitle = await createStyledText("Business Model", 20, 'Semibold', _COLORS.secondaryLabel)
      businessTitle.x = 1230
      businessTitle.y = _SPACING.lg
      strategyFrame.appendChild(businessTitle)

      const businessText = await createStyledText(safeString(ultimateBrief.business_model), 15, 'Regular', _COLORS.secondaryLabel)
      businessText.x = 1230
      businessText.y = 45
      businessText.resize(1180, businessText.height)
      strategyFrame.appendChild(businessText)

      // Success Metrics - SHOW ALL
      const metricsTitle = await createStyledText(`Key Performance Indicators · ${metrics.length} metrics`, 20, 'Semibold', _COLORS.secondaryLabel)
      metricsTitle.x = _SPACING.lg
      metricsTitle.y = 150
      strategyFrame.appendChild(metricsTitle)

      if (metrics.length > 0) {
        // Show ALL metrics instead of limiting to 6
        for (let i = 0; i < metrics.length; i++) {
          const metricCard = figma.createRectangle()
          metricCard.resize(390, 60)
          metricCard.x = _SPACING.lg + (i % 6) * 405
          metricCard.y = 175 + Math.floor(i / 6) * 70
          metricCard.fills = [{ type: 'SOLID', color: _COLORS.secondarySystemBackground }]
          metricCard.cornerRadius = 12
          metricCard.effects = [createShadow('subtle')]
          strategyFrame.appendChild(metricCard)

          const metricText = await createStyledText(`📊 ${metrics[i]}`, 13, 'Medium', _COLORS.reservedBlue)
          metricText.x = _SPACING.lg + 15 + (i % 6) * 405
          metricText.y = 195 + Math.floor(i / 6) * 70
          metricText.resize(360, metricText.height)
          strategyFrame.appendChild(metricText)
        }
      }

      currentY += strategyFrameHeight + 40

      // Adjust main frame height
      mainFrame.resize(2500, currentY)

      // Select and zoom to the created frame
      figma.currentPage.selection = [mainFrame]
      figma.viewport.scrollAndZoomIntoView([mainFrame])

      figma.notify("✨ Complete Design System created! All user flows, insights, competitors, and features are now displayed.")
      figma.closePlugin()

    } catch (error) {
      console.error('Error creating design system:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      figma.notify(`❌ Error creating design system: ${errorMessage}`)
      figma.closePlugin()
    }
  })
  
  showUI({ height: 600, width: 380 })
}