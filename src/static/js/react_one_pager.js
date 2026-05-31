  const ROYALTY_TABLE_COLUMNS = [
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
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
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
    "normalized_title",
    "title",
    "author",
    "marketplace",
    "country_code",
    "units_sold",
    "units_refunded",
    "royalty_type",
    "payout_plan",
    "net_units_sold",
    "currency",
    "base_currency",
    "earnings",
    "earnings_in_base_currency",
    "avg_list_price_without_tax",
    "avg_offer_price_without_tax",
    "avg_file_size_mb",
    "avg_delivery_manufacturing_cost"
  ];

  const landingPage = document.getElementById("landingPage");
  const reportingPage = document.getElementById("reportingPage");
  const chatArea = document.getElementById("chatArea");
  const queryEl = document.getElementById("query");
  const composer = document.getElementById("composer");
  const sendBtn = document.getElementById("sendBtn");
  const filePill = document.getElementById("filePill");
  const fileName = document.getElementById("fileName");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userChip = document.getElementById("userChip");

  let draggedFile = null;
  let currentUser = null;
  let reportingPageNo = 1;
  let reportingTotalPages = 1;
  let reportingSortColumn = "";
  let reportingSortDirection = "asc";

  function isReportingRoute(){
    return window.location.pathname === "/reporting";
  }

  function showCorrectPage(){
    if(isReportingRoute()){
      landingPage.classList.remove("active");
      reportingPage.classList.add("active");
      loadReportingData(1);
    } else {
      reportingPage.classList.remove("active");
      landingPage.classList.add("active");
      setTimeout(() => queryEl && queryEl.focus(), 50);
    }
  }

  function formatCell(value, key){
    if(value === null || value === undefined || value === "") return "—";

    if(key === "created_at" || key === "updated_at"){
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
    }

    const numeric = new Set([
      "units_sold", "units_refunded", "net_units_sold",
      "avg_list_price_without_tax", "avg_offer_price_without_tax",
      "avg_file_size_mb", "avg_delivery_manufacturing_cost",
      "earnings", "earnings_in_base_currency", "fx_rate"
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
      currency: "Currency",
      avg_list_price_without_tax: "Avg. List Price (No Tax)",
      avg_offer_price_without_tax: "Avg. Offer Price (No Tax)",
      avg_file_size_mb: "Avg. File Size (MB)",
      avg_delivery_manufacturing_cost: "Avg. Delivery / Manufacturing Cost",
      earnings: "Earnings",
      base_currency: "Base Currency",
      earnings_in_base_currency: "Earnings in Base Currency",
      fx_rate: "FX Rate",
      created_at: "Created At",
      updated_at: "Updated At"
    };

    return labels[key] || String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function formatDynamicCell(value, key){
    if(value === null || value === undefined || value === "") return "—";

    if(key === "created_at" || key === "updated_at"){
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
    }

    const numericKeys = new Set([
      "units_sold", "units_refunded", "net_units_sold",
      "avg_list_price_without_tax", "avg_offer_price_without_tax",
      "avg_file_size_mb", "avg_delivery_manufacturing_cost",
      "earnings", "earnings_in_base_currency", "fx_rate"
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

  function appendDynamicResultBlock({message, type, records, title, meta}){
    const block = document.createElement("div");
    block.className = "result-block";

    let html = "";
    if(message){
      html += `<div class="result-note ${type === "success" ? "result-success" : "result-warning"}">${message}</div>`;
    }
    if(records){
      html += renderDynamicResultTable(records, title, meta);
    }

    block.innerHTML = html;
    chatArea.appendChild(block);
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
    const block = document.createElement("div");
    block.className = "result-block";

    let html = "";
    if(message){
      html += `<div class="result-note ${type === "success" ? "result-success" : "result-warning"}">${message}</div>`;
    }
    if(records){
      html += renderTable(records, title, meta);
    }

    block.innerHTML = html;
    chatArea.appendChild(block);
    chatArea.scrollTop = chatArea.scrollHeight;
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
    queryEl.focus();
  }

  async function checkAuth(){
    try {
      const res = await fetch("/auth/me");
      const data = await res.json();

      if(data.authenticated){
        currentUser = data.user;
        userChip.innerText = data.user.email || data.user.name || "Signed in";
        loginBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
      } else {
        currentUser = null;
        userChip.innerText = "";
        loginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
      }
    } catch(e) {
      currentUser = null;
    }
  }

  function openLogin(nextUrl){
    const url = `/auth/google/login?popup=true&next=${encodeURIComponent(nextUrl || window.location.pathname || "/")}`;
    const popup = window.open(url, "athoryn_google_login", "width=520,height=680");
    if(!popup){
      window.location.href = url.replace("popup=true&", "");
    }
  }

  window.addEventListener("message", async (event) => {
    if(event.data && event.data.type === "oauth_success"){
      await checkAuth();
      if(isReportingRoute() && currentUser){
        loadReportingData(1);
      }
    }
  });

  loginBtn.addEventListener("click", () => openLogin(window.location.pathname || "/"));

  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST" });
    await checkAuth();
    if(isReportingRoute()) window.location.href = "/";
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

  async function uploadFile(file){
    if(!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    addMessage("Uploading file: " + file.name, "user");

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
      appendResultBlock({
        message: data.message || `Data already exists for report_month ${data.report_month}. Insert skipped.`,
        type: "warning",
        records: data.sample_records || [],
        title: `Sample records for ${data.report_month}`,
        meta: `${data.existing_record_count || 0} existing records`
      });
      return payload;
    }

    if(data && data.status === "INSERTED"){
      appendResultBlock({
        message: `Data uploaded for ${data.report_month}. Inserted rows: ${data.inserted_rows}.`,
        type: "success"
      });
      return payload;
    }

    appendResultBlock({
      message: "Upload completed.",
      type: "success",
      records: data && data.sample_records ? data.sample_records : null,
      title: "Sample records"
    });

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
                <tr>${REPORTING_TABLE_COLUMNS.map(c => `<td>${formatCell(row[c.key], c.key)}</td>`).join("")}</tr>
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

  function escapeHtml(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

    document.getElementById("prevPageBtn").disabled = reportingPageNo <= 1;
    document.getElementById("nextPageBtn").disabled = reportingPageNo >= reportingTotalPages;
  }

  document.getElementById("applyFiltersBtn").addEventListener("click", () => loadReportingData(1));

  document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    reportingFilters.forEach(key => {
      const el = document.getElementById("filter_" + key);
      if(el) el.value = "";
    });
    reportingSortColumn = "";
    reportingSortDirection = "asc";
    loadReportingData(1);
  });

  document.getElementById("prevPageBtn").addEventListener("click", () => {
    if(reportingPageNo > 1) loadReportingData(reportingPageNo - 1);
  });

  document.getElementById("nextPageBtn").addEventListener("click", () => {
    if(reportingPageNo < reportingTotalPages) loadReportingData(reportingPageNo + 1);
  });

  reportingFilters.forEach(key => {
    const el = document.getElementById("filter_" + key);
    if(el){
      el.addEventListener("keydown", (event) => {
        if(event.key === "Enter") loadReportingData(1);
      });
    }
  });

  (async function init(){
    await checkAuth();
    showCorrectPage();
    if(!isReportingRoute()){
      addMessage("Welcome to Athoryn. Ask me about royalty performance, or upload a KDP royalty statement.", "assistant");
    }
  })();
