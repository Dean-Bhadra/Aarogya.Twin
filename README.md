# CardioRisk AI | Null Pointers 🫀🤖

🚀 **Live Demo:** [Insert Vercel Link Here]

**CardioRisk AI** is a premium, serverless clinical decision support system built entirely during our Hackathon by **Team Null Pointers**. 

Traditional risk assessment tools are often fragmented, highly technical, and rely on heavy backend architecture. CardioRisk AI bridges this gap through a standalone, privacy-first **Digital Twin** strategy. It utilizes 6 concurrent Machine Learning models operating entirely client-side using pre-calculated weights to predict physiological cardiovascular risks with high clinical accuracy.

## ✨ Key Features
- **Zero-Latency Inference:** Models run entirely in the browser using Javascript via pre-optimized weights. No spinning loading states or external API calls required.
- **Privacy-First (HIPAA Friendly):** Because it is serverless, no sensitive medical records are transmitted to external servers. Data stays strictly on the client device.
- **6 Simultaneous ML Models:** Instantly generates comparative risk matrices for CVD, Type 2 Diabetes, Hypertension, Sleep Disorders, Stress/Anxiety, and Obesity.
- **The What-If Simulation Lab:** A dynamic playground that empowers both patients and physicians to drag sliders and visualize exactly how actionable lifestyle interventions (like dropping weight or fixing HbA1c) directly reduce their real-time calculated mortality risk.
- **Role-Based Workflows:** Separated UX environments for *Patients* (focusing on visual intuition) and *Doctors* (focusing on predictive flagging and patient review).

## 🛠 Tech Stack
- Frontend Framework: **Vite + React.js**
- UI Design: Custom Vanilla CSS (Glassmorphism & Responsive Grids)
- Iconography: **Lucide-React**
- Charts & Visualization: **Chart.js** (`react-chartjs-2`)
- ML Core: Python (scikit-learn) ported to pure structural Javascript mappings.

## 👥 Powered by Team Null Pointers
* **Ayan Banerjee** - ML Engineering & Logistics
* **Debanjan Bhadra** - Project Architecture & UI/UX
* **Anurag Ghosh** - Frontend Integration
* **Debmalya Gupta** - Data Synthesis
* **Zainab Rahman** - Documentation & Quality Control

## 🚀 How to Run Locally 
```bash
# Clone the repository
git clone https://github.com/your-username/CardioRisk-AI.git

# Install dependencies
npm install

# Start the dev server
npm run dev
```
