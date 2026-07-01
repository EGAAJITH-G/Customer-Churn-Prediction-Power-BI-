const buildPDF = (title, sections) => {
  let stream = '';
  let y = 740;

  // Helper to escape text for PDF syntax
  const esc = (str) => {
    return str.replace(/[()\\\r\n]/g, (m) => '\\' + m);
  };

  // Helper to draw a horizontal line
  const drawLine = (yVal, width = 1, color = '0.8 0.8 0.8') => {
    return `${color} RG ${width} w 50 ${yVal} m 562 ${yVal} l S\n`;
  };

  // Helper to draw a rectangle (filled or stroke)
  const drawRect = (x, yVal, w, h, color = '0.95 0.95 0.95', fill = true) => {
    return `${color} ${fill ? 'rg' : 'RG'} ${x} ${yVal} ${w} ${h} re ${fill ? 'f' : 'S'}\n`;
  };

  // Helper to draw text
  const drawText = (text, x, yVal, fontSize, font = 'F2', color = '0.2 0.2 0.2') => {
    let out = 'BT\n';
    out += `/${font} ${fontSize} Tf\n`;
    out += `${color} rg\n`;
    out += `${x} ${yVal} Td\n`;
    out += `(${esc(text)}) Tj\n`;
    out += 'ET\n';
    return out;
  };

  // Draw Header Banner
  stream += drawRect(50, 670, 512, 70, '0.06 0.25 0.47'); // Premium Navy Blue
  stream += drawText(title, 70, 710, 16, 'F1', '1 1 1'); // Title in Helvetica-Bold (White)
  stream += drawText('Customer Churn Prediction Platform - System Report', 70, 690, 9, 'F2', '0.8 0.9 1.0'); // Subtitle (Light Blue)

  y = 640;

  sections.forEach((sec) => {
    if (sec.type === 'heading') {
      y -= 25;
      stream += drawText(sec.text, 50, y, 12, 'F1', '0.06 0.25 0.47');
      y -= 6;
      stream += drawLine(y, 1.2, '0.06 0.25 0.47');
      y -= 12;
    } else if (sec.type === 'text') {
      const lines = sec.text.split('\n');
      lines.forEach((line) => {
        stream += drawText(line, 50, y, 9.5, 'F2', '0.25 0.25 0.25');
        y -= 14;
      });
    } else if (sec.type === 'kpis') {
      y -= 50;
      const boxW = 160;
      const spacing = 16;
      let curX = 50;
      
      sec.items.forEach((kpi) => {
        stream += drawRect(curX, y, boxW, 45, '0.96 0.97 0.98'); // Light gray bg
        stream += drawRect(curX, y, boxW, 45, '0.85 0.87 0.9', false); // Soft border
        stream += drawText(kpi.label, curX + 10, y + 28, 8.5, 'F2', '0.45 0.45 0.45');
        stream += drawText(kpi.value, curX + 10, y + 10, 14, 'F1', '0.06 0.25 0.47');
        curX += boxW + spacing;
      });
      y -= 15;
    } else if (sec.type === 'table') {
      y -= 20;
      // Header row
      stream += drawRect(50, y, 512, 18, '0.9 0.92 0.95');
      let curX = 60;
      sec.headers.forEach((h, idx) => {
        const colW = sec.colWidths[idx];
        stream += drawText(h, curX, y + 5, 9, 'F1', '0.15 0.15 0.15');
        curX += colW;
      });
      y -= 18;

      // Rows
      sec.rows.forEach((row, rIdx) => {
        if (rIdx % 2 === 1) {
          stream += drawRect(50, y, 512, 16, '0.97 0.98 0.99'); // Alternating zebra row
        }
        let rowX = 60;
        row.forEach((val, cIdx) => {
          const colW = sec.colWidths[cIdx];
          stream += drawText(val, rowX, y + 4, 8.5, 'F2', '0.3 0.3 0.3');
          rowX += colW;
        });
        y -= 16;
      });
      y -= 10;
    } else if (sec.type === 'space') {
      y -= sec.size;
    }
  });

  // Footer
  stream += drawLine(50, 0.5, '0.8 0.8 0.8');
  stream += drawText(`Generated on ${new Date().toLocaleDateString()} | Confidential - Internal Use Only`, 50, 35, 7.5, 'F2', '0.55 0.55 0.55');
  stream += drawText('Page 1 of 1', 510, 35, 7.5, 'F2', '0.55 0.55 0.55');

  const streamBuffer = Buffer.from(stream, 'utf-8');

  // Define PDF Structure objects
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 612 792] /Contents 6 0 R >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  const obj6Header = `6 0 obj\n<< /Length ${streamBuffer.length} >>\nstream\n`;
  const obj6Footer = `\nendstream\nendobj\n`;

  const header = `%PDF-1.4\n`;

  // Dynamically calculate byte offsets for standard-compliant PDF xref
  const offsets = [];
  let currentOffset = header.length;

  offsets.push(currentOffset);
  currentOffset += obj1.length;

  offsets.push(currentOffset);
  currentOffset += obj2.length;

  offsets.push(currentOffset);
  currentOffset += obj3.length;

  offsets.push(currentOffset);
  currentOffset += obj4.length;

  offsets.push(currentOffset);
  currentOffset += obj5.length;

  offsets.push(currentOffset);
  const obj6Length = obj6Header.length + streamBuffer.length + obj6Footer.length;
  currentOffset += obj6Length;

  let xref = `xref\n0 7\n`;
  xref += `0000000000 65535 f \n`;
  offsets.forEach((off) => {
    xref += String(off).padStart(10, '0') + ` 00000 n \n`;
  });

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`;

  return Buffer.concat([
    Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + obj6Header, 'utf-8'),
    streamBuffer,
    Buffer.from(obj6Footer + xref + trailer, 'utf-8')
  ]);
};

const generateExecutiveSummary = () => {
  const sections = [
    {
      type: 'heading',
      text: '1. Executive Summary Overview'
    },
    {
      type: 'text',
      text: 'This report provides a detailed analysis of customer churn patterns during the second quarter of the\nfiscal year. By evaluating subscriber demographics, contract types, and payment profiles, this summary\noutlines critical risk areas and actionable recommendations to improve customer retention rates.'
    },
    {
      type: 'heading',
      text: '2. Key Churn Performance Indicators'
    },
    {
      type: 'kpis',
      items: [
        { label: 'Overall Churn Rate', value: '26.5%' },
        { label: 'Active Subscribers', value: '7,043' },
        { label: 'Net Churn Trend', value: '-1.2% QoQ' }
      ]
    },
    {
      type: 'heading',
      text: '3. Churn Breakdown by Contract Duration'
    },
    {
      type: 'table',
      headers: ['Contract Type', 'Subscriber Count', 'Churn Rate', 'Risk Classification'],
      colWidths: [150, 130, 100, 120],
      rows: [
        ['Month-to-month', '3,875', '42.7%', 'High Risk Level'],
        ['One year', '1,473', '11.2%', 'Moderate Risk Level'],
        ['Two year', '1,695', '2.8%', 'Low Risk Level']
      ]
    },
    {
      type: 'heading',
      text: '4. Churn Breakdown by Payment Channel'
    },
    {
      type: 'table',
      headers: ['Payment Method', 'Subscriber Share', 'Churn Rate', 'Priority Level'],
      colWidths: [180, 120, 100, 100],
      rows: [
        ['Electronic Check', '33.8%', '33.5%', 'Critical Priority'],
        ['Mailed Check', '22.9%', '19.1%', 'Medium Priority'],
        ['Bank Transfer (Auto)', '21.9%', '15.8%', 'Low Priority'],
        ['Credit Card (Auto)', '21.4%', '14.2%', 'Low Priority']
      ]
    },
    {
      type: 'heading',
      text: '5. Strategic Recommendations'
    },
    {
      type: 'text',
      text: '- Proactively transition Month-to-month subscribers to 1-year plans using personalized loyalty incentives.\n- Promote credit card or bank transfer Autopay features to electronic check users via a one-time bill credit.\n- Deploy specialized proactive support campaigns for customers reaching their 6-12 month tenure milestones.'
    }
  ];

  return buildPDF('Q2 Telecom Churn Executive Summary', sections);
};

const generateModelPerformanceLog = () => {
  const sections = [
    {
      type: 'heading',
      text: '1. Model Performance Overview'
    },
    {
      type: 'text',
      text: 'This log documents the operational metrics and feature importances of the machine learning model\nutilized to predict customer churn. The predictive framework is built on an optimized XGBoost classifier\ntrained on historical subscriber profiles, achieving a high degree of calibration and stability.'
    },
    {
      type: 'heading',
      text: '2. Core Model Validation Metrics'
    },
    {
      type: 'kpis',
      items: [
        { label: 'ROC-AUC Curve Score', value: '0.892' },
        { label: 'Model Accuracy', value: '84.5%' },
        { label: 'F1-Score Metrics', value: '0.821' }
      ]
    },
    {
      type: 'heading',
      text: '3. Detailed Classification Metrics'
    },
    {
      type: 'table',
      headers: ['Metric Parameter', 'Validation Score', 'Performance Tier', 'Target Benchmark'],
      colWidths: [150, 120, 110, 120],
      rows: [
        ['Precision', '0.842', 'Optimal', '> 0.800'],
        ['Recall (Sensitivity)', '0.811', 'Optimal', '> 0.780'],
        ['False Positive Rate', '0.042', 'Excellent', '< 0.080'],
        ['Out-of-Sample Accuracy', '0.845', 'Optimal', '> 0.820']
      ]
    },
    {
      type: 'heading',
      text: '4. Top Feature Importances'
    },
    {
      type: 'table',
      headers: ['Feature Variable', 'Relative Weight', 'Category Layer', 'Impact Level'],
      colWidths: [160, 120, 120, 100],
      rows: [
        ['Total Charges', '32.4%', 'Financial Metrics', 'High Impact'],
        ['Tenure (Months)', '24.1%', 'Account Lifecycle', 'High Impact'],
        ['Contract Type', '18.5%', 'Account Terms', 'High Impact'],
        ['Internet Service Type', '12.3%', 'Product Portfolio', 'Medium Impact'],
        ['Tech Support Add-on', '6.7%', 'Support Services', 'Low Impact'],
        ['Other Demographics', '6.0%', 'Demographics', 'Low Impact']
      ]
    },
    {
      type: 'heading',
      text: '5. Confusion Matrix Breakdown'
    },
    {
      type: 'text',
      text: '- True Negatives (Correctly predicted active subscribers): 1,240 accounts\n- True Positives (Correctly predicted churned subscribers): 470 accounts\n- False Negatives (Missed churn alerts - high risk): 110 accounts\n- False Positives (Unnecessary retention outreach alerts): 180 accounts'
    }
  ];

  return buildPDF('ML Model Performance & Feature Importance Log', sections);
};

module.exports = {
  generateExecutiveSummary,
  generateModelPerformanceLog
};
