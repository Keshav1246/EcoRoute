/* ========================================
   ECOROUTE — Interactive Dashboard JS
   ======================================== */

// ============ DATA ============
const leaderboardData = [
    { location: 'ITO', avg_congestion: 2.07, avg_pm25: 159.59, avg_ers: 2.51, lat: 28.6289, lon: 77.2408 },
    { location: 'Connaught Place', avg_congestion: 1.68, avg_pm25: 159.59, avg_ers: 2.04, lat: 28.6315, lon: 77.2167 },
    { location: 'Rohini', avg_congestion: 1.59, avg_pm25: 300.0, avg_ers: 1.92, lat: 28.7295, lon: 77.1146 },
    { location: 'Karol Bagh', avg_congestion: 1.43, avg_pm25: 206.39, avg_ers: 1.74, lat: 28.6528, lon: 77.1902 },
    { location: 'Nehru Place', avg_congestion: 1.31, avg_pm25: 159.59, avg_ers: 1.61, lat: 28.5491, lon: 77.2534 },
    { location: 'Dwarka', avg_congestion: 0.95, avg_pm25: 159.59, avg_ers: 1.20, lat: 28.5921, lon: 77.0460 },
    { location: 'Lajpat Nagar', avg_congestion: 0.74, avg_pm25: 159.59, avg_ers: 1.00, lat: 28.5653, lon: 77.2434 },
];

const aqiDistribution = {
    'Unhealthy': 456816,
    'Poor': 442080,
    'Very Unhealthy': 149816
};

const timelineStats = {
    total: 1048712,
    locations: {
        'Lajpat Nagar': 149816,
        'Connaught Place': 149816,
        'ITO': 149816,
        'Karol Bagh': 224724,
        'Nehru Place': 149816,
        'Rohini': 74908,
        'Dwarka': 149816
    }
};

// ============ PARTICLES BACKGROUND ============
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 20000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
            ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[j].x - p.x;
                const dy = particles[j].y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });
        animFrame = requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();
    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
}

// ============ NAVBAR ============
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (toggle) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('active');
        });
    }

    // Active nav link on scroll — use getBoundingClientRect for accurate detection
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const navLinksArr = Array.from(navLinks);
        let found = false;

        // Check sections in reverse order (bottom-to-top) so the first 
        // section whose top is above the midpoint wins
        const sectionIds = navLinksArr.map(l => l.getAttribute('href').substring(1));
        
        for (let i = sectionIds.length - 1; i >= 0; i--) {
            const section = document.getElementById(sectionIds[i]);
            if (!section) continue;
            const rect = section.getBoundingClientRect();
            // Section is "active" if its top is above 200px from viewport top
            if (rect.top <= 200) {
                navLinks.forEach(l => l.classList.remove('active'));
                navLinksArr[i].classList.add('active');
                found = true;
                break;
            }
        }
        
        if (!found) {
            navLinks.forEach(l => l.classList.remove('active'));
        }
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

