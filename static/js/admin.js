
"use strict";

/* ================================================================
   APPLICATION
================================================================ */

document.addEventListener("DOMContentLoaded", () => {

    initTheme();
    initSidebar();
    initTooltips();
    initTextareaCounters();
    initSwitchDesciptionView();
    initMultiDropdown();
});

/* ================================================================
   THEME
================================================================ */

function initTheme() {

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const savedTheme = localStorage.getItem("admin-theme");

    const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme =
        savedTheme ||
        (prefersDark ? "dark" : "light");

    applyTheme(initialTheme);

    themeToggle.addEventListener("click", () => {

        const current =
            document.documentElement.getAttribute("data-theme");

        const next =
            current === "dark" ? "light" : "dark";

        applyTheme(next);

    });

    function applyTheme(theme) {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            "admin-theme",
            theme
        );

        themeIcon.className =
            theme === "dark"
                ? "ri-sun-line"
                : "ri-moon-clear-line";

        themeToggle.setAttribute(
            "aria-label",
            theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        /*
         * Rebuild chart colors after theme change.
         */
        if (window.dashboardCharts) {
            updateChartTheme(theme);
        }
    }
}

/* ================================================================
   SIDEBAR
================================================================ */
function initSidebar() {

    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");
    const overlay = document.getElementById("mobileOverlay");
    const close = document.getElementById("mobileSidebarClose");

    const isMobile = () =>
        window.matchMedia("(max-width: 991.98px)").matches;


    toggle.addEventListener("click", () => {

        if (isMobile()) {

            sidebar.classList.toggle("mobile-open");
            overlay.classList.toggle("show");

            const opened =
                sidebar.classList.contains("mobile-open");

            toggle.setAttribute(
                "aria-expanded",
                String(opened)
            );

        } else {

            document.body.classList.toggle(
                "sidebar-collapsed"
            );

            const expanded =
                !document.body.classList.contains(
                    "sidebar-collapsed"
                );

            toggle.setAttribute(
                "aria-expanded",
                String(expanded)
            );

            localStorage.setItem(
                "sidebar-collapsed",
                String(!expanded)
            );
        }

    });


    close.addEventListener("click", closeMobileSidebar);

    overlay.addEventListener("click", closeMobileSidebar);


    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            sidebar.classList.contains("mobile-open")
        ) {
            closeMobileSidebar();
        }

    });


    function closeMobileSidebar() {

        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("show");

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    /*
     * Restore desktop collapsed state.
     */

    if (
        localStorage.getItem("sidebar-collapsed") === "true" &&
        !isMobile()
    ) {
        document.body.classList.add(
            "sidebar-collapsed"
        );

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    /*
     * Close mobile sidebar after clicking a navigation link.
     */

    document.querySelectorAll(".sidebar a").forEach(link => {

        link.addEventListener("click", () => {

            document.querySelectorAll(
                ".sidebar-link"
            ).forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            if (isMobile()) {
                closeMobileSidebar();
            }

        });

    });


    /*
     * Handle resize.
     */

    window.addEventListener("resize", () => {

        if (!isMobile()) {

            sidebar.classList.remove("mobile-open");
            overlay.classList.remove("show");

            const collapsed =
                localStorage.getItem(
                    "sidebar-collapsed"
                ) === "true";

            document.body.classList.toggle(
                "sidebar-collapsed",
                collapsed
            );

        }

    });

}


/* ================================================================
   ACTIVE PAGE
================================================================ */
$(document).ready(function () {
    var currentPath = window.location.pathname.replace(/\/+$/, '');
    $('.sidebar-link[href]').each(function () {
        var $link = $(this);
        var href = $link.attr('href');

        if (!href || href === '#') {
            return;
        }

        // Create URL so Django paths can be compared safely
        var linkPath = new URL(href, window.location.origin).pathname.replace(/\/+$/, '');

        // Match current page
        if (linkPath === currentPath) {

            $link.addClass('active');

            var $collapse = $link.closest('.collapse');

            if ($collapse.length) {

                $collapse.addClass('show');

                var collapseId = $collapse.attr('id');
                var $parentButton =
                    $('[data-bs-target="#' + collapseId + '"]');

                $parentButton.addClass('active');

                $parentButton.attr('aria-expanded', 'true');

                $parentButton
                    .find('.sidebar-toggle-arrow')
                    .addClass('rotate');
            }
        }
    });
});


/* ================================================================
   BOOTSTRAP TOOLTIPS
================================================================ */

function initTooltips() {

    document
        .querySelectorAll(
            '[data-bs-toggle="tooltip"], [data-bs-toggle-tooltip="tooltip"]'
        )
        .forEach(element => {

            new bootstrap.Tooltip(element, {
                trigger: "hover focus",
                boundary: "window"
            });

        });

}

/* ================================================================
   TOAST
================================================================ */

function showToast(message, type = 'success', title = '', delay = 2000) {

    const container = document.getElementById('toastContainer');

    const titles = {
        success: 'Success',
        danger: 'Error',
        warning: 'Warning',
        info: 'Information',
        primary: 'Notice',
        secondary: 'Message'
    };

    title = title || titles[type] || 'Notification';

    // Create toast
    const toastElement = document.createElement('div');

    toastElement.className =
        `toast dynamic-toast text-bg-${type} border-0 mb-2`;

    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
        <div class="d-flex">

            <div class="toast-body">
                <strong>${title}</strong>
                <div class="mt-1">${message}</div>
            </div>

            <button type="button"
                    class="btn-close btn-close-black me-2 m-auto"
                    data-bs-dismiss="toast"
                    aria-label="Close">
            </button>

        </div>

        <div class="toast-timer"></div>
    `;

    container.appendChild(toastElement);

    // Bootstrap toast
    const toast = new bootstrap.Toast(toastElement, {
        delay: delay,
        autohide: true
    });

    // Start timer after toast appears
    toastElement.addEventListener('shown.bs.toast', () => {

        const timer = toastElement.querySelector('.toast-timer');

        timer.style.animationDuration = `${delay}ms`;

        // Force browser to recognize animation duration
        requestAnimationFrame(() => {
            timer.classList.add('running');
        });
    });

    // Remove from DOM after disappearing
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });

    // Show
    toast.show();
    }


/* ================================================================
   HELPERS
================================================================ */

function formatBytes(bytes) {

    if (!bytes) {
        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(1024, index)
            ).toFixed(2)
        ) +
        " " +
        units[index]
    );

}


function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value;

    return div.innerHTML;

}

 /*=======================================================
 TEXTAREA COUNTER
========================================================== */

function initTextareaCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(function (textarea) {
        const wrapper = textarea.closest('.textarea-counter-wrapper');
        if (!wrapper) {
            return;
        }
        const countElement = wrapper.querySelector('.textarea-count');
        const maxElement = wrapper.querySelector('.textarea-max');
        if (!countElement) {
            return;
        }
        // Get maxlength from textarea
        const maxLength = parseInt(textarea.getAttribute('maxlength'), 10);

        // Show maximum length
        if (maxElement) {
            maxElement.textContent = maxLength;
        }

        // Update counter
        function updateCounter() {
            countElement.textContent = textarea.value.length;
        }

        // Initial count
        updateCounter();

        // Update when typing
        textarea.addEventListener('input', updateCounter);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initTextareaCounters();
});

/*=======================================================
    MULTIPLE SELECT DROPDOWN
========================================================== */
function initMultiDropdown() {
    document.querySelectorAll("select[multiple]").forEach(function (element) {
        const placeholder = element.dataset.placeholder || "Select...";
        const search = element.dataset.search !== "false";
        new Choices(element, {
            removeItemButton: true,
            searchEnabled: search,
            placeholder: true,
            placeholderValue: placeholder,
            searchPlaceholderValue: "Search...",
            itemSelectText: "",
            shouldSort: false,
            allowHTML: false
        });
    });
}

/*=======================================================
    Open calendar
========================================================== */
document.querySelectorAll('input[type="date"]').forEach(input => {
    input.addEventListener('click', function () {
        if (typeof this.showPicker === 'function') {
            this.showPicker();
        }
    });
});
document.querySelectorAll('input[type="datetime-local"]').forEach(input => {
    input.addEventListener('click', function () {
        if (typeof this.showPicker === 'function') {
            this.showPicker();
        }
    });
});

/*=======================================================
    Print
========================================================== */
function printTable(areaID) 
    {
        var printContent = document.getElementById(areaID).innerHTML;
        var originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
    }

/*=======================================================
    App Descriptive Toggle
========================================================== */
function initSwitchDesciptionView() {
    const viewModeSwitch = document.getElementById('viewModeSwitch');
    const applicationContainer = document.getElementById('applicationContainer');
    if (!viewModeSwitch || !applicationContainer) {
        return;
    }
    viewModeSwitch.addEventListener('change', function () {
        if (this.checked) {
            applicationContainer.classList.remove('short-view');
            applicationContainer.classList.add('description-view');
        } else {
            applicationContainer.classList.remove('description-view');
            applicationContainer.classList.add('short-view');
        }
    });
}
    document.addEventListener("DOMContentLoaded", function () {
        initSwitchDesciptionView();
    });

/* ================================================================
   CHARTS
================================================================ */

window.dashboardCharts = {};


function getChartColors() {

    const dark =
        document.documentElement.getAttribute(
            "data-theme"
        ) === "dark";

    return {
        text: dark ? "#94a3b8" : "#6b7280",
        grid: dark
            ? "rgba(148,163,184,.10)"
            : "rgba(100,116,139,.12)",
        primary: "#6366f1",
        green: "#10b981",
        orange: "#f59e0b",
        pink: "#ec4899",
        purple: "#8b5cf6",
        surface: dark ? "#111827" : "#ffffff"
    };
}


function initCharts() {

    const colors = getChartColors();

    /* -- Line Chart --*/
    const collectionContext =
        document.getElementById(
            "collectionChart"
        );

    dashboardCharts.collection =
        new Chart(collectionContext, {
            type: "line",
            data: {
                labels: [
                    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
                ],

                datasets: [{
                    label: "Collection",
                    data: [
                        42000,48000,45000,57000,61000,59000,68000,72000,69500,76000,81000,84560
                    ],

                    borderColor: colors.primary,
                    backgroundColor: "rgba(99,102,241,.10)",

                    borderWidth: 2,
                    fill: true,
                    tension: .4,

                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: colors.primary,
                    pointBorderColor: "#FFFFFF"
                }]
            },

            options: chartOptions(colors, true)

        });


    /*
     * Bar Chart
     */
    const surveyContext =
        document.getElementById(
            "surveyChart"
        );
    dashboardCharts.survey =
        new Chart(surveyContext, {
            type: "bar",
            data: {
                labels: [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun"
                ],
                datasets: [{
                    label: "Survey",
                    data: [
                        120,
                        190,
                        155,
                        220,
                        275,
                        310,
                        245
                    ],
                    backgroundColor: colors.primary,
                    borderRadius: 6
                }]
            },
            options: chartOptions(colors)
        });


    /*
     * User Growth
     */

    const userContext =
        document.getElementById(
            "consumerGrowthChart"
        );

    dashboardCharts.users =
        new Chart(userContext, {
            type: "line",
            data: {
                labels: [
                    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"
                ],
                datasets: [{
                    label: "New Consumers",
                    data: [
                        1200,1800,1600,2400,2900,3200,3800,4100,4200
                    ],
                    borderColor: colors.green,
                    backgroundColor: "rgba(16,185,129,.10)",

                    borderWidth: 3,
                    fill: true,
                    tension: .4,
                    pointRadius: 3
                }]
            },
            options: chartOptions(colors, true)
        });


    /*
     * Mode Doughnut
     */
    const modeContext =
        document.getElementById(
            "modeChart"
        );
    dashboardCharts.traffic =
        new Chart(modeContext, {
            type: "doughnut",
            data: {
                labels: [
                    "Cash",
                    "UPI",
                    "Cheque",
                    "Demand Draft"
                ],

                datasets: [{
                    data: [
                        42,
                        27,
                        18,
                        13
                    ],

                    backgroundColor: [
                        colors.primary,
                        colors.green,
                        colors.orange,
                        colors.pink
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: colors.text,
                            usePointStyle: true,
                            padding: 18
                        }
                    }
                }
            }
        });
}


function chartOptions(colors, fill = false) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: "index"
        },

        plugins: {

            legend: {
                display: true
            },

            tooltip: {
                backgroundColor:
                    colors.surface,

                titleColor:
                    colors.text,

                bodyColor:
                    colors.text,

                borderColor:
                    colors.grid,

                borderWidth: 1
            }

        },

        scales: {

            x: {
                grid: {
                    display: false
                },

                ticks: {
                    color: colors.text
                }
            },

            y: {

                beginAtZero: true,

                grid: {
                    color: colors.grid
                },

                ticks: {
                    color: colors.text
                }

            }

        }
    };
}


function updateChartTheme() {

    const colors = getChartColors();

    Object.entries(
        dashboardCharts
    ).forEach(([name, chart]) => {

        if (!chart) {
            return;
        }

        if (
            chart.options.scales &&
            chart.options.scales.x
        ) {
            chart.options.scales.x.ticks.color =
                colors.text;

            chart.options.scales.x.grid.color =
                colors.grid;
        }

        if (
            chart.options.scales &&
            chart.options.scales.y
        ) {
            chart.options.scales.y.ticks.color =
                colors.text;

            chart.options.scales.y.grid.color =
                colors.grid;
        }

        if (chart.options.plugins.legend) {

            chart.options.plugins.legend.labels.color =
                colors.text;

        }

        if (chart.options.plugins.tooltip) {

            chart.options.plugins.tooltip.backgroundColor =
                colors.surface;

            chart.options.plugins.tooltip.titleColor =
                colors.text;

            chart.options.plugins.tooltip.bodyColor =
                colors.text;

            chart.options.plugins.tooltip.borderColor =
                colors.grid;

        }

        chart.update();

    });
}