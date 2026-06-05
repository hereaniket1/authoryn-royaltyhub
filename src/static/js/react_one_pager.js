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
  const authGate = document.getElementById("authGate");
  const authGateSettings = document.getElementById("authGateSettings");
  const settingsCard = document.getElementById("settingsCard");
  const settingsResults = document.getElementById("settingsResults");
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
  const settingsUploadBtn = document.getElementById("settingsUploadBtn");
  const reportingLink = document.getElementById("reportingLink");
  const deleteAllDataBtn = document.getElementById("deleteAllDataBtn");
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

  function updateAuthUI(){
    const isAuthenticated = Boolean(currentUser);

    reportingLink.classList.toggle("hidden", !isAuthenticated);
    homeDashboard.classList.remove("hidden");
    authGate.classList.toggle("hidden", isAuthenticated);
    authGateSettings.classList.toggle("hidden", isAuthenticated);
    settingsCard.classList.toggle("hidden", !isAuthenticated);
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
      showFile(null);
      queryEl.value = "";
    }
  }

  function showCorrectPage(){
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
      landingPage.classList.add("active");
      return;
    }

    if(isReportingRoute()){
      document.body.classList.add("dashboard-view");
      reportingPage.classList.add("active");
      if(currentUser){
        loadReportingMonths();
        loadReportingData(1);
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

    if(options.target !== "settings"){
      addMessage("Uploading file: " + file.name, "user");
    }

    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    if(res.status === 401){
      openLogin("/");
      throw new Error("Please login first, then upload again.");
    }

    if(!res.ok) throw new Error("File upload failed");

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
      return payload;
    }

    if(data && data.status === "INSERTED"){
      appendResultTarget(target, {
        message: `Data uploaded for ${data.report_month}. Inserted rows: ${data.inserted_rows}.`,
        type: "success"
      }, false);
      return payload;
    }

    appendResultTarget(target, {
      message: "Upload completed.",
      type: "success",
      records: data && data.sample_records ? data.sample_records : null,
      title: "Sample records"
    }, false);

    return payload;
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
        uploadFile(selectedFile, { target: "settings" });
        pendingUploadTarget = "home";
        fileInput.value = "";
      } else {
        showFile(selectedFile);
      }
    }
  });

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

  async function loadReportingMonths(){
    const select = document.getElementById("filter_report_month");
    if(!select || !currentUser) return;

    const currentValue = select.value;
    const res = await fetch("/api/reporting/months");

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

    const res = await fetch("/api/reporting?" + params.toString());

    if(res.status === 401){
      summary.innerText = "Login required.";
      target.innerHTML = "";
      status.innerHTML = `<div class="result-note result-warning">Please login to view reporting.</div>`;
      openLogin("/reporting");
      return;
    }

    if(!res.ok){
      target.innerHTML = "";
      status.innerHTML = `<div class="result-note result-warning">Failed to load reporting data.</div>`;
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
  }

  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  if(applyFiltersBtn){
    applyFiltersBtn.addEventListener("click", () => loadReportingData(1));
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
