// hard-coded to match pdslib-firefox's capacities
const FILTER_CAPACITIES = { Nc: 1.0, C: 8.0, QTrigger: 2.0, QSource: 4.0 };

const DAY_MS = 1000 * 60 * 60 * 24;
const EPOCH_MS = 7 * DAY_MS;

/**
 * @returns {number} current epoch number
 */
function getCurrentEpoch() {
  return Math.floor(Date.now() / EPOCH_MS);
}

/**
 * @param {string} type
 * @param {number} epoch
 * @param {string} uri
 * @returns {number} used budget for this filter
 */
function computeUsedBudget(type, epoch, uri) {
  let remaining = navigator.privateAttribution.getBudget(type, epoch, uri);
  if (remaining === -1.0) remaining = 0.0;
  return FILTER_CAPACITIES[type] - remaining;
}

/**
 * @param {Array<string>} sites
 * @param {string} filterType
 * @returns {Object<string,number>} label -> usedBudget
 */
function buildUsageMap(sites, filterType) {
  const epoch = getCurrentEpoch();
  return sites.reduce((map, site) => {
    const key = site ? site.replace(/^www\./, "") : "global";
    map[key] = computeUsedBudget(filterType, epoch, site);
    return map;
  }, {});
}

function renderBarChart(
  canvasId,
  xAxisTitle,
  leftData,
  leftColor,
  leftLineY,
  rightData,
  rightColor,
  rightLineY
) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  const leftKeys = Object.keys(leftData),
    rightKeys = Object.keys(rightData);
  const leftVals = Object.values(leftData),
    rightVals = Object.values(rightData);
  const labels = [...leftKeys, ...rightKeys];
  const data = [...leftVals, ...rightVals];
  const colors = [
    ...leftVals.map(() => leftColor),
    ...rightVals.map(() => rightColor),
  ];

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Privacy Loss", data, backgroundColor: colors }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            lineLeft: {
              type: "line",
              yMin: leftLineY,
              yMax: leftLineY,
              borderColor: leftColor,
              borderWidth: 2,
            },
            lineRight: {
              type: "line",
              yMin: rightLineY,
              yMax: rightLineY,
              borderColor: rightColor,
              borderWidth: 2,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(leftLineY, rightLineY),
          title: { display: true, text: "Privacy Loss" },
        },
        x: { title: { display: true, text: xAxisTitle } },
      },
    },
  });
}

function renderCollusionChart() {
  const globalMap = buildUsageMap([""], "C");
  const siteMap = buildUsageMap(["shoes.example", "toys.example"], "Nc");
  renderBarChart(
    "CollusionChart",
    "Privacy Filters",
    globalMap,
    "red",
    FILTER_CAPACITIES.C,
    siteMap,
    "blue",
    FILTER_CAPACITIES.Nc
  );
}

function renderQuotaChart() {
  const convMap = buildUsageMap(["shoes.example", "toys.example"], "QTrigger");
  const implMap = buildUsageMap(["blog.example", "news.example"], "QSource");
  renderBarChart(
    "QuotaChart",
    "Quota Filters",
    convMap,
    "orange",
    FILTER_CAPACITIES.QTrigger,
    implMap,
    "purple",
    FILTER_CAPACITIES.QSource
  );
}

function showNoApiMessage() {
  const container = document.getElementById("chartContainer");
  container.style.display = "block";
  container.style.color = "red";
  container.innerHTML =
    "navigator.privateAttribution is undefined! Make sure:<br>" +
    "1. Firefox was compiled with MOZ_TELEMETRY_REPORTING=1<br>" +
    "2. dom.origin-trials.private-attribution.state = 1 in about:config<br>" +
    "3. 'privacy-preserving ad measurement' is enabled.";
}

document.addEventListener("DOMContentLoaded", () => {
  if (!navigator.privateAttribution) {
    console.error("Private Attribution API unavailable");
    showNoApiMessage();
    return;
  }
  renderCollusionChart();
  renderQuotaChart();
  document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Spacebar" || e.keyCode === 32) {
      navigator.privateAttribution.clearBudgets();
    }
  });
});
