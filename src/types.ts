import { EventHandler } from '@create-figma-plugin/utilities'

export interface UserPersona {
  name: string
  age: string
  occupation: string
  needs: string[]
  frustrations: string[]
  goals: string
  tech_comfort: 'Low' | 'Medium' | 'High'
  quote: string
  behavioral_traits: string[]
  preferred_channels: string[]
}

export interface UserJourneyStep {
  stage: string
  user_actions: string[]
  pain_points: string[]
  opportunities: string[]
  emotions: 'frustrated' | 'confused' | 'excited' | 'satisfied' | 'neutral'
  touchpoints: string[]
}

export interface Competitor {
  name: string
  strengths: string[]
  weaknesses: string[]
  positioning: string
  key_features: string[]
  pricing_model: string
  target_audience: string
}

export interface TechnicalRequirement {
  category: 'Frontend' | 'Backend' | 'Database' | 'Infrastructure' | 'Integration'
  requirement: string
  complexity: 'Low' | 'Medium' | 'High'
  timeline_estimate: string
  considerations: string[]
}

export interface UserFlow {
  flow_name: string
  description: string
  user_type: string
  steps: {
    step_number: number
    screen_title: string
    primary_action: string
    secondary_actions: string[]
    key_elements: string[]
    success_criteria: string
  }[]
  business_value: string
}

export interface DesignToken {
  category: 'spacing' | 'typography' | 'color' | 'elevation' | 'border'
  name: string
  value: string | number
  usage: string
}

export interface MarketInsight {
  category: 'Market Size' | 'Trends' | 'Opportunities' | 'Threats'
  insight: string
  impact: 'High' | 'Medium' | 'Low'
  source_reasoning: string
  actionable_recommendation: string
}

export interface ComponentSpec {
  component_name: string
  description: string
  states: string[]
  props: string[]
  usage_examples: string[]
  accessibility_notes: string[]
}

export interface UltimateProductBrief {
  // Strategic Foundation
  refined_brief: string
  value_proposition: string
  business_model: string
  success_metrics: string[]
  
  // User Intelligence
  target_users: UserPersona[]
  user_journey: UserJourneyStep[]
  jobs_to_be_done: string[]
  
  // Market Intelligence
  competitive_analysis: Competitor[]
  market_insights: MarketInsight[]
  positioning_strategy: string
  go_to_market_recommendations: string[]
  
  // Technical Strategy
  technical_requirements: TechnicalRequirement[]
  technical_architecture: string
  scalability_considerations: string[]
  security_requirements: string[]
  
  // Design Intelligence
  user_flows: UserFlow[]
  design_tokens: DesignToken[]
  component_specifications: ComponentSpec[]
  accessibility_requirements: string[]
  
  // Visual System
  brand_personality: string[]
  visual_direction: string
  mood_keywords: string[]
  inspiration_references: string[]
  
  // Implementation Roadmap
  mvp_features: {
    name: string
    category: string
    priority: string
    description: string
    user_story: string
  }[]
  phase_2_features: string[]
  long_term_vision: string[]
  risk_mitigation: string[]
}

export interface ExpandBriefHandler extends EventHandler {
  name: 'EXPAND_BRIEF'
  handler: (expandedBrief: UltimateProductBrief) => void
}

export interface SetAPIKeyHandler extends EventHandler {
  name: 'SET_API_KEY'
  handler: (apiKey: string) => void
}

export interface GetAPIKeyHandler extends EventHandler {
  name: 'GET_API_KEY'
  handler: () => void
}

export interface APIKeyResponseHandler extends EventHandler {
  name: 'API_KEY_RESPONSE'
  handler: (apiKey: string | null) => void
}