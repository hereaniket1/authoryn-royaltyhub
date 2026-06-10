  const ROYALTY_TABLE_COLUMNS = [
    { key: "id", label: "ID" },
    { key: "source_platform", label: "Source" },
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "asin_isbn", label: "ASIN / ISBN" },
    { key: "marketplace", label: "Marketplace" },
    { key: "country_code", label: "Country" },
    { key: "units_sold", label: "Units Sold" },
    { key: "units_refunded", label: "Units Refunded" },
    { key: "net_units_sold", label: "Net Units Sold / KENP" },
    { key: "royalty_type", label: "Royalty Type" },
    { key: "payout_plan", label: "Payout Plan" },
    { key: "currency", label: "Currency" },
    { key: "avg_list_price_without_tax", label: "Avg. List Price (No Tax)" },
    { key: "avg_offer_price_without_tax", label: "Avg. Offer Price (No Tax)" },
    { key: "avg_file_size_mb", label: "Avg. File Size (MB)" },
    { key: "avg_delivery_manufacturing_cost", label: "Avg. Delivery / Manufacturing Cost" },
    { key: "earnings", label: "Earnings" },
    { key: "base_currency", label: "Base Currency" },
    { key: "earnings_in_base_currency", label: "Earnings in Base Currency" },
    { key: "fx_rate", label: "FX Rate" },
    { key: "created_at", label: "Created At" },
    { key: "updated_at", label: "Updated At" }
  ];

  const REPORTING_TABLE_COLUMNS = [
    { key: "id", label: "ID" },
    { key: "source_platform", label: "Source" },
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "product_id", label: "Product ID" },
    { key: "marketplace", label: "Marketplace" },
    { key: "country_code", label: "Country" },
    { key: "units_sold", label: "Units Sold" },
    { key: "units_refunded", label: "Units Refunded" },
    { key: "royalty_type", label: "Royalty Type" },
    { key: "payout_plan", label: "Payout Plan" },
    { key: "net_units_sold", label: "Net Units Sold / KENP" },
    { key: "currency", label: "Currency" },
    { key: "base_currency", label: "Base Currency" },
    { key: "earnings", label: "Earnings" },
    { key: "earnings_in_base_currency", label: "Earnings in Base Currency" },
    { key: "avg_list_price_without_tax", label: "Avg. List Price (No Tax)" },
    { key: "avg_offer_price_without_tax", label: "Avg. Offer Price (No Tax)" },
    { key: "avg_file_size_mb", label: "Avg. File Size (MB)" },
    { key: "avg_delivery_manufacturing_cost", label: "Avg. Delivery / Manufacturing Cost" }
  ];



  const reportingFilters = [
    "report_month",
    "source_platform",
    "normalized_title",
    "marketplace",
    "country_code",
    "currency"
  ];

  const landingPage = document.getElementById("landingPage");
  const aiPage = document.getElementById("aiPage");
  const settingsPage = document.getElementById("settingsPage");
  const dashboardPage = document.getElementById("dashboardPage");
  const reportingPage = document.getElementById("reportingPage");
  const homeDashboard = document.getElementById("homeDashboard");
  const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
  const appShell = document.querySelector(".app-shell");
  const authGate = document.getElementById("authGate");
  const authGateSettings = document.getElementById("authGateSettings");
  const settingsResultsCard = document.getElementById("settingsResultsCard");
  const settingsResults = document.getElementById("settingsResults");
  const pageLoading = document.getElementById("pageLoading");
  const pageLoadingText = document.getElementById("pageLoadingText");
  const chatArea = document.getElementById("chatArea");
  const composerWrap = document.getElementById("composerWrap");
  const queryEl = document.getElementById("query");
  const composer = document.getElementById("composer");
  const sendBtn = document.getElementById("sendBtn");
  const attachFileBtn = document.getElementById("attachFileBtn");
  const fileInput = document.getElementById("fileInput");
  const filePill = document.getElementById("filePill");
  const fileName = document.getElementById("fileName");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const loginBtn = document.getElementById("loginBtn");
  const gateLoginBtn = document.getElementById("gateLoginBtn");
  const gateLoginBtnSettings = document.getElementById("gateLoginBtnSettings");
  const logoutBtn = document.getElementById("logoutBtn");
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userMenu = document.getElementById("userMenu");
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const welcomeSubtitle = document.getElementById("welcomeSubtitle");
  const welcomeAvatar = document.getElementById("welcomeAvatar");
  const aiAssistanceLink = document.getElementById("aiAssistanceLink");
  const settingsLink = document.getElementById("settingsLink");
  const dashboardLink = document.getElementById("dashboardLink");
  const settingsUploadBtn = document.getElementById("settingsUploadBtn");
  const settingsBulkFileInput = document.getElementById("settingsBulkFileInput");
  const reportingLink = document.getElementById("reportingLink");
  const deleteAllDataBtn = document.getElementById("deleteAllDataBtn");
  const dashboardRangeSelect = document.getElementById("dashboardRangeSelect");
  const dashboardTotalRoyalties = document.getElementById("dashboardTotalRoyalties");
  const dashboardTotalRoyaltiesDelta = document.getElementById("dashboardTotalRoyaltiesDelta");
  const dashboardTotalUnitsSold = document.getElementById("dashboardTotalUnitsSold");
  const dashboardTotalUnitsSoldDelta = document.getElementById("dashboardTotalUnitsSoldDelta");
  const dashboardTotalTitlesSold = document.getElementById("dashboardTotalTitlesSold");
  const dashboardTotalTitlesSoldDelta = document.getElementById("dashboardTotalTitlesSoldDelta");
  const dashboardAverageRoyaltyPerUnit = document.getElementById("dashboardAverageRoyaltyPerUnit");
  const dashboardAverageRoyaltyPerUnitDelta = document.getElementById("dashboardAverageRoyaltyPerUnitDelta");
  const dashboardCustomRange = document.getElementById("dashboardCustomRange");
  const dashboardCustomFrom = document.getElementById("dashboardCustomFrom");
  const dashboardCustomTo = document.getElementById("dashboardCustomTo");
  const dashboardChartsRoot = dashboardPage ? dashboardPage.querySelector(".dashboard-grid-feature") : null;
  const dashboardTertiaryRoot = dashboardPage ? dashboardPage.querySelector(".dashboard-grid-tertiary") : null;
  const salesCountryPanel = dashboardChartsRoot ? dashboardChartsRoot.querySelector(".sales-country-panel") : null;
  const salesCountryChart = dashboardChartsRoot ? dashboardChartsRoot.querySelector(".sales-country-panel .country-viz") : null;
  const royaltiesOverTimeChart = dashboardChartsRoot ? dashboardChartsRoot.querySelector(".chart-panel .line-chart") : null;
  const royaltiesByFormatPanel = dashboardChartsRoot ? dashboardChartsRoot.querySelector(".format-panel") : null;
  const topBooksPanel = dashboardTertiaryRoot ? dashboardTertiaryRoot.querySelector(".books-panel") : null;
  const insightsPanel = dashboardTertiaryRoot ? dashboardTertiaryRoot.querySelector(".insights-panel") : null;
  const recordOverlay = document.getElementById("recordOverlay");
  const recordOverlayTitle = document.getElementById("recordOverlayTitle");
  const recordOverlayContent = document.getElementById("recordOverlayContent");
  const closeRecordOverlayBtn = document.getElementById("closeRecordOverlayBtn");
  const cancelRecordBtn = document.getElementById("cancelRecordBtn");
  const deleteRecordBtn = document.getElementById("deleteRecordBtn");

  let draggedFile = null;
  let currentUser = null;
  let reportingPageNo = 1;
  let reportingTotalPages = 1;
  let reportingSortColumn = "";
  let reportingSortDirection = "asc";
  let activeRecordId = null;
  let pendingUploadTarget = "home";
  let lastAnalyticsPlan = null;
  let dashboardSummary = null;
  let activeRoyaltiesPointIndex = null;

  function isReportingRoute(){
    return window.location.pathname === "/reporting";
  }

  function isDashboardRoute(){
    return window.location.pathname === "/dashboard";
  }

  function isAIRoute(){
    return window.location.pathname === "/ai-assistance";
  }

  function isSettingsRoute(){
    return window.location.pathname === "/settings";
  }

  function closeMobileSidebar(){
    if(appShell){
      appShell.classList.remove("sidebar-open");
    }
  }

  function setPageLoading(active, text){
    if(!pageLoading) return;
    pageLoading.classList.toggle("hidden", !active);
    if(pageLoadingText && text){
      pageLoadingText.innerText = text;
    }
  }

  function renderSettingsMessage(message, type = "success"){
    if(!settingsResults) return;
    const safeMessage = escapeHtml(message || "");
    settingsResults.innerHTML = `<div class="result-note result-${type === "warning" ? "warning" : "success"}"><pre style="white-space:pre-wrap;margin:0;">${safeMessage}</pre></div>`;
    if(settingsResultsCard){
      settingsResultsCard.classList.remove("hidden");
    }
  }

  function renderSettingsBulkResult({ processed = 0, inserted = 0, duplicates = [], errors = [] } = {}){
    if(!settingsResults) return;

    const duplicateMarkup = duplicates.length
      ? `<div class="settings-result-group">
          <div class="settings-result-group-title">Already present</div>
          <ul class="settings-result-list">
            ${duplicates.map(item => {
              const month = item.results && item.results.report_month ? item.results.report_month : "unknown month";
              return `<li><strong>${escapeHtml(item.file_name || "Unnamed file")}</strong><span>${escapeHtml(month)} already exists.</span></li>`;
            }).join("")}
          </ul>
        </div>`
      : "";

    const errorMarkup = errors.length
      ? `<div class="settings-result-group">
          <div class="settings-result-group-title">Errors</div>
          <ul class="settings-result-list">
            ${errors.map(item => `<li><strong>${escapeHtml(item.file_name || "Unnamed file")}</strong><span>${escapeHtml(item.error || "Unknown error")}</span></li>`).join("")}
          </ul>
        </div>`
      : "";

    const summaryTone = errors.length ? "warning" : (duplicates.length ? "warning" : "success");
    const summaryMessage = errors.length
      ? "Some files could not be uploaded."
      : (duplicates.length ? "Upload finished, with some files already present." : "All files uploaded successfully.");

    settingsResults.innerHTML = `
      <div class="result-note result-${summaryTone}">
        <div class="settings-result-summary">
          <div class="settings-result-summary-title">${escapeHtml(summaryMessage)}</div>
          <div class="settings-result-summary-meta">
            <span>Processed ${processed} file(s)</span>
            <span>Inserted ${inserted}</span>
            <span>Already present ${duplicates.length}</span>
            <span>Errors ${errors.length}</span>
          </div>
        </div>
      </div>
      ${duplicateMarkup}
      ${errorMarkup}
    `;

    if(settingsResultsCard){
      settingsResultsCard.classList.remove("hidden");
    }
  }

  function updateAuthUI(){
    const isAuthenticated = Boolean(currentUser);

    reportingLink.classList.toggle("hidden", !isAuthenticated);
    dashboardLink.classList.toggle("hidden", !isAuthenticated);
    homeDashboard.classList.remove("hidden");
    authGate.classList.toggle("hidden", isAuthenticated);
    authGateSettings.classList.toggle("hidden", isAuthenticated);
    if(settingsResultsCard){
      settingsResultsCard.classList.toggle("hidden", !isAuthenticated || !settingsResults.children.length);
    }
    composerWrap.classList.toggle("hidden", !isAuthenticated || !isAIRoute());
    chatArea.classList.toggle("hidden", !isAuthenticated || !isAIRoute());

    if(isAuthenticated){
      const displayName = currentUser.full_name || currentUser.name || currentUser.email || "there";
      const displayEmail = currentUser.email || "Signed in";
      userName.innerText = displayName;
      userEmail.innerText = displayEmail;
      userAvatar.innerText = (displayName || "U").trim().slice(0, 1).toUpperCase();
      welcomeTitle.innerText = `Welcome back, ${displayName}`;
      welcomeSubtitle.innerText = "Here's what’s happening with your royalties.";
      if(currentUser.avatar_url || currentUser.picture){
        welcomeAvatar.src = currentUser.avatar_url || currentUser.picture;
        welcomeAvatar.classList.remove("hidden");
      } else {
        welcomeAvatar.classList.add("hidden");
      }
      loginBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
      deleteAllDataBtn.classList.remove("hidden");
      if(isDashboardRoute()){
        loadDashboardSummary();
      }
    } else {
      userName.innerText = "Welcome";
      userEmail.innerText = "Please log in";
      userAvatar.innerText = "?";
      welcomeTitle.innerText = "Welcome back";
      welcomeSubtitle.innerText = "Please log in to view your royalty dashboard.";
      welcomeAvatar.classList.add("hidden");
      loginBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
      deleteAllDataBtn.classList.add("hidden");
      if(settingsResultsCard) settingsResultsCard.classList.add("hidden");
      showFile(null);
      queryEl.value = "";
    }
  }

  function showCorrectPage(){
    closeMobileSidebar();
    landingPage.classList.remove("active");
    aiPage.classList.remove("active");
    settingsPage.classList.remove("active");
    dashboardPage.classList.remove("active");
    reportingPage.classList.remove("active");

    if(isAIRoute()){
      aiPage.classList.add("active");
      return;
    }

    if(isSettingsRoute()){
      settingsPage.classList.add("active");
      return;
    }

    if(isDashboardRoute()){
      setPageLoading(true, "Loading dashboard...");
      dashboardPage.classList.add("active");
      if(currentUser){
        loadDashboardSummary();
      } else {
        setPageLoading(false);
      }
      return;
    }

    if(isReportingRoute()){
      document.body.classList.add("dashboard-view");
      setPageLoading(true, "Loading reports...");
      reportingPage.classList.add("active");
      if(currentUser){
        loadReportingData(1);
      } else {
        setPageLoading(false);
      }
      return;
    }

    document.body.classList.remove("dashboard-view");
    landingPage.classList.add("active");
    if(currentUser){
      setTimeout(() => queryEl && queryEl.focus(), 50);
    }
  }

  function formatCell(value, key){
    if(value === null || value === undefined || value === "") return "—";

    if(typeof value === "object"){
      return JSON.stringify(value, null, 2);
    }

    if(key === "created_at" || key === "updated_at"){
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
    }

    if(key === "report_month"){
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { month: "2-digit", year: "numeric" });
    }

    const numeric = new Set([
      "units_sold", "units_refunded", "net_units_sold",
      "avg_list_price_without_tax", "avg_offer_price_without_tax",
      "avg_file_size_mb", "avg_delivery_manufacturing_cost",
      "earnings", "earnings_in_base_currency", "fx_rate",
      "royalty_rate", "payee_split", "net_sales"
    ]);

    if(numeric.has(key)){
      const n = Number(value);
      return Number.isNaN(n) ? String(value) : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }

    return String(value);
  }

  function renderTable(records, title, meta){
    if(!records || records.length === 0){
      return `
        <div class="table-card">
          <div class="table-toolbar">
            <span class="table-title">${title || "Records"}</span>
            <span class="table-meta">${meta || ""}</span>
          </div>
          <div style="padding:16px;color:#6b7280;">No records found.</div>
        </div>`;
    }

    return `
      <div class="table-card">
        <div class="table-toolbar">
          <span class="table-title">${title || "Records"}</span>
          <span class="table-meta">${meta || records.length + " records"}</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>${ROYALTY_TABLE_COLUMNS.map(c => `<th>${c.label}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${records.map(row => `
                <tr>${ROYALTY_TABLE_COLUMNS.map(c => `<td>${formatCell(row[c.key], c.key)}</td>`).join("")}</tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>`;
  }


  function humanizeDynamicColumn(key){
    const labels = {
      id: "ID",
      source_platform: "Source",
      product_id: "Product ID",
      provider_product_id: "Provider Product ID",
      royalty_earner: "Royalty Earner",
      title: "Title",
      author: "Author",
      asin_isbn: "ASIN / ISBN",
      marketplace: "Marketplace",
      country_code: "Country",
      units_sold: "Units Sold",
      units_refunded: "Units Refunded",
      net_units_sold: "Net Units Sold / KENP",
      royalty_type: "Royalty Type",
      payout_plan: "Payout Plan",
      transaction_type: "Transaction Type",
      purchase_type: "Purchase Type",
      offer: "Offer",
      royalty_rule: "Royalty Rule",
      currency: "Currency",
      royalty_rate: "Royalty Rate",
      payee_split: "Payee Split",
      net_sales: "Net Sales",
      avg_list_price_without_tax: "Avg. List Price (No Tax)",
      avg_offer_price_without_tax: "Avg. Offer Price (No Tax)",
      avg_file_size_mb: "Avg. File Size (MB)",
      avg_delivery_manufacturing_cost: "Avg. Delivery / Manufacturing Cost",
      earnings: "Earnings",
      base_currency: "Base Currency",
      earnings_in_base_currency: "Earnings in Base Currency",
      fx_rate: "FX Rate",
      report_month: "Report Month",
      created_at: "Created At",
      updated_at: "Updated At"
    };

    return labels[key] || String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function formatDynamicCell(value, key){
    if(value === null || value === undefined || value === "") return "—";

    if(typeof value === "object"){
      return JSON.stringify(value, null, 2);
    }

    if(key === "created_at" || key === "updated_at"){
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
    }

    if(key === "report_month"){
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { month: "2-digit", year: "numeric" });
    }

    const numericKeys = new Set([
      "units_sold", "units_refunded", "net_units_sold",
      "avg_list_price_without_tax", "avg_offer_price_without_tax",
      "avg_file_size_mb", "avg_delivery_manufacturing_cost",
      "earnings", "earnings_in_base_currency", "fx_rate",
      "royalty_rate", "payee_split", "net_sales"
    ]);

    if(numericKeys.has(key)){
      const n = Number(value);
      return Number.isNaN(n) ? String(value) : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }

    return String(value);
  }

  function renderDynamicResultTable(records, title, meta){
    if(!records || records.length === 0){
      return `
        <div class="table-card">
          <div class="table-toolbar">
            <span class="table-title">${title || "Records"}</span>
            <span class="table-meta">${meta || ""}</span>
          </div>
          <div style="padding:16px;color:#6b7280;">No records found.</div>
        </div>`;
    }

    const keys = [];
    records.forEach(row => {
      Object.keys(row || {}).forEach(key => {
        if(!keys.includes(key)) keys.push(key);
      });
    });

    return `
      <div class="table-card">
        <div class="table-toolbar">
          <span class="table-title">${title || "Records"}</span>
          <span class="table-meta">${meta || records.length + " records"}</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>${keys.map(key => `<th>${humanizeDynamicColumn(key)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${records.map(row => `
                <tr>${keys.map(key => `<td>${formatDynamicCell(row[key], key)}</td>`).join("")}</tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function detectAnalyticsValueKey(records, preferredKey){
    const candidateKeys = [
      preferredKey,
      "earnings",
      "units_sold",
      "units_refunded",
      "net_units_sold",
      "change_amount",
      "metric_value",
      "current_metric_value"
    ].filter(Boolean);

    for(const key of candidateKeys){
      if(records.some(row => row && row[key] !== undefined && row[key] !== null)){
        return key;
      }
    }

    for(const row of records){
      for(const [key, value] of Object.entries(row || {})){
        if(typeof value === "number" || (value !== "" && !Number.isNaN(Number(value)))){
          return key;
        }
      }
    }

    return null;
  }

  function renderAnalyticsCharts(records, plan){
    if(!records || records.length === 0) return "";

    const valueKey = detectAnalyticsValueKey(records, plan && plan.metric);
    const chartRows = records.slice(0, 6).map((row, index) => {
      const label = row.title || row.author || row.marketplace || row.country || row.country_code || row.source_platform || row.report_month || `Item ${index + 1}`;
      const value = Number(row && valueKey ? row[valueKey] : 0) || 0;
      return { label: String(label), value };
    });

    const maxValue = Math.max(...chartRows.map(item => item.value), 1);
    const totalValue = chartRows.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#6d3df4", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    let offset = 0;
    const donutSegments = chartRows
      .filter(item => item.value > 0)
      .map((item, idx) => {
        const start = offset;
        offset += (item.value / (totalValue || 1)) * 100;
        const end = offset;
        return `${colors[idx % colors.length]} ${start}% ${end}%`;
      })
      .join(", ");

    return `
      <div class="analytics-charts">
        <div class="chart-card chart-card-bar">
          <div class="chart-card-header">
            <span class="chart-card-title">Top ${valueKey ? humanizeDynamicColumn(valueKey) : "Values"}</span>
            <span class="chart-card-meta">${chartRows.length} items</span>
          </div>
          <div class="bar-chart">
            ${chartRows.map((item, idx) => `
              <div class="bar-row">
                <span class="bar-label">${escapeHtml(item.label)}</span>
                <div class="bar-track"><i style="width:${(item.value / maxValue) * 100}%"></i></div>
                <span class="bar-value">${escapeHtml(formatDynamicCell(item.value, valueKey || "metric"))}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="chart-card chart-card-donut">
          <div class="chart-card-header">
            <span class="chart-card-title">Distribution</span>
            <span class="chart-card-meta">${valueKey ? humanizeDynamicColumn(valueKey) : "Grouped share"}</span>
          </div>
          <div class="donut-visual" style="background: conic-gradient(${donutSegments || "#6d3df4 0% 100%"});">
            <div>
              <strong>${escapeHtml(formatDynamicCell(totalValue, valueKey || "metric"))}</strong>
              <span>Total</span>
            </div>
          </div>
          <div class="donut-legend">
            ${chartRows.filter(item => item.value > 0).map((item, idx) => `
              <div>
                <span class="dot ${["purple","blue","green","orange","red","violet"][idx % 6]}"></span>
                <strong>${escapeHtml(item.label)}</strong>
                <b>${escapeHtml(formatDynamicCell(item.value, valueKey || "metric"))}</b>
              </div>
            `).join("")}
          </div>
        </div>
      </div>`;
  }

  function appendDynamicResultBlock({message, type, records, title, meta}){
    appendResultTarget(chatArea, {message, type, records, title, meta}, true);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function addMessage(text, type){
    const div = document.createElement("div");
    div.className = "message " + type;
    div.innerText = text;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function appendResultBlock({message, type, records, title, meta}){
    appendResultTarget(chatArea, {message, type, records, title, meta}, false);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function appendResultTarget(target, {message, type, records, title, meta}, isDynamic){
    const block = document.createElement("div");
    block.className = "result-block";

    let html = "";
    if(message){
      html += `<div class="result-note ${type === "success" ? "result-success" : "result-warning"}">${message}</div>`;
    }
    if(records){
      if(isDynamic){
        html += renderAnalyticsCharts(records, lastAnalyticsPlan);
      }
      html += isDynamic
        ? renderDynamicResultTable(records, title, meta)
        : renderTable(records, title, meta);
    }

    block.innerHTML = html;
    target.appendChild(block);
  }

  function getUploadData(response){
    if(!response) return null;
    if(response.results && response.results.data) return response.results.data;
    if(response.results) return response.results;
    if(response.data) return response.data;
    return response;
  }

  function getAIContent(data){
    if(!data) return "No AI response returned.";
    const payload = data.results || data;
    if(payload && typeof payload === "object"){
      if(payload.answer) return payload.answer;
      if(payload.message) return payload.message;
      if(payload.content) return payload.content;
      if(payload.choices && payload.choices[0] && payload.choices[0].message){
        return payload.choices[0].message.content || "No AI response returned.";
      }
    }
    if(data.choices && data.choices[0] && data.choices[0].message){
      return data.choices[0].message.content || "No AI response returned.";
    }
    if(data.answer) return data.answer;
    if(data.content) return data.content;
    if(data.message) return data.message;
    return JSON.stringify(data, null, 2);
  }

  function showFile(file){
    draggedFile = file;
    if(file){
      fileName.innerText = file.name;
      filePill.style.display = "flex";
    } else {
      fileName.innerText = "";
      filePill.style.display = "none";
    }
    if(currentUser) queryEl.focus();
  }

  async function checkAuth(){
    try {
      const res = await fetch("/auth/me");
      const data = await res.json();

      if(data.authenticated){
        currentUser = data.user;
      } else {
        currentUser = null;
      }
    } catch(e) {
      currentUser = null;
    }

    updateAuthUI();
  }

  function openLogin(nextUrl){
    const url = `/auth/google/login?popup=true&next=${encodeURIComponent(nextUrl || window.location.pathname || "/")}`;
    const popup = window.open(url, "royalty_hub_google_login", "width=520,height=680");
    if(!popup){
      window.location.href = url.replace("popup=true&", "");
    }
  }

  window.addEventListener("message", async (event) => {
    if(event.data && event.data.type === "oauth_success"){
      await checkAuth();
      showCorrectPage();
      if(currentUser && !isReportingRoute() && chatArea.children.length === 0) {
        addMessage("Welcome to The Royalty Hub. Ask me about royalty performance, or upload a KDP or ACX royalty statement.", "assistant");
      }
    }
  });

  loginBtn.addEventListener("click", () => openLogin(window.location.pathname || "/"));
  gateLoginBtn.addEventListener("click", () => openLogin(window.location.pathname || "/"));
  gateLoginBtnSettings.addEventListener("click", () => openLogin("/settings"));
  settingsUploadBtn.addEventListener("click", () => {
    if(settingsBulkFileInput){
      settingsBulkFileInput.value = "";
      settingsBulkFileInput.click();
      return;
    }

    pendingUploadTarget = "settings";
    fileInput.value = "";
    fileInput.click();
  });
  aiAssistanceLink.addEventListener("click", (event) => {
    if(!currentUser){
      event.preventDefault();
      openLogin("/ai-assistance");
    }
  });
  settingsLink.addEventListener("click", (event) => {
    if(!currentUser){
      event.preventDefault();
      openLogin("/settings");
    }
  });
  userMenuBtn.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
    userMenuBtn.setAttribute("aria-expanded", userMenu.classList.contains("hidden") ? "false" : "true");
  });

  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST" });
    await checkAuth();
    window.location.href = "/";
  });

  if(mobileSidebarToggle){
    mobileSidebarToggle.addEventListener("click", () => {
      if(appShell){
        appShell.classList.toggle("sidebar-open");
      }
    });
  }

  document.addEventListener("click", (event) => {
    if(!appShell || !mobileSidebarToggle) return;
    if(window.innerWidth > 980) return;
    if(appShell.classList.contains("sidebar-open")){
      const clickedSidebar = event.target.closest(".app-sidebar");
      const clickedToggle = event.target.closest("#mobileSidebarToggle");
      if(!clickedSidebar && !clickedToggle){
        appShell.classList.remove("sidebar-open");
      }
    }
  });

  deleteAllDataBtn.addEventListener("click", async () => {
    const ok = window.confirm("Delete all your royalty data and your user account? This cannot be undone.");
    if(!ok) return;

    const res = await fetch("/api/me/data", { method: "DELETE" });
    if(!res.ok){
      window.alert("Failed to delete your data.");
      return;
    }

    currentUser = null;
    updateAuthUI();
    window.location.href = "/";
  });

  async function callAIAssistance(query){
    if(!query.trim()) return null;

    addMessage(query, "user");

    const formData = new FormData();
    formData.append("query", query);

    const res = await fetch("/post-query", {
      method: "POST",
      body: formData
    });

    if(!res.ok) throw new Error("AI assistance route failed");

    const data = await res.json();

    const analytics = data && data.status === "ok" &&
      data.results &&
      Array.isArray(data.results.data)
        ? data.results
        : null;

    if(analytics){
      lastAnalyticsPlan = analytics.plan || null;
      appendDynamicResultBlock({
        message: null,
        type: "success",
        records: analytics.data,
        title: analytics.user_query ? `Results for: ${analytics.user_query}` : "Analytics Results",
        meta: `${analytics.data.length} records`
      });
    } else {
      addMessage(getAIContent(data), "assistant");
    }

    return data;
  }

  async function uploadFile(file, options = {}){
    if(!file) return null;
    const target = options.target === "settings" ? settingsResults : chatArea;

    const formData = new FormData();
    formData.append("file", file);

    if(target === settingsResults){
      setPageLoading(true, "Uploading statement...");
      if(settingsResultsCard){
        settingsResultsCard.classList.remove("hidden");
      }
      target.innerHTML = `<div class="result-note">Uploading ${escapeHtml(file.name)}...</div>`;
    }

    if(options.target !== "settings"){
      addMessage("Uploading file: " + file.name, "user");
    }

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: formData
      });

      if(res.status === 401){
        openLogin("/");
        throw new Error("Please login first, then upload again.");
      }

      if(!res.ok){
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || "File upload failed");
      }

      const payload = await res.json();
      const data = getUploadData(payload);

      if(data && data.status === "ALREADY_EXISTS"){
        appendResultTarget(target, {
          message: data.message || `Data already exists for report_month ${data.report_month}. Insert skipped.`,
          type: "warning",
          records: data.sample_records || [],
          title: `Sample records for ${data.report_month}`,
          meta: `${data.existing_record_count || 0} existing records`
        }, false);
        if(target === settingsResults && isReportingRoute()){
          loadReportingMonths().catch(() => {});
        }
        return payload;
      }

      if(data && data.status === "INSERTED"){
        appendResultTarget(target, {
          message: `Data uploaded for ${data.report_month}. Inserted rows: ${data.inserted_rows}.`,
          type: "success"
        }, false);
        if(target === settingsResults && isReportingRoute()){
          loadReportingMonths().catch(() => {});
        }
        return payload;
      }

      appendResultTarget(target, {
        message: "Upload completed.",
        type: "success",
        records: data && data.sample_records ? data.sample_records : null,
        title: "Sample records"
      }, false);

      if(target === settingsResults && isReportingRoute()){
        loadReportingMonths().catch(() => {});
      }

      return payload;
    } catch(error) {
      const message = error && error.message ? error.message : "Upload failed";
      if(target === settingsResults){
        renderSettingsMessage(message, "warning");
      } else {
        addMessage(message, "assistant");
      }
      throw error;
    } finally {
      if(target === settingsResults && settingsResultsCard){
        settingsResultsCard.classList.remove("hidden");
      }
      setPageLoading(false);
    }
  }

  function validateUploadFiles(files){
    const allowed = [];
    const rejected = [];

    (files || []).forEach(file => {
      const name = file && file.name ? file.name : "";
      if(!name.toLowerCase().endsWith(".xlsx")){
        rejected.push(name || "Unnamed file");
        return;
      }
      allowed.push(file);
    });

    return { allowed, rejected };
  }

  async function bulkUploadFiles(files){
    const fileList = Array.from(files || []);
    const { allowed, rejected } = validateUploadFiles(fileList);

    if(rejected.length){
      renderSettingsMessage(
        `Unsupported file type(s): ${rejected.join(", ")}. Please upload .xlsx files only.`,
        "warning"
      );
    }

    if(!allowed.length){
      if(!rejected.length){
        renderSettingsMessage("Please select one or more .xlsx files to upload.", "warning");
      }
      return null;
    }

    setPageLoading(true, "Uploading statements...");
    if(settingsResultsCard){
      settingsResultsCard.classList.remove("hidden");
    }
    settingsResults.innerHTML = `<div class="result-note">Uploading ${allowed.length} file(s)...</div>`;

    try {
      const formData = new FormData();
      allowed.forEach(file => formData.append("files", file));

      const res = await fetch("/upload/bulk", {
        method: "POST",
        body: formData
      });

      if(res.status === 401){
        openLogin("/settings");
        throw new Error("Please login first, then upload again.");
      }

      const payloadText = await res.text();
      let payload = null;
      try {
        payload = payloadText ? JSON.parse(payloadText) : null;
      } catch (parseError) {
        throw new Error(payloadText || "Bulk upload failed");
      }

      if(!res.ok){
        throw new Error((payload && payload.error) || payloadText || "Bulk upload failed");
      }

      const results = payload && Array.isArray(payload.results) ? payload.results : [];
      const inserted = results.filter(item => item.status === "INSERTED").length;
      const duplicates = results.filter(item => item.status === "ALREADY_EXISTS");
      const errorItems = results.filter(item => item.status !== "INSERTED" && item.status !== "ALREADY_EXISTS");
      renderSettingsBulkResult({
        processed: results.length,
        inserted,
        duplicates,
        errors: errorItems.filter(item => item.status !== "ALREADY_EXISTS")
      });

      return payload;
    } catch(error) {
      renderSettingsMessage(error.message || "Bulk upload failed", "warning");
      throw error;
    } finally {
      setPageLoading(false);
    }
  }

  async function handleSubmit(){
    const query = queryEl.value.trim();
    const file = draggedFile;

    if(!query && !file){
      queryEl.focus();
      return;
    }

    queryEl.value = "";
    showFile(null);
    fileInput.value = "";

    try {
      if(query){
        await callAIAssistance(query);
      }

      if(file){
        await uploadFile(file);
      }
    } catch(error) {
      addMessage(error.message || "Request failed", "assistant");
    }

    queryEl.focus();
  }

  sendBtn.addEventListener("click", handleSubmit);

  queryEl.addEventListener("keydown", (event) => {
    if(event.key === "Enter" && !event.shiftKey){
      event.preventDefault();
      handleSubmit();
    }
  });

  ["dragover", "dragenter"].forEach(evt => {
    composer.addEventListener(evt, (event) => {
      event.preventDefault();
      composer.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach(evt => {
    composer.addEventListener(evt, (event) => {
      event.preventDefault();
      composer.classList.remove("drag-over");
    });
  });

  composer.addEventListener("drop", (event) => {
    if(event.dataTransfer.files && event.dataTransfer.files.length > 0){
      showFile(event.dataTransfer.files[0]);
    }
  });

  removeFileBtn.addEventListener("click", () => showFile(null));

  attachFileBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if(fileInput.files && fileInput.files.length > 0){
      const selectedFile = fileInput.files[0];
      if(pendingUploadTarget === "settings"){
        uploadFile(selectedFile, { target: "settings" }).catch(() => {});
        pendingUploadTarget = "home";
        fileInput.value = "";
      } else {
        showFile(selectedFile);
      }
    }
  });

  if(settingsBulkFileInput){
    settingsBulkFileInput.addEventListener("change", () => {
      if(settingsBulkFileInput.files && settingsBulkFileInput.files.length > 0){
        bulkUploadFiles(settingsBulkFileInput.files).catch(() => {});
        settingsBulkFileInput.value = "";
      }
    });
  }

  function renderReportingCell(row, column){
    const value = formatCell(row[column.key], column.key);

    if(column.key === "id"){
      return `<button class="record-id-link" data-record-id="${escapeHtml(row.id)}" type="button">${escapeHtml(value)}</button>`;
    }

    return escapeHtml(value);
  }


  function renderReportingTable(records, title, meta){
    if(!records || records.length === 0){
      return `
        <div class="table-card">
          <div class="table-toolbar">
            <span class="table-title">${title || "Records"}</span>
            <span class="table-meta">${meta || ""}</span>
          </div>
          <div style="padding:16px;color:#6b7280;">No records found.</div>
        </div>`;
    }

    return `
      <div class="table-card">
        <div class="table-toolbar">
          <span class="table-title">${title || "Records"}</span>
          <span class="table-meta">${meta || records.length + " records"}</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                ${REPORTING_TABLE_COLUMNS.map(c => {
                  const active = reportingSortColumn === c.key;
                  const icon = active ? (reportingSortDirection === "asc" ? " ↑" : " ↓") : " ↕";
                  return `<th data-sort-key="${c.key}" style="cursor:pointer;user-select:none;">${c.label}${icon}</th>`;
                }).join("")}
              </tr>
            </thead>
            <tbody>
              ${records.map(row => `
                <tr>${REPORTING_TABLE_COLUMNS.map(c => `<td>${renderReportingCell(row, c)}</td>`).join("")}</tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function attachReportingSortEvents(){
    document.querySelectorAll("#reportingTable th[data-sort-key]").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort-key");

        if(reportingSortColumn === key){
          reportingSortDirection = reportingSortDirection === "asc" ? "desc" : "asc";
        } else {
          reportingSortColumn = key;
          reportingSortDirection = "asc";
        }

        loadReportingData(1);
      });
    });
  }

  function attachReportingRecordEvents(){
    document.querySelectorAll("#reportingTable .record-id-link[data-record-id]").forEach(button => {
      button.addEventListener("click", () => {
        openRecordOverlay(button.getAttribute("data-record-id"));
      });
    });
  }

  function escapeHtml(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDashboardCurrency(value){
    const n = Number(value || 0);
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: (dashboardSummary && dashboardSummary.cards && dashboardSummary.cards.total_royalties && dashboardSummary.cards.total_royalties.base_currency) || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatDashboardNumber(value){
    const n = Number(value || 0);
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function setDashboardDelta(node, metric){
    if(!node || !metric) return;

    const pct = Number(metric.delta_percent || 0);
    const prefix = pct > 0 ? "↑" : pct < 0 ? "↓" : "—";
    const rounded = Math.abs(pct).toFixed(1);
    node.classList.remove("positive", "negative", "neutral");
    node.classList.add(metric.direction || "neutral");
    node.innerText = `${prefix} ${rounded}% vs previous period`;
  }

  function humanizeDashboardLabel(value){
    const text = String(value || "").replace(/_/g, " ").trim();
    return text ? text.replace(/\b\w/g, char => char.toUpperCase()) : "Other";
  }

  function humanizeCountryLabel(value){
    const code = String(value || "").trim().toUpperCase();
    const countryNames = {
      US: "United States",
      GB: "United Kingdom",
      AU: "Australia",
      CA: "Canada",
      DE: "Germany",
      IN: "India",
      JP: "Japan",
      FR: "France",
      IT: "Italy",
      ES: "Spain",
      EU: "Europe",
      OTHER: "Other"
    };

    return countryNames[code] || humanizeDashboardLabel(code);
  }

  function renderDashboardCountryChart(items){
    if(!salesCountryChart) return;

    const rows = Array.isArray(items) ? items : [];
    const max = Math.max(...rows.map(item => Number(item.units_sold || 0)), 1);
    const colors = ["#6d3df4", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#8b5cf6"];

    if(rows.length === 0){
      salesCountryChart.innerHTML = `<div style="padding: 10px 0;color:#6b7280;">No country data available.</div>`;
      return;
    }

    const bars = rows.map((item, idx) => {
      const value = Number(item.units_sold || 0);
      const width = Math.max((value / max) * 100, 4);
      const barColor = colors[idx % colors.length];
      return `
        <div class="country-row">
          <span class="country-label">${escapeHtml(humanizeCountryLabel(item.country_code))}</span>
          <div class="country-track"><i style="width:${width}%; background:${barColor};"></i></div>
          <b>${formatDashboardNumber(value)}</b>
        </div>
      `;
    }).join("");

    salesCountryChart.innerHTML = `<div class="country-list">${bars}</div>`;
  }

  function renderDashboardTimeSeries(items){
    if(!royaltiesOverTimeChart) return;

    const rows = Array.isArray(items) ? items : [];
    if(rows.length === 0){
      activeRoyaltiesPointIndex = null;
      royaltiesOverTimeChart.innerHTML = "";
      return;
    }

    const values = rows.map(item => Number(item.earnings || 0));
    const maxValue = Math.max(...values, 1);
    const points = rows.map((item, idx) => {
      const x = 28 + (idx * (568 / Math.max(rows.length - 1, 1)));
      const y = 204 - ((Number(item.earnings || 0) / maxValue) * 144);
      return { x, y, label: item.period };
    });

    const linePath = points.map((point, idx) => `${idx === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)} 218 L28 218 Z`;
    const defaultIndex = activeRoyaltiesPointIndex !== null && activeRoyaltiesPointIndex >= 0 && activeRoyaltiesPointIndex < rows.length
      ? activeRoyaltiesPointIndex
      : rows.length - 1;
    const activePoint = points[defaultIndex] || points[points.length - 1];
    const activeRow = rows[defaultIndex] || rows[rows.length - 1];
    const tooltipLeft = Math.max(8.5, Math.min((activePoint.x / 620) * 100, 91.5));
    const tooltipTop = Math.max(6, ((activePoint.y - 78) / 260) * 100);
    const labels = rows.map((item, idx) => {
      if(rows.length <= 5) return `<span>${escapeHtml(formatDashboardPeriodLabel(item.period))}</span>`;
      if(idx % Math.ceil(rows.length / 5) !== 0 && idx !== rows.length - 1) return "";
      return `<span>${escapeHtml(formatDashboardPeriodLabel(item.period))}</span>`;
    }).filter(Boolean).join("");

    royaltiesOverTimeChart.innerHTML = `
      <div class="chart-tooltip" style="left:${tooltipLeft.toFixed(1)}%; top:${tooltipTop.toFixed(1)}%;">
        ${escapeHtml(formatDashboardPeriodLabel(activeRow.period))}<br><strong>${formatDashboardCurrency(activeRow.earnings)}</strong>
      </div>
      <svg viewBox="0 0 620 260" role="img" aria-label="Royalties over time chart">
        <defs>
          <linearGradient id="royaltyArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6d3df4" stop-opacity=".26"/>
            <stop offset="100%" stop-color="#6d3df4" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <g class="grid-lines">
          <line x1="28" x2="596" y1="34" y2="34"/>
          <line x1="28" x2="596" y1="90" y2="90"/>
          <line x1="28" x2="596" y1="146" y2="146"/>
          <line x1="28" x2="596" y1="202" y2="202"/>
        </g>
        <path class="area" d="${areaPath}"/>
        <path class="line" d="${linePath}"/>
        ${points.map((point, idx) => `<circle data-royalty-point="${idx}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="6" class="${idx === defaultIndex ? "is-active" : ""}"></circle>`).join("")}
      </svg>
      <div class="chart-axis">${labels}</div>
    `;
  }

  if(royaltiesOverTimeChart){
    royaltiesOverTimeChart.addEventListener("click", (event) => {
      const circle = event.target && event.target.closest ? event.target.closest("circle[data-royalty-point]") : null;
      if(!circle) return;
      const index = Number(circle.getAttribute("data-royalty-point"));
      if(Number.isNaN(index)) return;
      activeRoyaltiesPointIndex = index;
      if(dashboardSummary && dashboardSummary.charts){
        renderDashboardTimeSeries(dashboardSummary.charts.royalties_over_time || []);
      }
    });
  }

  function formatDashboardPeriodLabel(value){
    if(!value) return "";
    const date = new Date(value);
    if(Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }

  function renderDashboardTopBooks(items){
    if(!topBooksPanel) return;

    const rows = Array.isArray(items) ? items : [];
    if(rows.length === 0){
      topBooksPanel.innerHTML = `
        <div class="dashboard-panel-header"><h2>Top Performing Books</h2></div>
        <div style="padding:16px 24px 22px;color:#6b7280;">No books found for this range.</div>
      `;
      return;
    }

    const visibleRows = rows.slice(0, 5);
    const body = visibleRows.map((item, idx) => {
      const change = item.change || {};
      const pct = Number(change.pct || 0);
      const direction = change.direction || "neutral";
      const arrow = direction === "positive" ? "↑" : direction === "negative" ? "↓" : "—";
      const changeClass = direction === "positive" ? "positive" : direction === "negative" ? "negative" : "neutral";
      const title = escapeHtml(item.title || "Untitled");
      const author = escapeHtml(item.author || "Unknown Author");
      const coverClass = ["one", "two", "three", "four", "five"][idx % 5];

      return `
        <tr>
          <td>
            <span class="book-cover ${coverClass}"></span>
            <b title="${title}">${title}</b>
            <small>${author}</small>
          </td>
          <td>${formatDashboardNumber(item.units_sold)}</td>
          <td>${formatDashboardCurrency(item.earnings)}</td>
          <td class="${changeClass}">${arrow} ${Math.abs(pct).toFixed(1)}%</td>
        </tr>
      `;
    }).join("");

    topBooksPanel.innerHTML = `
      <div class="dashboard-panel-header"><h2>Top Performing Books</h2></div>
      <table class="dashboard-books-table">
        <thead>
          <tr><th>Title</th><th>Units Sold</th><th>Royalties</th><th>Change</th></tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
      <a class="dashboard-link" href="/reporting">View all books →</a>
    `;
  }

  function renderDashboardInsights(){
    if(!insightsPanel) return;
    const actionBtn = insightsPanel.querySelector(".wide-outline-btn");
    if(actionBtn){
      actionBtn.onclick = () => window.location.href = "/ai-assistance";
    }
  }

  function renderDashboardSourceChart(items){
    if(!royaltiesByFormatPanel) return;

    const rows = Array.isArray(items) ? items : [];
    const total = rows.reduce((sum, item) => sum + Number(item.earnings || 0), 0);
    const colors = ["#6d3df4", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#8b5cf6"];

    if(rows.length === 0 || total <= 0){
      royaltiesByFormatPanel.innerHTML = `
        <div class="dashboard-panel-header">
          <h2>Royalties by Source</h2>
        </div>
        <div class="donut-row empty-state">
          <div class="empty-chart">No source breakdown yet.</div>
        </div>
      `;
      return;
    }

    let offset = 0;
    const segments = rows.map((item, idx) => {
      const pct = (Number(item.earnings || 0) / total) * 100;
      const start = offset;
      offset += pct;
      return `${colors[idx % colors.length]} ${start}% ${offset}%`;
    }).join(", ");

    const legend = rows.map((item, idx) => {
      const pct = ((Number(item.earnings || 0) / total) * 100).toFixed(1);
      return `
        <div>
          <span class="dot" style="background:${colors[idx % colors.length]};"></span>
          <strong>${escapeHtml(humanizeDashboardLabel(item.source_platform))}</strong>
          <em>${pct}%</em>
          <b>${formatDashboardCurrency(item.earnings)}</b>
        </div>
      `;
    }).join("");

    const totalText = formatDashboardCurrency(total);
    royaltiesByFormatPanel.innerHTML = `
      <div class="dashboard-panel-header">
        <h2>Royalties by Source</h2>
      </div>
      <div class="donut-row">
        <div class="donut-chart" style="background: conic-gradient(${segments});"><span>${totalText}<small>Total</small></span></div>
        <div class="donut-legend">${legend}</div>
      </div>
    `;
  }

  function applyDashboardSummary(summary){
    if(!summary) return;

    dashboardSummary = summary;
    const cards = summary.cards || {};
    const rangeLabel = summary.range && summary.range.label ? summary.range.label : "Selected range";
    const previousLabel = `vs ${rangeLabel}`;

    if(dashboardTotalRoyalties){
      dashboardTotalRoyalties.innerText = formatDashboardCurrency(cards.total_royalties && cards.total_royalties.value);
      setDashboardDelta(dashboardTotalRoyaltiesDelta, cards.total_royalties);
    }

    if(dashboardTotalUnitsSold){
      dashboardTotalUnitsSold.innerText = formatDashboardNumber(cards.total_units_sold && cards.total_units_sold.value);
      setDashboardDelta(dashboardTotalUnitsSoldDelta, cards.total_units_sold);
    }

    if(dashboardTotalTitlesSold){
      dashboardTotalTitlesSold.innerText = formatDashboardNumber(cards.total_titles_sold && cards.total_titles_sold.value);
      setDashboardDelta(dashboardTotalTitlesSoldDelta, cards.total_titles_sold);
    }

    if(dashboardAverageRoyaltyPerUnit){
      dashboardAverageRoyaltyPerUnit.innerText = formatDashboardCurrency(cards.average_royalty_per_unit && cards.average_royalty_per_unit.value);
      setDashboardDelta(dashboardAverageRoyaltyPerUnitDelta, cards.average_royalty_per_unit);
    }

    if(dashboardRangeSelect && summary.range && summary.range.key){
      dashboardRangeSelect.value = summary.range.key;
    }

    toggleCustomDashboardRange();

    const charts = summary.charts || {};
    renderDashboardCountryChart(charts.sales_by_country || []);
    renderDashboardTimeSeries(charts.royalties_over_time || []);
    renderDashboardSourceChart(charts.royalties_by_source || []);
    renderDashboardTopBooks(summary.top_books || []);
    renderDashboardInsights();
  }

  async function loadDashboardSummary(){
    if(!currentUser || !dashboardRangeSelect) return;

    setPageLoading(true, "Loading dashboard...");
    const range = dashboardRangeSelect.value || "5m";
    const params = new URLSearchParams();
    params.set("range", range);

    if(range === "custom"){
      if(!dashboardCustomFrom || !dashboardCustomTo || !dashboardCustomFrom.value || !dashboardCustomTo.value){
        setPageLoading(false);
        return;
      }

      params.set("from", dashboardCustomFrom.value);
      params.set("to", dashboardCustomTo.value);
    }

    const res = await fetch(`/api/dashboard/summary?${params.toString()}`);

    if(!res.ok){
      setPageLoading(false);
      return;
    }

    const payload = await res.json();
    applyDashboardSummary(payload.results || null);
    setPageLoading(false);
  }

  function toggleCustomDashboardRange(){
    if(!dashboardRangeSelect || !dashboardCustomRange) return;
    dashboardCustomRange.classList.toggle("hidden", dashboardRangeSelect.value !== "custom");
  }

  async function loadReportingMonths(){
    const select = document.getElementById("filter_report_month");
    if(!select || !currentUser) return;

    const currentValue = select.value;
    const res = await fetch(`/api/reporting/months?_=${Date.now()}`, { cache: "no-store" });

    if(!res.ok) return;

    const payload = await res.json();
    const months = payload.results || [];

    select.innerHTML = `<option value="">All available months</option>` +
      months.map(month => `<option value="${escapeHtml(month.value)}">${escapeHtml(month.label)}</option>`).join("");

    if(currentValue && months.some(month => month.value === currentValue)){
      select.value = currentValue;
    }
  }

  function renderRecordDetails(record){
    const keys = Object.keys(record || {});

    return `
      <div class="record-detail-grid">
        ${keys.map(key => `
          <div class="record-detail-label">${escapeHtml(humanizeDynamicColumn(key))}</div>
          <div class="record-detail-value">${escapeHtml(formatDynamicCell(record[key], key))}</div>
        `).join("")}
      </div>`;
  }

  async function openRecordOverlay(recordId){
    if(!recordId) return;

    activeRecordId = recordId;
    recordOverlayTitle.innerText = `Royalty Record #${recordId}`;
    recordOverlayContent.innerHTML = `<div class="result-note">Loading record...</div>`;
    recordOverlay.classList.remove("hidden");

    const res = await fetch(`/api/reporting/${encodeURIComponent(recordId)}`);

    if(!res.ok){
      recordOverlayContent.innerHTML = `<div class="result-note result-warning">Failed to load this record.</div>`;
      return;
    }

    const payload = await res.json();
    recordOverlayContent.innerHTML = renderRecordDetails(payload.results || {});
  }

  function closeRecordOverlay(){
    activeRecordId = null;
    recordOverlay.classList.add("hidden");
    recordOverlayContent.innerHTML = "";
  }

  async function deleteActiveRecord(){
    if(!activeRecordId) return;

    const ok = window.confirm("Do you want to delete this record?");
    if(!ok) return;

    const res = await fetch(`/api/reporting/${encodeURIComponent(activeRecordId)}`, {
      method: "DELETE"
    });

    if(!res.ok){
      window.alert("Failed to delete this record.");
      return;
    }

    closeRecordOverlay();
    loadReportingMonths();
    loadReportingData(reportingPageNo);
  }

  async function loadReportingData(page){
    reportingPageNo = page || 1;
    await loadReportingMonths();

    const params = new URLSearchParams();
    params.set("page", reportingPageNo);
    params.set("page_size", 50);

    reportingFilters.forEach(key => {
      const el = document.getElementById("filter_" + key);
      if(el && el.value.trim()){
        params.set(key, el.value.trim());
      }
    });

    if(reportingSortColumn){
      params.set("sort_by", reportingSortColumn);
      params.set("sort_dir", reportingSortDirection);
    }

    const status = document.getElementById("reportingStatus");
    const target = document.getElementById("reportingTable");
    const summary = document.getElementById("reportingSummary");

    if(!status || !target || !summary) return;

    status.innerHTML = "";
    target.innerHTML = `
      <div class="table-card">
        <div style="padding:18px;color:#6b7280;">Loading reporting data...</div>
      </div>`;
    setPageLoading(true, "Loading reports...");

    const res = await fetch("/api/reporting?" + params.toString());

    if(res.status === 401){
      summary.innerText = "Login required.";
      target.innerHTML = "";
      status.innerHTML = `<div class="result-note result-warning">Please login to view reporting.</div>`;
      setPageLoading(false);
      openLogin("/reporting");
      return;
    }

    if(!res.ok){
      target.innerHTML = "";
      status.innerHTML = `<div class="result-note result-warning">Failed to load reporting data.</div>`;
      setPageLoading(false);
      return;
    }

    const payload = await res.json();
    const data = payload.results || {};

    reportingPageNo = data.page || 1;
    reportingTotalPages = data.total_pages || 1;

    summary.innerText = `Page ${reportingPageNo} of ${reportingTotalPages} • ${data.total_count || 0} records`;
    target.innerHTML = renderReportingTable(
      data.records || [],
      "Royalty Transactions",
      `Showing ${(data.records || []).length} of ${data.total_count || 0}`
    );

    attachReportingSortEvents();
    attachReportingRecordEvents();

    document.getElementById("prevPageBtn").disabled = reportingPageNo <= 1;
    document.getElementById("nextPageBtn").disabled = reportingPageNo >= reportingTotalPages;
    setPageLoading(false);
  }

  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  if(applyFiltersBtn){
    applyFiltersBtn.addEventListener("click", () => loadReportingData(1));
  }

  if(dashboardRangeSelect){
    dashboardRangeSelect.addEventListener("change", () => {
      toggleCustomDashboardRange();
      loadDashboardSummary();
    });
  }

  if(dashboardCustomFrom){
    dashboardCustomFrom.addEventListener("change", () => {
      if(dashboardRangeSelect && dashboardRangeSelect.value === "custom"){
        loadDashboardSummary();
      }
    });
  }

  if(dashboardCustomTo){
    dashboardCustomTo.addEventListener("change", () => {
      if(dashboardRangeSelect && dashboardRangeSelect.value === "custom"){
        loadDashboardSummary();
      }
    });
  }

  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  if(clearFiltersBtn){
    clearFiltersBtn.addEventListener("click", () => {
      reportingFilters.forEach(key => {
        const el = document.getElementById("filter_" + key);
        if(el) el.value = "";
      });
      reportingSortColumn = "";
      reportingSortDirection = "asc";
      loadReportingData(1);
    });
  }

  const prevPageBtn = document.getElementById("prevPageBtn");
  if(prevPageBtn){
    prevPageBtn.addEventListener("click", () => {
      if(reportingPageNo > 1) loadReportingData(reportingPageNo - 1);
    });
  }

  const nextPageBtn = document.getElementById("nextPageBtn");
  if(nextPageBtn){
    nextPageBtn.addEventListener("click", () => {
      if(reportingPageNo < reportingTotalPages) loadReportingData(reportingPageNo + 1);
    });
  }

  closeRecordOverlayBtn.addEventListener("click", closeRecordOverlay);
  cancelRecordBtn.addEventListener("click", closeRecordOverlay);
  deleteRecordBtn.addEventListener("click", deleteActiveRecord);
  recordOverlay.addEventListener("click", (event) => {
    if(event.target === recordOverlay) closeRecordOverlay();
  });

  reportingFilters.forEach(key => {
    const el = document.getElementById("filter_" + key);
    if(el){
      el.addEventListener("keydown", (event) => {
        if(event.key === "Enter") loadReportingData(1);
      });
      el.addEventListener("change", () => {
        if(key === "report_month" || key === "source_platform") loadReportingData(1);
      });
    }
  });

  (async function init(){
    await checkAuth();
    showCorrectPage();
    if(currentUser && !isReportingRoute() && !isAIRoute() && !isSettingsRoute()){
      addMessage("Welcome to The Royalty Hub. Ask me about royalty performance, or upload a KDP or ACX royalty statement.", "assistant");
    }
  })();