// ============ COUNTER ANIMATION ============
function animateCounters() {
    const counters = document.querySelectorAll('.stat-value[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                animateNumber(el, 0, target, 2000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateNumber(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(start + (end - start) * eased);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ============ SCROLL ANIMATIONS ============
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.problem-card, .formula-card, .arch-stage, .medallion-card, ' +
        '.pipeline-step, .chart-card, .finding-card, .challenge-card, ' +
        '.future-card, .cost-card, .kpi-card, .data-table-section'
    );

    elements.forEach(el => el.classList.add('animate-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 50);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

// ============ LEADERBOARD CHART ============
function renderLeaderboard(selectedSet = null) {
    const container = document.getElementById('leaderboard-chart');
    if (!container) return;

    const hasFilter = selectedSet && selectedSet.size > 0;
    const data = leaderboardData;
    const maxERS = Math.max(...data.map(d => d.avg_ers));
    const cityAvg = data.reduce((s, d) => s + d.avg_ers, 0) / data.length;

    container.innerHTML = data.map((d, i) => {
        const pct = (d.avg_ers / maxERS) * 100;
        let color;
        if (d.avg_ers > cityAvg * 1.2) color = '#ef4444';
        else if (d.avg_ers > cityAvg * 0.9) color = '#f59e0b';
        else color = '#10b981';

        const isActive = !hasFilter || selectedSet.has(d.location);
        const rowClass = hasFilter && isActive ? 'bar-row highlighted' : 'bar-row';
        const opacity = !hasFilter ? 1 : (isActive ? 1 : 0.3);

        return `
            <div class="${rowClass}" data-location="${d.location}" onclick="selectLocation('${d.location}')" style="opacity:${opacity};transition:opacity 0.4s ease;">
                <span class="bar-label">${d.location}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${pct}%; background: ${color};">
                        <span class="bar-value">${d.avg_ers.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Animate bars on first render only
    if (!hasFilter) {
        requestAnimationFrame(() => {
            container.querySelectorAll('.bar-fill').forEach(bar => {
                const w = bar.style.width;
                bar.style.width = '0%';
                requestAnimationFrame(() => {
                    bar.style.width = w;
                });
            });
        });
    }
}

// ============ SCATTER PLOT CHART ============
function renderScatter(selectedSet = null) {
    const canvas = document.getElementById('scatter-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.min(rect.height, 300);
    const hasFilter = selectedSet && selectedSet.size > 0;

    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    const w = canvas.width - padding.left - padding.right;
    const h = canvas.height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate scatter points from leaderboard
    const points = [];
    const data = leaderboardData;

    data.forEach(d => {
        // Generate multiple points per location to simulate the scatter
        const isActive = !hasFilter || selectedSet.has(d.location);
        for (let i = 0; i < 12; i++) {
            const cong = d.avg_congestion + (Math.random() - 0.5) * 1.2;
            const ers = d.avg_ers + (Math.random() - 0.5) * 0.9;
            const pm25cat = d.avg_pm25 > 250 ? 'Very Unhealthy' : d.avg_pm25 > 150 ? 'Unhealthy' : 'Poor';
            points.push({ x: Math.max(0, cong), y: Math.max(0, ers), cat: pm25cat, location: d.location, active: isActive });
        }
    });

    const maxX = 4;
    const maxY = 4;

    // Grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const x = padding.left + (i / 4) * w;
        const y = padding.top + (i / 4) * h;
        ctx.beginPath(); ctx.moveTo(x, padding.top); ctx.lineTo(x, padding.top + h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left + w, y); ctx.stroke();
    }

    // Axis labels
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
        ctx.fillText(i.toString(), padding.left + (i / 4) * w, padding.top + h + 20);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        ctx.fillText((4 - i).toFixed(1), padding.left - 10, padding.top + (i / 4) * h + 4);
    }

    // Axis titles
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Congestion Score', padding.left + w / 2, canvas.height - 8);

    ctx.save();
    ctx.translate(14, padding.top + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Emission Risk Score', 0, 0);
    ctx.restore();

    const catColors = {
        'Very Unhealthy': '#ef4444',
        'Unhealthy': '#f59e0b',
        'Poor': '#3b82f6'
    };

    // Draw trend line
    const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
    const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
    let num = 0, den = 0;
    points.forEach(p => {
        num += (p.x - avgX) * (p.y - avgY);
        den += (p.x - avgX) * (p.x - avgX);
    });
    const slope = den > 0 ? num / den : 0;
    const intercept = avgY - slope * avgX;

    const lineX1 = 0;
    const lineX2 = maxX;
    const lineY1 = slope * lineX1 + intercept;
    const lineY2 = slope * lineX2 + intercept;

    ctx.beginPath();
    ctx.moveTo(padding.left + (lineX1 / maxX) * w, padding.top + h - (lineY1 / maxY) * h);
    ctx.lineTo(padding.left + (lineX2 / maxX) * w, padding.top + h - (lineY2 / maxY) * h);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw points — faded ones first, active ones on top
    const faded = points.filter(p => !p.active);
    const active = points.filter(p => p.active);
    [...faded, ...active].forEach(p => {
        const px = padding.left + (p.x / maxX) * w;
        const py = padding.top + h - (p.y / maxY) * h;
        ctx.beginPath();
        ctx.arc(px, py, p.active ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = catColors[p.cat] || '#3b82f6';
        ctx.globalAlpha = p.active ? 0.7 : 0.12;
        ctx.fill();
        ctx.globalAlpha = p.active ? 1 : 0.15;
        ctx.strokeStyle = catColors[p.cat] || '#3b82f6';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
    });

    // Legend
    const legendY = padding.top + 8;
    let legendX = padding.left + w - 200;
    ctx.font = '10px Inter, sans-serif';
    Object.entries(catColors).forEach(([label, color]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(legendX, legendY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(label, legendX + 8, legendY + 3);
        legendX += 80;
    });
}

// ============ DONUT CHART ============
function renderDonut(filterLocation = 'all') {
    const canvas = document.getElementById('donut-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 10;
    const outerR = Math.min(centerX, centerY) - 30;
    const innerR = outerR * 0.6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = [
        { label: 'Unhealthy', value: aqiDistribution['Unhealthy'], color: '#f59e0b' },
        { label: 'Poor', value: aqiDistribution['Poor'], color: '#ef4444' },
        { label: 'Very Unhealthy', value: aqiDistribution['Very Unhealthy'], color: '#dc2626' },
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    let startAngle = -Math.PI / 2;

    data.forEach(d => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerR, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();

        // Label
        const midAngle = startAngle + sliceAngle / 2;
        const labelR = outerR + 20;
        const lx = centerX + Math.cos(midAngle) * (outerR - (outerR - innerR) / 2);
        const ly = centerY + Math.sin(midAngle) * (outerR - (outerR - innerR) / 2);

        const pct = ((d.value / total) * 100).toFixed(1);
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#f1f5f9';
        ctx.textAlign = 'center';
        ctx.fillText(`${pct}%`, lx, ly + 4);

        startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(total.toLocaleString(), centerX, centerY - 4);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Total Records', centerX, centerY + 16);

    // Legend
    let ly = canvas.height - 30;
    ctx.font = '11px Inter, sans-serif';
    let lx = centerX - 120;
    data.forEach(d => {
        ctx.fillStyle = d.color;
        ctx.fillRect(lx, ly - 8, 10, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(d.label, lx + 14, ly);
        lx += 100;
    });
}

// ============ COMBO CHART ============
function renderComboChart(selectedSet = null) {
    const hasFilter = selectedSet && selectedSet.size > 0;
    const canvas = document.getElementById('combo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.max(rect.height, 300);

    // Always render ALL locations — highlight selected, fade the rest
    const data = leaderboardData;

    const padding = { top: 30, right: 70, bottom: 70, left: 70 };
    const w = canvas.width - padding.left - padding.right;
    const h = canvas.height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxPM25 = 350;
    const maxERS = 3;
    const barWidth = Math.min(50, w / data.length * 0.6);
    const gap = w / data.length;

    // Grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * h;
        ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left + w, y); ctx.stroke();
    }

    // Store point positions for click detection
    const pointPositions = [];

    // Bars (PM2.5)
    data.forEach((d, i) => {
        const x = padding.left + i * gap + (gap - barWidth) / 2;
        const barH = (d.avg_pm25 / maxPM25) * h;
        const y = padding.top + h - barH;

        const isActive = !hasFilter || selectedSet.has(d.location);
        const alpha = isActive ? 1.0 : 0.2;

        // Gradient bar
        const grad = ctx.createLinearGradient(x, y, x, padding.top + h);
        grad.addColorStop(0, `rgba(139, 92, 246, ${0.7 * alpha})`);
        grad.addColorStop(1, `rgba(139, 92, 246, ${0.2 * alpha})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Bar label
        ctx.fillStyle = isActive ? '#94a3b8' : 'rgba(148,163,184,0.25)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.avg_pm25.toFixed(0), x + barWidth / 2, y - 6);

        // X-axis label
        ctx.save();
        ctx.translate(x + barWidth / 2, padding.top + h + 16);
        ctx.rotate(-Math.PI / 6);
        ctx.font = isActive ? 'bold 11px Inter, sans-serif' : '11px Inter, sans-serif';
        ctx.fillStyle = isActive ? '#f1f5f9' : 'rgba(148,163,184,0.3)';
        ctx.textAlign = 'right';
        ctx.fillText(d.location, 0, 0);
        ctx.restore();

        // Store point center for click detection
        const px = padding.left + i * gap + gap / 2;
        const py = padding.top + h - (d.avg_ers / maxERS) * h;
        pointPositions.push({ x: px, y: py, cx: x + barWidth / 2, barX: x, barW: barWidth, barY: y, barH: barH, location: d.location });
    });

    // Line (ERS) — draw faded line first, then highlighted segments
    ctx.beginPath();
    data.forEach((d, i) => {
        const x = padding.left + i * gap + gap / 2;
        const y = padding.top + h - (d.avg_ers / maxERS) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = !hasFilter ? '#10b981' : 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw highlighted line segments between selected locations
    if (hasFilter) {
        for (let seg = 0; seg < data.length - 1; seg++) {
            const aActive = selectedSet.has(data[seg].location);
            const bActive = selectedSet.has(data[seg + 1].location);
            if (aActive || bActive) {
                ctx.beginPath();
                const x1 = padding.left + seg * gap + gap / 2;
                const y1 = padding.top + h - (data[seg].avg_ers / maxERS) * h;
                const x2 = padding.left + (seg + 1) * gap + gap / 2;
                const y2 = padding.top + h - (data[seg + 1].avg_ers / maxERS) * h;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = (aActive && bActive) ? '#10b981' : 'rgba(16, 185, 129, 0.5)';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    }

    // Line points
    data.forEach((d, i) => {
        const x = padding.left + i * gap + gap / 2;
        const y = padding.top + h - (d.avg_ers / maxERS) * h;
        const isActive = !hasFilter || selectedSet.has(d.location);
        const pointRadius = isActive ? 7 : 4;
        const labelAlpha = isActive ? 1 : 0.25;

        ctx.beginPath();
        ctx.arc(x, y, pointRadius + 1, 0, Math.PI * 2);
        ctx.fillStyle = '#111827';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#10b981' : 'rgba(16, 185, 129, 0.3)';
        ctx.fill();

        // Glow effect for selected point
        if (hasFilter && isActive) {
            ctx.beginPath();
            ctx.arc(x, y, 14, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
            ctx.fill();
        }

        ctx.fillStyle = `rgba(16, 185, 129, ${labelAlpha})`;
        ctx.font = isActive ? 'bold 11px JetBrains Mono, monospace' : '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.avg_ers.toFixed(2), x, y - (isActive ? 16 : 10));
    });

    // Left Y-axis (PM2.5)
    ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const val = (maxPM25 / 5 * (5 - i)).toFixed(0);
        ctx.fillText(val, padding.left - 10, padding.top + (i / 5) * h + 4);
    }
    ctx.save();
    ctx.translate(14, padding.top + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PM2.5 (μg/m³)', 0, 0);
    ctx.restore();

    // Right Y-axis (ERS)
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'left';
    ctx.font = '10px Inter, sans-serif';
    for (let i = 0; i <= 5; i++) {
        const val = (maxERS / 5 * (5 - i)).toFixed(1);
        ctx.fillText(val, padding.left + w + 10, padding.top + (i / 5) * h + 4);
    }
    ctx.save();
    ctx.translate(canvas.width - 10, padding.top + h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#10b981';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Emission Risk Score', 0, 0);
    ctx.restore();

    // Legend
    ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
    ctx.fillRect(padding.left, padding.top - 20, 12, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PM2.5 Level', padding.left + 16, padding.top - 10);

    ctx.beginPath();
    ctx.moveTo(padding.left + 130, padding.top - 14);
    ctx.lineTo(padding.left + 145, padding.top - 14);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ERS Score', padding.left + 150, padding.top - 10);

    // Store positions for click interaction on the combo chart
    canvas._pointPositions = pointPositions;
    canvas._padding = padding;
    canvas._gap = gap;
    canvas._barWidth = barWidth;
}

// ============ MAP VISUALIZATION ============
function renderMap(selectedSet = null) {
    const hasFilter = selectedSet && selectedSet.size > 0;
    const container = document.getElementById('map-chart');
    if (!container) return;

    const data = leaderboardData;
    const minLat = 28.53, maxLat = 28.75;
    const minLon = 77.02, maxLon = 77.28;

    const mapWidth = container.offsetWidth - 48;
    const mapHeight = 380;

    function lonToX(lon) { return ((lon - minLon) / (maxLon - minLon)) * mapWidth + 24; }
    function latToY(lat) { return ((maxLat - lat) / (maxLat - minLat)) * mapHeight; }

    const maxERS = Math.max(...data.map(d => d.avg_ers));

    let html = `<div class="map-svg-container" style="height:${mapHeight}px;position:relative;">`;
    html += `<svg width="100%" height="${mapHeight}" viewBox="0 0 ${mapWidth + 48} ${mapHeight}">`;

    // Grid lines for reference
    for (let i = 0; i <= 4; i++) {
        const x = 24 + (i / 4) * mapWidth;
        const y = (i / 4) * mapHeight;
        html += `<line x1="${x}" y1="0" x2="${x}" y2="${mapHeight}" stroke="rgba(148,163,184,0.05)" stroke-width="1"/>`;
        html += `<line x1="24" y1="${y}" x2="${mapWidth + 24}" y2="${y}" stroke="rgba(148,163,184,0.05)" stroke-width="1"/>`;
    }

    // Location bubbles — render pulse circles FIRST (below everything)
    data.forEach(d => {
        const x = lonToX(d.lon);
        const y = latToY(d.lat);
        const r = 12 + (d.avg_ers / maxERS) * 28;
        const isFiltered = !hasFilter || selectedSet.has(d.location);

        let color;
        if (d.avg_ers > 2) color = '#ef4444';
        else if (d.avg_ers > 1.5) color = '#f59e0b';
        else color = '#10b981';

        // Pulse animation for high ERS — pointer-events: none so hover isn't stolen
        if (d.avg_ers > 2 && isFiltered) {
            html += `<circle cx="${x}" cy="${y}" r="${r + 8}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.3" style="pointer-events:none;">
                <animate attributeName="r" from="${r}" to="${r + 15}" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
            </circle>`;
        }
    });

    // Now render interactive bubbles ON TOP of pulse rings
    data.forEach(d => {
        const x = lonToX(d.lon);
        const y = latToY(d.lat);
        const r = 12 + (d.avg_ers / maxERS) * 28;
        const isFiltered = !hasFilter || selectedSet.has(d.location);
        const opacity = isFiltered ? 0.7 : 0.15;
        const strokeOpacity = isFiltered ? 1 : 0.2;
        const textOpacity = isFiltered ? 1 : 0.25;

        let color;
        if (d.avg_ers > 2) color = '#ef4444';
        else if (d.avg_ers > 1.5) color = '#f59e0b';
        else color = '#10b981';

        // Invisible larger hit-area circle to make hovering easier
        html += `<circle cx="${x}" cy="${y}" r="${r + 12}" fill="transparent" style="cursor:pointer;"
            onmouseenter="showMapTooltip(event, '${d.location}', ${d.avg_ers}, ${d.avg_pm25}, ${d.avg_congestion})"
            onmousemove="moveMapTooltip(event)"
            onmouseleave="hideMapTooltip()"
            onclick="selectLocation('${d.location}')"/>`;

        html += `<g class="map-point" data-location="${d.location}" style="pointer-events:none;">
            <circle class="map-bubble" cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"
                stroke="${color}" stroke-width="2" stroke-opacity="${strokeOpacity}"/>
            <text x="${x}" y="${y - r - 8}" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="600" font-family="Inter, sans-serif" opacity="${textOpacity}">${d.location}</text>
            <text x="${x}" y="${y + 4}" text-anchor="middle" fill="white" font-size="10" font-weight="700" font-family="JetBrains Mono, monospace" opacity="${textOpacity}">${d.avg_ers.toFixed(2)}</text>
        </g>`;
    });

    html += `</svg>`;
    html += `<div class="map-tooltip" id="map-tooltip"></div>`;
    html += `</div>`;

    // Legend
    html += `<div style="display:flex;justify-content:center;gap:24px;padding:12px;font-size:0.75rem;color:#64748b;">
        <span>🔴 ERS > 2.0 (Critical)</span>
        <span>🟡 ERS 1.5–2.0 (Elevated)</span>
        <span>🟢 ERS < 1.5 (Normal)</span>
        <span style="color:#94a3b8;">Bubble size = ERS magnitude</span>
    </div>`;

    container.innerHTML = html;
}

function showMapTooltip(event, location, ers, pm25, congestion) {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = `
        <h5>${location}</h5>
        <div class="map-tooltip-row"><span>Avg ERS</span><span>${ers.toFixed(2)}</span></div>
        <div class="map-tooltip-row"><span>Avg PM2.5</span><span>${pm25.toFixed(1)} μg/m³</span></div>
        <div class="map-tooltip-row"><span>Avg Congestion</span><span>${congestion.toFixed(2)}</span></div>
    `;
    moveMapTooltip(event);
    tooltip.classList.add('visible');
}

function moveMapTooltip(event) {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;
    const svgContainer = tooltip.parentElement;
    if (!svgContainer) return;
    const containerRect = svgContainer.getBoundingClientRect();
    let left = event.clientX - containerRect.left + 16;
    let top = event.clientY - containerRect.top - 10;
    // Keep tooltip within bounds
    if (left + 200 > containerRect.width) left = left - 220;
    if (top < 0) top = 10;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function hideMapTooltip() {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) tooltip.classList.remove('visible');
}

// ============ DATA TABLE ============
function renderTable(selectedSet = null) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    const hasFilter = selectedSet && selectedSet.size > 0;
    const data = !hasFilter
        ? leaderboardData
        : leaderboardData.filter(d => selectedSet.has(d.location));

    const cityAvgPM25 = leaderboardData.reduce((s, d) => s + d.avg_pm25, 0) / leaderboardData.length;
    const cityAvgCong = leaderboardData.reduce((s, d) => s + d.avg_congestion, 0) / leaderboardData.length;
    const maxERS = Math.max(...leaderboardData.map(d => d.avg_ers));

    tbody.innerHTML = data.map((d, i) => {
        let risk, riskClass;
        if (d.avg_pm25 > cityAvgPM25 && d.avg_congestion > cityAvgCong) {
            risk = '🔴 Critical Hotspot'; riskClass = 'risk-critical';
        } else if (d.avg_pm25 > cityAvgPM25 || d.avg_congestion > cityAvgCong) {
            risk = '🟠 Elevated Risk'; riskClass = 'risk-elevated';
        } else {
            risk = '🟢 Within Norms'; riskClass = 'risk-normal';
        }

        let barColor;
        if (d.avg_ers > 2) barColor = '#ef4444';
        else if (d.avg_ers > 1.5) barColor = '#f59e0b';
        else barColor = '#10b981';

        const barPct = (d.avg_ers / maxERS) * 100;

        return `<tr>
            <td style="font-family:var(--font-mono);color:var(--text-muted);">${i + 1}</td>
            <td style="font-weight:600;">${d.location}</td>
            <td>
                <div class="ers-bar-container">
                    <span style="font-family:var(--font-mono);font-weight:600;">${d.avg_ers.toFixed(2)}</span>
                    <div class="ers-bar-bg">
                        <div class="ers-bar-fill" style="width:${barPct}%;background:${barColor};"></div>
                    </div>
                </div>
            </td>
            <td style="font-family:var(--font-mono);">${d.avg_pm25.toFixed(2)}</td>
            <td style="font-family:var(--font-mono);">${d.avg_congestion.toFixed(2)}</td>
            <td><span class="risk-badge ${riskClass}">${risk}</span></td>
        </tr>`;
    }).join('');
}

// ============ GLOBAL STATE ============
let selectedLocations = new Set(); // empty = show all

function getSelectedSet() {
    return selectedLocations.size > 0 ? selectedLocations : null;
}

// ============ FILTER INTERACTION ============
function selectLocation(location) {
    if (location === 'all') {
        // "All Locations" clicked — clear selection
        selectedLocations.clear();
    } else {
        // Toggle the location in the set (multi-select)
        if (selectedLocations.has(location)) {
            selectedLocations.delete(location);
        } else {
            selectedLocations.add(location);
        }
    }

    // Update filter chips
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(c => {
        if (c.dataset.location === 'all') {
            c.classList.toggle('active', selectedLocations.size === 0);
        } else {
            c.classList.toggle('active', selectedLocations.has(c.dataset.location));
        }
    });

    // Re-render all charts with highlight/fade mode
    const sel = getSelectedSet();
    renderLeaderboard(sel);
    renderScatter(sel);
    renderComboChart(sel);
    renderMap(sel);
    renderTable(sel);
    // KPIs never change — they always show citywide stats
}

// Filter chip click handlers
document.addEventListener('DOMContentLoaded', () => {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            selectLocation(chip.dataset.location);
        });
    });
});

// ============ LIGHTBOX ============
function openLightbox(el) {
    const img = el.querySelector('img');
    const label = el.querySelector('.screenshot-label');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCaption = document.getElementById('lightbox-caption');

    lbImg.src = img.src;
    lbCaption.textContent = label ? label.textContent : '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('lightbox') || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

// ============ CODE COPY ============
function copyCode(btn) {
    const code = btn.closest('.code-block').querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
}

// ============ PREVIEW TABS ============
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.preview-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.preview-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });
});

// ============ RESIZE HANDLER ============
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const sel = getSelectedSet();
        renderScatter(sel);
        renderDonut();
        renderComboChart(sel);
        renderMap(sel);
    }, 250);
});

