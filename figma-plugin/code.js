// ReThera AI — Programmatic Figma Design System & Screens Generator
// Runs directly in Figma Plugin environment (Desktop or Web)

figma.showUI(__html__, { width: 360, height: 460 });

const COLORS = {
  darkBg: { r: 6/255, g: 17/255, b: 31/255 },       // #06111F
  sidebarBg: { r: 7/255, g: 19/255, b: 33/255 },    // #071321
  surfaceBg: { r: 10/255, g: 27/255, b: 43/255 },   // #0A1B2B
  elevatedBg: { r: 13/255, g: 34/255, b: 51/255 },  // #0D2233
  border: { r: 28/255, g: 54/255, b: 72/255 },      // #1C3648
  textPrimary: { r: 232/255, g: 243/255, b: 247/255 }, // #E8F3F7
  textSecondary: { r: 155/255, g: 176/255, b: 191/255 }, // #9BB0BF
  primaryTeal: { r: 20/255, g: 217/255, b: 181/255 },  // #14D9B5
  cyanAccent: { r: 49/255, g: 197/255, b: 244/255 },   // #31C5F4
  indigoAccent: { r: 124/255, g: 115/255, b: 255/255 }, // #7C73FF
  success: { r: 45/255, g: 212/255, b: 167/255 },     // #2DD4A7
  warning: { r: 244/255, g: 188/255, b: 88/255 },     // #F4BC58
  danger: { r: 251/255, g: 113/255, b: 133/255 },     // #FB7185
  white: { r: 1, g: 1, b: 1 },
  lightBg: { r: 244/255, g: 247/255, b: 250/255 },   // #F4F7FA
  lightBorder: { r: 220/255, g: 229/255, b: 236/255 }, // #DCE5EC
  lightText: { r: 18/255, g: 36/255, b: 53/255 }      // #122435
};

async function loadFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
}

function createText(text, size = 12, weight = "Regular", color = COLORS.textPrimary) {
  const node = figma.createText();
  node.fontName = { family: "Inter", style: weight };
  node.characters = text;
  node.fontSize = size;
  node.fills = [{ type: 'SOLID', color: color }];
  return node;
}

function createCard(width, height, bgColor = COLORS.surfaceBg, borderColor = COLORS.border, radius = 8) {
  const frame = figma.createFrame();
  frame.resize(width, height);
  frame.fills = [{ type: 'SOLID', color: bgColor }];
  frame.strokes = [{ type: 'SOLID', color: borderColor }];
  frame.strokeWeight = 1;
  frame.cornerRadius = radius;
  frame.clipsContent = true;
  return frame;
}

function createBadge(label, color, bgColor) {
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "AUTO";
  badge.paddingLeft = 8;
  badge.paddingRight = 8;
  badge.paddingTop = 3;
  badge.paddingBottom = 3;
  badge.cornerRadius = 4;
  badge.fills = [{ type: 'SOLID', color: bgColor }];
  badge.strokes = [{ type: 'SOLID', color: color }];
  badge.strokeWeight = 1;
  
  const text = createText(label, 10, "Semi Bold", color);
  badge.appendChild(text);
  return badge;
}

