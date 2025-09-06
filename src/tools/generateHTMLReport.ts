import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

interface GenerateHTMLReportArgs {
  reportPath?: string;
  outputPath?: string;
}

export async function generateHTMLReport(args: GenerateHTMLReportArgs) {
  const { 
    reportPath = ".artifacts/consolidated-report.json",
    outputPath = ".artifacts/test-report.html" 
  } = args;
  
  try {
    const reportData = JSON.parse(await readFile(reportPath, 'utf-8'));
    const html = generateHTML(reportData);
    
    await writeFile(outputPath, html);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            htmlPath: outputPath,
            message: `HTML report generated at ${outputPath}`
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }, null, 2)
        }
      ]
    };
  }
}

function generateHTML(report: any): string {
  const { summary, details, artifacts } = report;
  
  const statusColors: Record<string, string> = {
    passed: '#10b981',
    failed: '#ef4444',
    partial: '#f59e0b'
  };
  
  const statusEmojis: Record<string, string> = {
    passed: '✅',
    failed: '❌',
    partial: '⚠️'
  };
  
  const screenshots = artifacts?.filter((a: string) => 
    a.endsWith('.png') || a.endsWith('.jpg')
  ) || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eyes Test Report - ${new Date(report.timestamp).toLocaleString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        .header .timestamp {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        .status-badge {
            display: inline-block;
            padding: 0.5rem 1.5rem;
            border-radius: 24px;
            font-weight: 600;
            margin-top: 1rem;
            background: ${statusColors[summary.overallStatus] || '#6b7280'};
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            padding: 2rem;
            background: #f9fafb;
        }
        .metric-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .metric-card h3 {
            color: #6b7280;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #1f2937;
        }
        .metric-detail {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }
        .section {
            padding: 2rem;
        }
        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
        .test-list {
            list-style: none;
        }
        .test-item {
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: #f9fafb;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .test-item.failed {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
        }
        .test-item.passed {
            background: #d1fae5;
            border-left: 4px solid #10b981;
        }
        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .screenshot-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .screenshot-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            cursor: pointer;
        }
        .screenshot-card .caption {
            padding: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
            background: #f9fafb;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 0.5rem;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
            transition: width 0.3s ease;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
            cursor: pointer;
        }
        .modal img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 90%;
            max-height: 90%;
        }
        .footer {
            padding: 2rem;
            text-align: center;
            background: #f9fafb;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👁️ Eyes Test Report</h1>
            <div class="timestamp">${new Date(report.timestamp).toLocaleString()}</div>
            <div class="status-badge">
                ${statusEmojis[summary.overallStatus]} ${summary.overallStatus.toUpperCase()}
            </div>
        </div>
        
        <div class="metrics">
            ${generateMetricCards(summary)}
        </div>
        
        ${generateTestSections(details)}
        
        ${screenshots.length > 0 ? generateScreenshotSection(screenshots) : ''}
        
        <div class="footer">
            Generated by Eyes MCP Testing Framework • ${artifacts?.length || 0} artifacts
        </div>
    </div>
    
    <div id="modal" class="modal" onclick="closeModal()">
        <img id="modalImg" src="" alt="Screenshot">
    </div>
    
    <script>
        function openModal(src) {
            document.getElementById('modal').style.display = 'block';
            document.getElementById('modalImg').src = src;
        }
        
        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }
    </script>
</body>
</html>`;
}

function generateMetricCards(summary: any): string {
  const cards: string[] = [];
  
  if (summary.unitTests) {
    const ut = summary.unitTests;
    const passRate = ut.total > 0 ? ((ut.passed / ut.total) * 100).toFixed(0) : '0';
    cards.push(`
      <div class="metric-card">
        <h3>Unit Tests</h3>
        <div class="metric-value">${passRate}%</div>
        <div class="metric-detail">${ut.passed}/${ut.total} passed</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${passRate}%"></div>
        </div>
      </div>
    `);
  }
  
  if (summary.e2eTests) {
    const e2e = summary.e2eTests;
    const passRate = e2e.totalSteps > 0 ? ((e2e.passedSteps / e2e.totalSteps) * 100).toFixed(0) : '0';
    cards.push(`
      <div class="metric-card">
        <h3>E2E Tests</h3>
        <div class="metric-value">${passRate}%</div>
        <div class="metric-detail">${e2e.passedSteps}/${e2e.totalSteps} steps</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${passRate}%"></div>
        </div>
      </div>
    `);
  }
  
  if (summary.visualTests) {
    const vt = summary.visualTests;
    const passRate = vt.totalScreenshots > 0 ? ((vt.passedScreenshots / vt.totalScreenshots) * 100).toFixed(0) : '0';
    cards.push(`
      <div class="metric-card">
        <h3>Visual Tests</h3>
        <div class="metric-value">${passRate}%</div>
        <div class="metric-detail">${vt.passedScreenshots}/${vt.totalScreenshots} screenshots</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${passRate}%"></div>
        </div>
      </div>
    `);
    
    cards.push(`
      <div class="metric-card">
        <h3>Visual Checks</h3>
        <div class="metric-value">${vt.ocrChecks + vt.visualDiffs + vt.vlmChecks}</div>
        <div class="metric-detail">OCR: ${vt.ocrChecks}, Diff: ${vt.visualDiffs}, AI: ${vt.vlmChecks}</div>
      </div>
    `);
  }
  
  return cards.join('');
}

function generateTestSections(details: any): string {
  const sections: string[] = [];
  
  if (details?.unitTests?.failedTests?.length > 0) {
    sections.push(`
      <div class="section">
        <h2>❌ Failed Unit Tests</h2>
        <ul class="test-list">
          ${details.unitTests.failedTests.map((test: any) => `
            <li class="test-item failed">
              <div>
                <strong>${test.test}</strong>
                <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
                  ${test.suite}
                </div>
                ${test.error ? `<div style="font-size: 0.875rem; color: #ef4444; margin-top: 0.5rem;">${test.error}</div>` : ''}
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `);
  }
  
  if (details?.e2eTests?.failedSteps?.length > 0) {
    sections.push(`
      <div class="section">
        <h2>❌ Failed E2E Steps</h2>
        <ul class="test-list">
          ${details.e2eTests.failedSteps.map((step: any) => `
            <li class="test-item failed">
              <div>
                <strong>Step ${step.step}: ${step.action}</strong>
                ${step.error ? `<div style="font-size: 0.875rem; color: #ef4444; margin-top: 0.5rem;">${step.error}</div>` : ''}
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `);
  }
  
  return sections.join('');
}

function generateScreenshotSection(screenshots: string[]): string {
  return `
    <div class="section">
      <h2>📸 Screenshots</h2>
      <div class="screenshot-grid">
        ${screenshots.map(path => {
          const name = basename(path).replace(/\.(png|jpg)$/, '');
          // For demo, using placeholder. In production, serve images properly
          const src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojOTk5O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+JHtuYW1lfTwvdGV4dD48L3N2Zz4=`;
          return `
            <div class="screenshot-card">
              <img src="${src}" alt="${name}" onclick="openModal('${src}')">
              <div class="caption">${name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}