// ============ COMBO CHART CLICK HANDLER ============
function initComboChartClick() {
    const canvas = document.getElementById('combo-canvas');
    if (!canvas) return;
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const positions = canvas._pointPositions;
        if (!positions) return;

        // Check if click is near any data point (circle) or bar
        for (const p of positions) {
            const distToPoint = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
            const inBar = mx >= p.barX && mx <= p.barX + p.barW && my >= p.barY && my <= p.barY + p.barH;
            if (distToPoint < 18 || inBar) {
                selectLocation(p.location);
                return;
            }
        }
    });
    // Pointer cursor on hover near points/bars
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const positions = canvas._pointPositions;
        if (!positions) return;

        let hovering = false;
        for (const p of positions) {
            const distToPoint = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
            const inBar = mx >= p.barX && mx <= p.barX + p.barW && my >= p.barY && my <= p.barY + p.barH;
            if (distToPoint < 18 || inBar) {
                hovering = true;
                break;
            }
        }
        canvas.style.cursor = hovering ? 'pointer' : 'default';
    });
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    animateCounters();
    initScrollAnimations();

    // Render charts after a small delay to ensure DOM is ready
    setTimeout(() => {
        renderLeaderboard();
        renderScatter();
        renderDonut();
        renderComboChart();
        renderMap();
        renderTable();
        initComboChartClick();
    }, 300);
});