function createScreenFrame(title, isLight = false) {
  const frame = figma.createFrame();
  frame.name = title;
  frame.resize(1440, 1000);
  frame.fills = [{ type: 'SOLID', color: isLight ? COLORS.lightBg : COLORS.darkBg }];
  frame.clipsContent = true;

  // Add Left Sidebar
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar";
  sidebar.resize(240, 1000);
  sidebar.x = 0;
  sidebar.y = 0;
  sidebar.fills = [{ type: 'SOLID', color: isLight ? COLORS.white : COLORS.sidebarBg }];
  sidebar.strokes = [{ type: 'SOLID', color: isLight ? COLORS.lightBorder : COLORS.border }];
  sidebar.strokeWeight = 1;

  // Sidebar Logo
  const logo = createText("ReThera AI", 16, "Bold", isLight ? COLORS.lightText : COLORS.primaryTeal);
  logo.x = 20;
  logo.y = 24;
  sidebar.appendChild(logo);

  const sub = createText("Evidence-First Drug Repurposing", 9, "Regular", COLORS.textSecondary);
  sub.x = 20;
  sub.y = 46;
  sidebar.appendChild(sub);

  // Sidebar Nav Items
  const items = [
    { label: "Dashboard", active: title.includes("Dashboard") },
    { label: "Repurposing", active: title.includes("Repurposing") || title.includes("Workbench") },
    { label: "Knowledge Graph", active: title.includes("Knowledge Graph") },
    { label: "Compounds", active: title.includes("Compounds") },
    { label: "Evidence Monitor", active: title.includes("Evidence Monitor") },
    { label: "Reports", active: title.includes("Reports") || title.includes("Dossier") }
  ];

  items.forEach((item, index) => {
    const navItem = figma.createFrame();
    navItem.resize(200, 36);
    navItem.x = 20;
    navItem.y = 90 + index * 42;
    navItem.cornerRadius = 6;
    if (item.active) {
      navItem.fills = [{ type: 'SOLID', color: isLight ? { r: 8/255, g: 127/255, b: 112/255 } : COLORS.elevatedBg }];
      navItem.strokes = [{ type: 'SOLID', color: COLORS.primaryTeal }];
      navItem.strokeWeight = 1;
    } else {
      navItem.fills = [];
    }

    const itemText = createText(item.label, 12, item.active ? "Semi Bold" : "Medium", item.active ? (isLight ? COLORS.white : COLORS.primaryTeal) : (isLight ? COLORS.lightText : COLORS.textSecondary));
    itemText.x = 12;
    itemText.y = 10;
    navItem.appendChild(itemText);
    sidebar.appendChild(navItem);
  });

  frame.appendChild(sidebar);

  // Add TopBar
  const topbar = figma.createFrame();
  topbar.name = "TopBar";
  topbar.resize(1200, 64);
  topbar.x = 240;
  topbar.y = 0;
  topbar.fills = [{ type: 'SOLID', color: isLight ? COLORS.white : COLORS.darkBg }];
  topbar.strokes = [{ type: 'SOLID', color: isLight ? COLORS.lightBorder : COLORS.border }];
  topbar.strokeWeight = 1;

  const breadcrumb = createText(`ReThera AI / ${title.split('—')[0].trim()}`, 13, "Medium", isLight ? COLORS.lightText : COLORS.textPrimary);
  breadcrumb.x = 24;
  breadcrumb.y = 24;
  topbar.appendChild(breadcrumb);

  const profile = createText("Dr. Sarah Chen • Translational Oncology", 11, "Regular", COLORS.textSecondary);
  profile.x = 940;
  profile.y = 24;
  topbar.appendChild(profile);

  frame.appendChild(topbar);

  return frame;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-all') {
    await loadFonts();

    const pageNames = [
      "00 — Cover & Project Overview",
      "01 — Design System & Tokens (Colors, Typography, Elevation)",
      "02 — Component Library & Variants",
      "03 — Screen 1: Dashboard (Dark & Light)",
      "04 — Screen 2: New Investigation Wizard & Job Progress",
      "05 — Screen 3: Repurposing Workbench & Multi-Factor Ranking",
      "06 — Screen 4: Candidate Details (Tamoxifen Case Study)",
      "07 — Screen 5: Biomedical Knowledge Graph Explorer",
      "08 — Screen 6: Compounds Library & Watchlist",
      "09 — Screen 7: Live Evidence Monitor (TinyFish Search & Fetch)",
      "10 — Screen 8–10: Evidence Review Drawer, Research Dossier & Reports Archive",
      "11 — Screen 11–13: Settings, Comparative Matrix & ReThera Discover Preview"
    ];

    // Ensure all 12 pages exist
    const pages = [];
    const existingPages = figma.root.children;

    for (let i = 0; i < pageNames.length; i++) {
      let page = existingPages[i];
      if (!page) {
        page = figma.createPage();
      }
      page.name = pageNames[i];
      pages.push(page);
    }

    // ==========================================
    // PAGE 00: COVER & PROJECT OVERVIEW
    // ==========================================
    figma.currentPage = pages[0];
    const coverFrame = figma.createFrame();
    coverFrame.name = "Project Cover 1920x1080";
    coverFrame.resize(1920, 1080);
    coverFrame.fills = [{ type: 'SOLID', color: COLORS.darkBg }];
    
    const coverTitle = createText("ReThera AI", 48, "Bold", COLORS.primaryTeal);
    coverTitle.x = 120;
    coverTitle.y = 200;
    coverFrame.appendChild(coverTitle);

    const coverSubtitle = createText("Evidence-First Drug Repurposing & Translational Research Platform", 24, "Medium", COLORS.textPrimary);
    coverSubtitle.x = 120;
    coverSubtitle.y = 270;
    coverFrame.appendChild(coverSubtitle);

    const coverDesc = createText("Complete, high-fidelity UI/UX design system and application suite.\nVisual direction strictly aligned to Image 2: dark navy architecture, glowing teal accents, fine borders, and dense biomedical analytics.", 15, "Regular", COLORS.textSecondary);
    coverDesc.x = 120;
    coverDesc.y = 330;
    coverFrame.appendChild(coverDesc);

    const specCard = createCard(480, 260, COLORS.surfaceBg, COLORS.border, 12);
    specCard.x = 120;
    specCard.y = 440;
    const cardTitle = createText("Specification Summary", 14, "Bold", COLORS.cyanAccent);
    cardTitle.x = 24; cardTitle.y = 24;
    specCard.appendChild(cardTitle);

    const specs = [
      "• 13 Dedicated Research Screens & Workflows",
      "• Dual Theme Architecture (Dark #06111F / Light #F4F7FA)",
      "• 6-Factor Multi-Criteria Triage Ranking Heuristic",
      "• TinyFish Search & Fetch Live Unstructured Monitoring",
      "• Contradiction Engine (ESR1 Y537S, CYP2D6 Deficits)",
      "• Reproducible Research Dossier & Audit Trails"
    ];
    specs.forEach((spec, sIdx) => {
      const sNode = createText(spec, 12, "Regular", COLORS.textPrimary);
      sNode.x = 24;
      sNode.y = 60 + sIdx * 28;
      specCard.appendChild(sNode);
    });
    coverFrame.appendChild(specCard);
    pages[0].appendChild(coverFrame);

    // ==========================================
    // PAGE 01: DESIGN SYSTEM & TOKENS
    // ==========================================
    figma.currentPage = pages[1];
    const tokensFrame = figma.createFrame();
    tokensFrame.name = "Design Tokens Canvas";
    tokensFrame.resize(1600, 1200);
    tokensFrame.fills = [{ type: 'SOLID', color: COLORS.darkBg }];

    const tTitle = createText("ReThera AI — Design Tokens & Variables", 28, "Bold", COLORS.textPrimary);
    tTitle.x = 80; tTitle.y = 60;
    tokensFrame.appendChild(tTitle);

    // Color Swatches
    const colorEntries = [
      { name: "App Background", hex: "#06111F", color: COLORS.darkBg },
      { name: "Sidebar Background", hex: "#071321", color: COLORS.sidebarBg },
      { name: "Main Surface", hex: "#0A1B2B", color: COLORS.surfaceBg },
      { name: "Elevated Surface", hex: "#0D2233", color: COLORS.elevatedBg },
      { name: "Container Border", hex: "#1C3648", color: COLORS.border },
      { name: "Primary Teal", hex: "#14D9B5", color: COLORS.primaryTeal },
      { name: "Cyan Accent", hex: "#31C5F4", color: COLORS.cyanAccent },
      { name: "Secondary Indigo", hex: "#7C73FF", color: COLORS.indigoAccent },
      { name: "Success / Validated", hex: "#2DD4A7", color: COLORS.success },
      { name: "Warning / Needs Review", hex: "#F4BC58", color: COLORS.warning },
      { name: "Danger / Contradiction", hex: "#FB7185", color: COLORS.danger },
    ];

    colorEntries.forEach((c, idx) => {
      const colX = 80 + (idx % 4) * 360;
      const colY = 140 + Math.floor(idx / 4) * 110;

      const swatch = figma.createRectangle();
      swatch.resize(60, 60);
      swatch.x = colX;
      swatch.y = colY;
      swatch.cornerRadius = 8;
      swatch.fills = [{ type: 'SOLID', color: c.color }];
      swatch.strokes = [{ type: 'SOLID', color: COLORS.border }];
      swatch.strokeWeight = 1;
      tokensFrame.appendChild(swatch);

      const nameLabel = createText(c.name, 13, "Semi Bold", COLORS.textPrimary);
      nameLabel.x = colX + 76;
      nameLabel.y = colY + 10;
      tokensFrame.appendChild(nameLabel);

      const hexLabel = createText(c.hex, 11, "Regular", COLORS.textSecondary);
      hexLabel.x = colX + 76;
      hexLabel.y = colY + 32;
      tokensFrame.appendChild(hexLabel);
    });

    pages[1].appendChild(tokensFrame);

    // ==========================================
    // PAGE 03: SCREEN 1 - DASHBOARD (DARK & LIGHT)
    // ==========================================
    figma.currentPage = pages[3];
    const dashDark = createScreenFrame("Dashboard — Screen 1 (Dark Mode)", false);
    dashDark.x = 0; dashDark.y = 0;

    // Add Hero Banner to Dashboard
    const heroCard = createCard(1140, 200, COLORS.surfaceBg, COLORS.border, 12);
    heroCard.x = 264; heroCard.y = 88;
    const heroH1 = createText("ReThera AI Research Prioritization", 22, "Bold", COLORS.textPrimary);
    heroH1.x = 32; heroH1.y = 32;
    heroCard.appendChild(heroH1);
    const heroP = createText("Computational drug repurposing, biomedical knowledge graphs, and live scientific evidence monitoring.", 13, "Regular", COLORS.textSecondary);
    heroP.x = 32; heroP.y = 66;
    heroCard.appendChild(heroP);

    // Action button
    const cta = createCard(180, 40, COLORS.primaryTeal, COLORS.primaryTeal, 6);
    cta.x = 32; cta.y = 110;
    const ctaT = createText("+ New Investigation", 12, "Bold", COLORS.darkBg);
    ctaT.x = 24; ctaT.y = 12;
    cta.appendChild(ctaT);
    heroCard.appendChild(cta);

    dashDark.appendChild(heroCard);

    // 4 Workflow Cards
    const workflows = [
      { title: "Drug Repurposing", desc: "Prioritize candidates across multi-factor heuristics" },
      { title: "Knowledge Graph", desc: "Direct and multi-hop biological associations" },
      { title: "Live Monitor", desc: "TinyFish real-time unstructured web extraction" },
      { title: "Research Dossier", desc: "Auditable synthesis with contradiction review" }
    ];

    workflows.forEach((wf, wIdx) => {
      const wCard = createCard(270, 140, COLORS.surfaceBg, COLORS.border, 10);
      wCard.x = 264 + wIdx * 290;
      wCard.y = 308;
      const t = createText(wf.title, 14, "Bold", COLORS.cyanAccent);
      t.x = 20; t.y = 24;
      wCard.appendChild(t);
      const d = createText(wf.desc, 11, "Regular", COLORS.textSecondary);
      d.x = 20; d.y = 56;
      wCard.appendChild(d);
      dashDark.appendChild(wCard);
    });

    pages[3].appendChild(dashDark);

    // Light Mode frame side by side
    const dashLight = createScreenFrame("Dashboard — Screen 1 (Light Mode)", true);
    dashLight.x = 1520; dashLight.y = 0;
    pages[3].appendChild(dashLight);

    // ==========================================
    // PAGE 05: SCREEN 3 - REPURPOSING WORKBENCH
    // ==========================================
    figma.currentPage = pages[5];
    const wbDark = createScreenFrame("Repurposing Workbench — Screen 3", false);
    wbDark.x = 0; wbDark.y = 0;

    const filterRow = createCard(1140, 52, COLORS.surfaceBg, COLORS.border, 8);
    filterRow.x = 264; filterRow.y = 88;
    const fText = createText("Disease: Breast Cancer (MONDO:0004980)  |  Target: ESR1 (P03372)  |  Total Ranked: 249 Candidates", 12, "Medium", COLORS.textSecondary);
    fText.x = 20; fText.y = 18;
    filterRow.appendChild(fText);
    wbDark.appendChild(filterRow);

    // Candidates Table
    const tableCard = createCard(1140, 780, COLORS.surfaceBg, COLORS.border, 12);
    tableCard.x = 264; tableCard.y = 156;
    
    // Header Row
    const tHeader = createText("Rank   Candidate        Indication              Target   Priority Score   Evidence   Contradiction   Action", 11, "Semi Bold", COLORS.cyanAccent);
    tHeader.x = 24; tHeader.y = 20;
    tableCard.appendChild(tHeader);

    // Sample Rows
    const candidates = [
      { rank: "#1", name: "Tamoxifen", ind: "Breast Cancer (ER+)", target: "ESR1", score: "0.92", ev: "59 recs", contra: "2 Found" },
      { rank: "#2", name: "Metformin", ind: "Type 2 Diabetes", target: "AMPK/mTOR", score: "0.87", ev: "42 recs", contra: "0 Found" },
      { rank: "#3", name: "Rapamycin", ind: "Immunosuppression", target: "MTOR", score: "0.83", ev: "38 recs", contra: "1 Found" },
      { rank: "#4", name: "Aspirin", ind: "Analgesic/Anti-inflam.", target: "PTGS1/2", score: "0.79", ev: "31 recs", contra: "1 Found" },
      { rank: "#5", name: "Simvastatin", ind: "Hypercholesterolemia", target: "HMGCR", score: "0.76", ev: "24 recs", contra: "0 Found" },
      { rank: "#6", name: "Itraconazole", ind: "Antifungal", target: "CYP51A1/Hh", score: "0.74", ev: "22 recs", contra: "1 Found" },
      { rank: "#7", name: "Sildenafil", ind: "Pulmonary Arterial Hyp.", target: "PDE5A", score: "0.71", ev: "19 recs", contra: "0 Found" },
      { rank: "#8", name: "Doxycycline", ind: "Antibacterial", target: "MMP-9/Ribosome", score: "0.68", ev: "16 recs", contra: "0 Found" },
    ];

    candidates.forEach((cand, cIdx) => {
      const rowY = 60 + cIdx * 76;
      const divider = figma.createLine();
      divider.x = 24; divider.y = rowY - 10;
      divider.resize(1092, 0);
      divider.strokes = [{ type: 'SOLID', color: COLORS.border }];
      divider.strokeWeight = 1;
      tableCard.appendChild(divider);

      const rT = createText(`${cand.rank}      ${cand.name.padEnd(16)} ${cand.ind.padEnd(24)} ${cand.target.padEnd(8)} ${cand.score}             ${cand.ev}     ${cand.contra}`, 12, "Regular", COLORS.textPrimary);
      rT.x = 24; rT.y = rowY;
      tableCard.appendChild(rT);
    });

    wbDark.appendChild(tableCard);
    pages[5].appendChild(wbDark);

    // ==========================================
    // PAGE 06: SCREEN 4 - CANDIDATE DETAILS
    // ==========================================
    figma.currentPage = pages[6];
    const cdDark = createScreenFrame("Candidate Details — Tamoxifen Case Study", false);
    cdDark.x = 0; cdDark.y = 0;

    // Header Card
    const cHead = createCard(1140, 110, COLORS.surfaceBg, COLORS.border, 12);
    cHead.x = 264; cHead.y = 88;
    const cName = createText("Tamoxifen (CHEMBL83 • PubChem CID 2733527)", 20, "Bold", COLORS.textPrimary);
    cName.x = 24; cName.y = 24;
    cHead.appendChild(cName);

    const cInd = createText("Primary Indication: Breast Cancer (ER+) • Target: ESR1 (P03372) • Priority Score: 0.92 (High Priority)", 12, "Regular", COLORS.textSecondary);
    cInd.x = 24; cInd.y = 56;
    cHead.appendChild(cInd);
    cdDark.appendChild(cHead);

    // Left Column: 3D Molecular Viewer & Physicochemical Card
    const molCard = createCard(550, 420, COLORS.surfaceBg, COLORS.border, 12);
    molCard.x = 264; molCard.y = 216;
    const molT = createText("3D Molecular Structure & Chemical Identity", 14, "Bold", COLORS.cyanAccent);
    molT.x = 24; molT.y = 24;
    molCard.appendChild(molT);
    const smiles = createText("SMILES: CC/C(=C(\\c1ccccc1)/c1ccc(OCCN(C)C)cc1)/c1ccccc1", 10, "Regular", COLORS.textSecondary);
    smiles.x = 24; smiles.y = 56;
    molCard.appendChild(smiles);
    cdDark.appendChild(molCard);

    // Right Column: Contradiction Engine & Uncertainty Card
    const contraCard = createCard(570, 420, COLORS.surfaceBg, COLORS.border, 12);
    contraCard.x = 834; contraCard.y = 216;
    const contraT = createText("Contradiction Engine & Resistance Alerts (2 Active)", 14, "Bold", COLORS.danger);
    contraT.x = 24; contraT.y = 24;
    contraCard.appendChild(contraT);

    const c1 = createText("1. ESR1 Y537S / D538G Activating Mutations:\nConfer ligand-independent constitutive activation, significantly reducing Tamoxifen response in metastatic ER+ settings.", 11, "Regular", COLORS.textPrimary);
    c1.x = 24; c1.y = 66;
    contraCard.appendChild(c1);

    const c2 = createText("2. CYP2D6 Poor Metabolizer Deficit:\nImpaired conversion to high-affinity active metabolite Endoxifen (4-OH-N-desmethyltamoxifen) in patients with *4/*4 alleles.", 11, "Regular", COLORS.textPrimary);
    c2.x = 24; c2.y = 140;
    contraCard.appendChild(c2);

    cdDark.appendChild(contraCard);
    pages[6].appendChild(cdDark);

    // ==========================================
    // PAGE 07: SCREEN 5 - KNOWLEDGE GRAPH EXPLORER
    // ==========================================
    figma.currentPage = pages[7];
    const kgDark = createScreenFrame("Knowledge Graph Explorer — Screen 5", false);
    kgDark.x = 0; kgDark.y = 0;

    const graphArea = createCard(1140, 840, COLORS.surfaceBg, COLORS.border, 12);
    graphArea.x = 264; graphArea.y = 88;
    const kgTitle = createText("Biomedical Knowledge Graph: Tamoxifen (CHEMBL83) ↔ ESR1 Pathway", 16, "Bold", COLORS.primaryTeal);
    kgTitle.x = 28; kgTitle.y = 28;
    graphArea.appendChild(kgTitle);

    // Graph nodes mock
    const nodes = [
      { name: "Tamoxifen", type: "Drug", x: 400, y: 350, color: COLORS.primaryTeal },
      { name: "ESR1", type: "Target", x: 600, y: 220, color: COLORS.cyanAccent },
      { name: "Breast Cancer", type: "Disease", x: 800, y: 350, color: COLORS.danger },
      { name: "PGR", type: "Target", x: 600, y: 480, color: COLORS.cyanAccent },
      { name: "Endoxifen", type: "Metabolite", x: 240, y: 350, color: COLORS.indigoAccent },
    ];

    nodes.forEach(n => {
      const circle = figma.createEllipse();
      circle.resize(64, 64);
      circle.x = n.x; circle.y = n.y;
      circle.fills = [{ type: 'SOLID', color: COLORS.elevatedBg }];
      circle.strokes = [{ type: 'SOLID', color: n.color }];
      circle.strokeWeight = 2;
      graphArea.appendChild(circle);

      const label = createText(n.name, 11, "Semi Bold", COLORS.textPrimary);
      label.x = n.x + 8; label.y = n.y + 24;
      graphArea.appendChild(label);
    });

    kgDark.appendChild(graphArea);
    pages[7].appendChild(kgDark);

    // ==========================================
    // PAGE 09: SCREEN 7 - LIVE EVIDENCE MONITOR
    // ==========================================
    figma.currentPage = pages[9];
    const emDark = createScreenFrame("Live Evidence Monitor (TinyFish Search & Fetch)", false);
    emDark.x = 0; emDark.y = 0;

    const tfCard = createCard(1140, 840, COLORS.surfaceBg, COLORS.border, 12);
    tfCard.x = 264; tfCard.y = 88;
    const tfTitle = createText("TinyFish Search & Fetch — Live Unstructured Web Discovery Stream", 16, "Bold", COLORS.primaryTeal);
    tfTitle.x = 28; tfTitle.y = 28;
    tfCard.appendChild(tfTitle);

    const tfQuery = createText("Active Query: 'Tamoxifen' AND 'ESR1 Y537S mutation' AND 'metastatic breast cancer recurrence 2026'", 11, "Regular", COLORS.textSecondary);
    tfQuery.x = 28; tfQuery.y = 60;
    tfCard.appendChild(tfQuery);

    emDark.appendChild(tfCard);
    pages[9].appendChild(emDark);

    // ==========================================
    // PAGE 10: SCREEN 8-10 - DOSSIER & REPORTS
    // ==========================================
    figma.currentPage = pages[10];
    const dosDark = createScreenFrame("Research Dossier — Screen 9", false);
    dosDark.x = 0; dosDark.y = 0;
    pages[10].appendChild(dosDark);

    // ==========================================
    // PAGE 11: SCREEN 11-13 - SETTINGS & DISCOVER
    // ==========================================
    figma.currentPage = pages[11];
    const discDark = createScreenFrame("ReThera Discover (De Novo Preview) — Screen 13", false);
    discDark.x = 0; discDark.y = 0;
    pages[11].appendChild(discDark);

    // Finish and notify UI
    figma.ui.postMessage({ type: 'complete' });
    figma.notify("✓ Successfully generated ReThera AI 12-page design system and screen hierarchy!");
  }
};
