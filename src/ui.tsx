import {
  Button,
  Container,
  render,
  VerticalSpace,
  Text,
  Textbox,
  LoadingIndicator,
  Tabs,
  TabsOption
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h, Fragment } from 'preact'
import { useCallback, useState, useEffect } from 'preact/hooks'

import { ExpandBriefHandler, UltimateProductBrief, SetAPIKeyHandler, GetAPIKeyHandler, APIKeyResponseHandler } from './types'

function Plugin() {
  const [brief, setBrief] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [ultimateBrief, setUltimateBrief] = useState<UltimateProductBrief | null>(null)
  const [error, setError] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'setup'>('create')
  const [tempApiKey, setTempApiKey] = useState('')

  // Check for stored API key on load
  useEffect(() => {
    emit<GetAPIKeyHandler>('GET_API_KEY')
    
    const unsubscribe = on<APIKeyResponseHandler>('API_KEY_RESPONSE', (storedKey) => {
      if (storedKey) {
        setApiKey(storedKey)
        setHasApiKey(true)
        setActiveTab('create')
      } else {
        setActiveTab('setup')
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleSaveApiKey = useCallback(() => {
    if (!tempApiKey.trim()) return
    
    emit<SetAPIKeyHandler>('SET_API_KEY', tempApiKey.trim())
    setApiKey(tempApiKey.trim())
    setHasApiKey(true)
    setActiveTab('create')
    setTempApiKey('')
  }, [tempApiKey])

  const handleExpandBrief = useCallback(async () => {
    if (!brief.trim() || !hasApiKey) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'system',
            content: 'You are a world-class product strategist and UX expert. Create comprehensive product briefs that combine deep user research, competitive intelligence, technical strategy, and design direction.'
          }, {
            role: 'user',
            content: `Create a comprehensive product brief and design system from: "${brief}"

Return a JSON object with this EXACT structure. For design_tokens, create colors and typography that MATCH THE PRODUCT'S PERSONALITY and work together as color combinations:

For example:
- Fitness app = energetic oranges/reds + complementary blues
- Finance app = trustworthy blues/greens + professional grays
- Creative app = vibrant purples/pinks + bright accents
- Enterprise = professional grays/blues + subtle accents
- Food app = warm oranges/yellows + appetizing reds
- Health app = calming greens/blues + soothing tones

CRITICAL: Include primary, secondary, accent, surface, and background colors that work together in real UI combinations!

{
  "refined_brief": "Clear, actionable version of their brief",
  "value_proposition": "Compelling value proposition statement",
  "business_model": "How the product makes money",
  "success_metrics": ["metric 1", "metric 2", "metric 3"],
  
  "target_users": [
    {
      "name": "Persona Name",
      "age": "25-34", 
      "occupation": "Job Title",
      "needs": ["specific need 1", "specific need 2"],
      "frustrations": ["frustration 1", "frustration 2"],
      "goals": "Main goal in one sentence",
      "tech_comfort": "High",
      "quote": "A quote representing their mindset",
      "behavioral_traits": ["trait 1", "trait 2"],
      "preferred_channels": ["channel 1", "channel 2"]
    }
  ],
  
  "user_journey": [
    {
      "stage": "Awareness",
      "user_actions": ["action 1", "action 2"],
      "pain_points": ["pain 1", "pain 2"],
      "opportunities": ["opportunity 1"],
      "emotions": "confused",
      "touchpoints": ["touchpoint 1", "touchpoint 2"]
    }
  ],
  
  "jobs_to_be_done": ["job 1", "job 2", "job 3"],
  
  "competitive_analysis": [
    {
      "name": "Competitor Name",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "positioning": "How they position themselves",
      "key_features": ["feature 1", "feature 2"],
      "pricing_model": "Pricing approach",
      "target_audience": "Who they target"
    }
  ],
  
  "market_insights": [
    {
      "category": "Market Size",
      "insight": "Specific market insight",
      "impact": "High",
      "source_reasoning": "Why this insight matters",
      "actionable_recommendation": "What to do about it"
    }
  ],
  
  "positioning_strategy": "How to position against competitors",
  "go_to_market_recommendations": ["strategy 1", "strategy 2"],
  
  "technical_requirements": [
    {
      "category": "Frontend",
      "requirement": "Specific technical requirement",
      "complexity": "Medium",
      "timeline_estimate": "2-3 weeks",
      "considerations": ["consideration 1", "consideration 2"]
    }
  ],
  
  "technical_architecture": "High-level architecture description",
  "scalability_considerations": ["consideration 1", "consideration 2"],
  "security_requirements": ["requirement 1", "requirement 2"],
  
  "user_flows": [
    {
      "flow_name": "User Registration",
      "description": "How users sign up",
      "user_type": "New User",
      "steps": [
        {
          "step_number": 1,
          "screen_title": "Welcome Screen",
          "primary_action": "Sign Up",
          "secondary_actions": ["Sign In", "Learn More"],
          "key_elements": ["Logo", "Value Prop", "CTA"],
          "success_criteria": "User clicks Sign Up"
        }
      ],
      "business_value": "Increases user acquisition"
    }
  ],
  
  "design_tokens": [
    {"category": "color", "name": "primary-50", "value": "#[CHOOSE COLORS THAT MATCH THE PRODUCT PERSONALITY - NOT ALWAYS BLUE]", "usage": "Primary color lightest shade"},
    {"category": "color", "name": "primary-100", "value": "#[VARY BASED ON PRODUCT TYPE]", "usage": "Primary color very light"},
    {"category": "color", "name": "primary-200", "value": "#[MATCH PRODUCT MOOD]", "usage": "Primary color light"},
    {"category": "color", "name": "primary-300", "value": "#[BRAND APPROPRIATE COLOR]", "usage": "Primary color medium light"},
    {"category": "color", "name": "primary-400", "value": "#[CONTEXTUAL COLOR CHOICE]", "usage": "Primary color medium"},
    {"category": "color", "name": "primary-500", "value": "#[MAIN BRAND COLOR - VARY BY PRODUCT]", "usage": "Primary brand color"},
    {"category": "color", "name": "primary-600", "value": "#[DARKER VARIANT]", "usage": "Primary color medium dark"},
    {"category": "color", "name": "primary-700", "value": "#[EVEN DARKER]", "usage": "Primary color dark"},
    {"category": "color", "name": "primary-800", "value": "#[VERY DARK]", "usage": "Primary color very dark"},
    {"category": "color", "name": "primary-900", "value": "#[DARKEST SHADE]", "usage": "Primary color darkest"},
    
    {"category": "color", "name": "secondary-500", "value": "#[COMPLEMENTARY COLOR TO PRIMARY]", "usage": "Secondary brand color"},
    {"category": "color", "name": "accent-500", "value": "#[ACCENT COLOR FOR HIGHLIGHTS]", "usage": "Accent color for CTAs and highlights"},
    
    {"category": "color", "name": "gray-50", "value": "#f9fafb", "usage": "Background light"},
    {"category": "color", "name": "gray-100", "value": "#f3f4f6", "usage": "Background medium"},
    {"category": "color", "name": "gray-200", "value": "#e5e7eb", "usage": "Border light"},
    {"category": "color", "name": "gray-300", "value": "#d1d5db", "usage": "Border medium"},
    {"category": "color", "name": "gray-400", "value": "#9ca3af", "usage": "Text muted"},
    {"category": "color", "name": "gray-500", "value": "#6b7280", "usage": "Text secondary"},
    {"category": "color", "name": "gray-600", "value": "#4b5563", "usage": "Text primary"},
    {"category": "color", "name": "gray-700", "value": "#374151", "usage": "Text dark"},
    {"category": "color", "name": "gray-800", "value": "#1f2937", "usage": "Text very dark"},
    {"category": "color", "name": "gray-900", "value": "#111827", "usage": "Text darkest"},
    
    {"category": "color", "name": "success", "value": "#10b981", "usage": "Success states and messages"},
    {"category": "color", "name": "warning", "value": "#f59e0b", "usage": "Warning states and messages"},
    {"category": "color", "name": "error", "value": "#ef4444", "usage": "Error states and messages"},
    {"category": "color", "name": "info", "value": "#3b82f6", "usage": "Informational messages"},
    
    {"category": "color", "name": "surface", "value": "#ffffff", "usage": "Card and surface backgrounds"},
    {"category": "color", "name": "background", "value": "#f8fafc", "usage": "Main background color"},
    
    {"category": "color", "name": "gray-50", "value": "#f9fafb", "usage": "Background light"},
    {"category": "color", "name": "gray-100", "value": "#f3f4f6", "usage": "Background medium"},
    {"category": "color", "name": "gray-200", "value": "#e5e7eb", "usage": "Border light"},
    {"category": "color", "name": "gray-300", "value": "#d1d5db", "usage": "Border medium"},
    {"category": "color", "name": "gray-400", "value": "#9ca3af", "usage": "Text muted"},
    {"category": "color", "name": "gray-500", "value": "#6b7280", "usage": "Text secondary"},
    {"category": "color", "name": "gray-600", "value": "#4b5563", "usage": "Text primary"},
    {"category": "color", "name": "gray-700", "value": "#374151", "usage": "Text dark"},
    {"category": "color", "name": "gray-800", "value": "#1f2937", "usage": "Text very dark"},
    {"category": "color", "name": "gray-900", "value": "#111827", "usage": "Text darkest"},
    
    {"category": "color", "name": "success", "value": "#10b981", "usage": "Success states and messages"},
    {"category": "color", "name": "warning", "value": "#f59e0b", "usage": "Warning states and messages"},
    {"category": "color", "name": "error", "value": "#ef4444", "usage": "Error states and messages"},
    {"category": "color", "name": "info", "value": "#3b82f6", "usage": "Informational messages"},
    
    {"category": "typography", "name": "text-xs", "value": 12, "usage": "Extra small text"},
    {"category": "typography", "name": "text-sm", "value": 14, "usage": "Small text"},
    {"category": "typography", "name": "text-base", "value": 16, "usage": "Base body text"},
    {"category": "typography", "name": "text-lg", "value": 18, "usage": "Large text"},
    {"category": "typography", "name": "text-xl", "value": 20, "usage": "Extra large text"},
    {"category": "typography", "name": "text-2xl", "value": 24, "usage": "Heading 4"},
    {"category": "typography", "name": "text-3xl", "value": 30, "usage": "Heading 3"},
    {"category": "typography", "name": "text-4xl", "value": 36, "usage": "Heading 2"},
    {"category": "typography", "name": "text-5xl", "value": 48, "usage": "Heading 1"},
    {"category": "typography", "name": "text-6xl", "value": 60, "usage": "Display text"},
    
    {"category": "spacing", "name": "space-1", "value": "4px", "usage": "Extra small spacing"},
    {"category": "spacing", "name": "space-2", "value": "8px", "usage": "Small spacing"},
    {"category": "spacing", "name": "space-3", "value": "12px", "usage": "Medium small spacing"},
    {"category": "spacing", "name": "space-4", "value": "16px", "usage": "Medium spacing"},
    {"category": "spacing", "name": "space-6", "value": "24px", "usage": "Large spacing"},
    {"category": "spacing", "name": "space-8", "value": "32px", "usage": "Extra large spacing"},
    
    {"category": "border", "name": "border-radius-sm", "value": "4px", "usage": "Small border radius"},
    {"category": "border", "name": "border-radius-md", "value": "8px", "usage": "Medium border radius"},
    {"category": "border", "name": "border-radius-lg", "value": "12px", "usage": "Large border radius"},
    {"category": "border", "name": "border-radius-xl", "value": "16px", "usage": "Extra large border radius"}
  ],
  
  "component_specifications": [
    {
      "component_name": "Primary Button",
      "description": "Main action button",
      "states": ["default", "hover", "pressed", "disabled"],
      "props": ["text", "onClick", "disabled", "size"],
      "usage_examples": ["Save", "Submit", "Continue"],
      "accessibility_notes": ["Keyboard focusable", "Screen reader compatible"]
    }
  ],
  
  "accessibility_requirements": ["requirement 1", "requirement 2"],
  
  "brand_personality": ["Modern", "Trustworthy", "Efficient"],
  "visual_direction": "Clean, minimal design with focus on usability",
  "mood_keywords": ["modern", "clean", "trustworthy"],
  "inspiration_references": ["Stripe", "Linear", "Notion"],
  
  "mvp_features": [
    {
      "name": "Feature Name",
      "category": "core",
      "priority": "high",
      "description": "Clear description of what this feature does and why it matters",
      "user_story": "As a [user type], I want [goal] so that [benefit]"
    }
  ],
  "phase_2_features": [
    {
      "name": "Feature Name", 
      "category": "additional",
      "priority": "medium",
      "description": "Description of the feature functionality",
      "user_story": "As a [user type], I want [goal] so that [benefit]"
    }
  ],
  "long_term_vision": ["vision 1", "vision 2"],
  "risk_mitigation": ["risk 1 mitigation", "risk 2 mitigation"]
}

CRITICAL: The design_tokens array MUST include ALL the tokens shown above for a complete design system. Create 3+ detailed personas, 5+ user journey stages, 3+ competitors, and comprehensive technical requirements. Be specific and actionable for a real product.`
          }],
          temperature: 0.7,
          max_tokens: 8000
        })
      })

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.error?.type === 'insufficient_quota') {
          throw new Error('OpenAI quota exceeded. Please check your billing and usage limits.')
        } else {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
      }
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key in Setup.')
      }
      
      if (response.status === 403) {
        throw new Error('Access denied. Please ensure billing is enabled on your OpenAI account.')
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json() 
      const content = data.choices[0].message.content
      // console.log(content);
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format - could not parse JSON')
      }
      
      const ultimateBriefData = JSON.parse(jsonMatch[0])
      setUltimateBrief(ultimateBriefData)
      
    } catch (err) {
      console.error('API Error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to generate design system. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [brief, apiKey, hasApiKey])

  const handleCreateInFigma = useCallback(() => {
    if (ultimateBrief) {
      emit<ExpandBriefHandler>('EXPAND_BRIEF', ultimateBrief)
    }
  }, [ultimateBrief])

  const tabsOptions: TabsOption[] = [
    { children: '', value: 'create' },
    { children: '', value: 'setup' }
  ]

  return h(Container, { 
    space: "medium",
    children: [
      h(VerticalSpace, { space: "small" }),
      
      h(Tabs, {
        options: tabsOptions,
        onValueChange: (value: string) => setActiveTab(value as 'create' | 'setup'),
        value: activeTab
      }),
      
      h(VerticalSpace, { space: "medium" }),
    
    // Setup Tab
    activeTab === 'setup' && h(Fragment, null,
      h(Text, { style: { fontWeight: 'bold', fontSize: '14px' }, children: "Connect OpenAI API" }),
      h(VerticalSpace, { space: "extraSmall" }),
      h(Text, { style: { fontSize: '11px', color: '#666' }, children: "Your API key is stored locally and never shared." }),
      h(VerticalSpace, { space: "medium" }),
      
      h(Text, { style: { fontSize: '12px', fontWeight: '500' }, children: "OpenAI API Key" }),
      h(VerticalSpace, { space: "extraSmall" }),
      h(Textbox, {
        onValueInput: setTempApiKey,
        placeholder: "sk-proj-...",
        value: tempApiKey,
        password: true
      }),
      
      h(VerticalSpace, { space: "medium" }),
      h(Button, { 
        fullWidth: true, 
        onClick: handleSaveApiKey,
        disabled: !tempApiKey.trim(),
        children: hasApiKey ? "Update API Key" : "Save API Key"
      }),
      
      hasApiKey && h(Fragment, null,
        h(VerticalSpace, { space: "small" }),
        h('div', { style: { 
          padding: '8px 12px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '4px'
        }},
          h(Text, { style: { color: '#0369a1', fontSize: '11px' }, children: "✓ API key configured successfully" })
        )
      )
    ),
    
    // Create Tab
    activeTab === 'create' && h(Fragment, null,
      !hasApiKey && h(Fragment, null,
        h('div', { style: { 
          padding: '12px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fca5a5', 
          borderRadius: '6px',
          marginBottom: '16px'
        }},
          h(Text, { style: { color: '#dc2626', fontSize: '11px' }, children: "⚠️ Please configure your OpenAI API key in Setup first" })
        )
      ),
      
      h(Text, { style: { fontWeight: 'bold', fontSize: '14px' }, children: "Product Concept" }),
      h(VerticalSpace, { space: "extraSmall" }),
      h(Text, { style: { fontSize: '11px', color: '#666', lineHeight: '1.4' }, 
        children: "Describe your product idea to generate a comprehensive design system with brand colors, user research, competitive analysis, and technical specifications." }),
      h(VerticalSpace, { space: "small" }),
      
      h(Textbox, {
        onValueInput: setBrief,
        placeholder: "e.g., AI-powered task management app for remote creative teams",
        value: brief,
      }),
      
      h(VerticalSpace, { space: "medium" }),
      
      h(Button, { 
        fullWidth: true, 
        onClick: handleExpandBrief,
        disabled: !brief.trim() || !hasApiKey || isLoading,
        children: isLoading ? 'Generating System...' : 'Generate Design System'
      }),
      
      isLoading && h(Fragment, null,
        h(VerticalSpace, { space: "medium" }),
        h(LoadingIndicator, null),
        h(VerticalSpace, { space: "small" }),
        h(Text, { 
          style: { fontSize: '11px', color: '#666', textAlign: 'center', lineHeight: '1.4' }, 
          children: "Creating brand color palettes, user personas, competitive insights, and technical architecture..." 
        })
      ),
      
      error && h(Fragment, null,
        h(VerticalSpace, { space: "medium" }),
        h('div', { style: { 
          padding: '12px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fca5a5', 
          borderRadius: '6px'
        }},
          h(Text, { style: { color: '#dc2626', fontSize: '11px', lineHeight: '1.4' }, children: error })
        )
      ),
      
      ultimateBrief && h(Fragment, null,
        h(VerticalSpace, { space: "large" }),
        h(Text, { style: { fontWeight: 'bold', fontSize: '14px' }, children: "Generated Design System" }),
        h(VerticalSpace, { space: "small" }),
        
        h('div', { style: { 
          maxHeight: '320px', 
          overflow: 'auto', 
          fontSize: '11px', 
          lineHeight: '1.4', 
          backgroundColor: '#f8fafb', 
          padding: '16px', 
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        } },
          // Strategy Section
          h('div', { style: { marginBottom: '16px' } },
            h('div', { style: { fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' } }, "🎯 Strategy"),
            h('div', { style: { marginBottom: '6px' } }, ultimateBrief.refined_brief),
            h('div', { style: { color: '#64748b' } }, `Value: ${ultimateBrief.value_proposition}`)
          ),
          
          // Users & Market
          h('div', { style: { marginBottom: '16px' } },
            h('div', { style: { fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' } }, 
              `👥 Users & Market (${ultimateBrief.target_users.length} personas, ${ultimateBrief.competitive_analysis.length} competitors)`),
            h('div', null, ultimateBrief.target_users.slice(0, 2).map((persona, i) =>
              h('div', { key: i, style: { margin: '2px 0', paddingLeft: '8px' } }, 
                `• ${persona.name} (${persona.age}) - ${persona.occupation}`
              )
            )),
            ultimateBrief.target_users.length > 2 && 
            h('div', { style: { paddingLeft: '8px', fontStyle: 'italic', color: '#64748b' } }, 
              `+${ultimateBrief.target_users.length - 2} more personas`)
          ),
          
          // Design System Colors Preview
          h('div', { style: { marginBottom: '16px' } },
            h('div', { style: { fontWeight: 'bold', color: '#1e293b', marginBottom: '6px' } }, 
              `🎨 Design System (${ultimateBrief.design_tokens.filter(t => t.category === 'color').length} colors, typography, spacing)`),
            h('div', { style: { display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' } },
              ultimateBrief.design_tokens.filter(t => t.category === 'color' && t.name.includes('500')).slice(0, 6).map((token, i) =>
                h('div', { 
                  key: i, 
                  style: { 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: token.value,
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    title: `${token.name}: ${token.value}`
                  }
                })
              )
            ),
            h('div', { style: { fontSize: '10px', color: '#64748b' } }, 
              "Brand color palette with light/dark theme variants")
          ),
          
          // Features & Implementation
          h('div', { style: { marginBottom: '16px' } },
            h('div', { style: { fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' } }, 
              `⚡ Features (${ultimateBrief.mvp_features.length} MVP, ${ultimateBrief.phase_2_features.length} Phase 2)`),
            h('div', null, ultimateBrief.mvp_features.slice(0, 3).map((feature, i) =>
              h('div', { key: i, style: { margin: '2px 0', paddingLeft: '8px' } }, 
                `• ${typeof feature === 'string' ? feature : `${feature.name} (${feature.priority})`}`
              )
            )),
            ultimateBrief.mvp_features.length > 3 && 
            h('div', { style: { paddingLeft: '8px', fontStyle: 'italic', color: '#64748b' } }, 
              `+${ultimateBrief.mvp_features.length - 3} more MVP features`)
          ),
          
          // Technical & Flows
          h('div', { style: { marginBottom: '8px' } },
            h('div', { style: { fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' } }, 
              `🔧 Technical (${ultimateBrief.technical_requirements.length} requirements, ${ultimateBrief.user_flows.length} flows)`),
            h('div', null, ultimateBrief.technical_requirements.slice(0, 2).map((req, i) =>
              h('div', { key: i, style: { margin: '2px 0', paddingLeft: '8px' } }, 
                `• ${req.category}: ${req.complexity} complexity`
              )
            ))
          )
        ),
        
        h(VerticalSpace, { space: "medium" }),
        h(Button, { 
          fullWidth: true, 
          onClick: handleCreateInFigma, 
          children: "Create in Figma" 
        }),
        h(VerticalSpace, { space: "small" }),
        h(Text, { 
          style: { fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: '1.3' }, 
          children: "Complete system with colors, typography, components, user flows, and business insights" 
        })
      )
    ),
    
    h(VerticalSpace, { space: "small" })
    ]
  })
}

export default render(Plugin)