# One-Shot Product Design System – Figma Plugin

Built in response to the **“You Only Get One API Call”** prompt.

This Figma plugin takes a single product idea and uses one OpenAI API call to generate a complete, structured product brief. It then parses the response and renders the system directly into Figma as visual frames.

---

## Output Includes

- Refined product concept  
- Value proposition and business model  
- User personas and journeys  
- Jobs to be done  
- Competitive and market insights  
- MVP and phase 2 features  
- KPIs and long-term vision  
- Design tokens (color, type, spacing)  
- Technical architecture and requirements  


[`See sample output`](https://www.figma.com/design/1GzMBOadIfEzW5dFmhicYO/One-Shot-Brief-Demo?node-id=0-1&t=zJPNAyjtOp0U5rFi-1)

---

## How It Works

1. User inputs a short product description  
2. Plugin sends **a single GPT-4o API call** to OpenAI  
3. Receives structured JSON brief  
4. Parses and renders:
   - Color system and typography scale  
   - Personas and user flows  
   - Feature roadmap and technical strategy  
   - Strategic positioning and success metrics  

---

## Code Highlights

- OpenAI API call and structured system prompt:  
  [`src/ui.tsx`](src/ui.tsx), **lines 64–302**

---

## Run Locally in Figma Desktop

1. Clone this repository  
   ```bash
   git clone https://github.com/annsts/figma-ai-ux.git
   cd figma-ai-ux
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Build the plugin  
   ```bash
   npm run build
   ```

4. Open **Figma Desktop → Plugins → Development → Import Plugin From Manifest...**  
   - Select the `manifest.json` file from the project directory.

5. Run the plugin inside any Figma file via:  
   **Plugins → Development → One-Shot Brief**