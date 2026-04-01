(function initializeSiteShell() {
    function renderSiteShell() {
        const body = document.body;
        if (!body) return;

        const rootPrefix = body.dataset.siteRootPrefix || '.';
        const activePage = body.dataset.siteActivePage || '';

        function createMenuItemMarkup(pageKey, href, label, iconPath = '') {
            const activeClass = activePage === pageKey ? ' active' : '';
            const iconMarkup = iconPath ? `<img src="${iconPath}" alt="${label}">` : '';
            return `<a href="${href}" class="menu-item${activeClass}">${iconMarkup}<span>${label}</span></a>`;
        }

        function createSidebarMarkup() {
            return `
        <aside class="sidebar">
            <button class="main-sidebar-close-inner" type="button" title="メニューを閉じる">×</button>
            <a href="${rootPrefix}/index.html" class="logo">
                <span>Maneater Wiki</span>
            </a>
            <nav class="menu">
                ${createMenuItemMarkup('equipment', `${rootPrefix}/maneater.html`, '装備', `${rootPrefix}/images/進化1.png`)}
                ${createMenuItemMarkup('map', `${rootPrefix}/map/map.html`, 'マップ', `${rootPrefix}/images/map1.png`)}
                ${createMenuItemMarkup('hunters', `${rootPrefix}/hunters/hunters.html`, 'ハンター', `${rootPrefix}/images/map/悪名ランク1.png`)}
                ${createMenuItemMarkup('history', `${rootPrefix}/history/history.html`, '更新履歴')}
            </nav>
        </aside>
        <div id="sidebar-backdrop" class="sidebar-backdrop hidden"></div>
        `;
        }

        function createFooterMarkup() {
            return `
        <footer class="site-footer">
            <p>当サイトは個人が運営する非公式ファンサイトであり、使用されているテキスト・画像等の著作権は Tripwire Interactive および関連する権利者に帰属します。</p>
            <p>掲載内容に問題がある場合は、お手数ですがご連絡ください。迅速に対応いたします。</p>
        </footer>
        `;
        }

        document.querySelectorAll('[data-site-shell="sidebar"]').forEach((placeholder) => {
            placeholder.outerHTML = createSidebarMarkup();
        });

        document.querySelectorAll('[data-site-shell="footer"]').forEach((placeholder) => {
            placeholder.outerHTML = createFooterMarkup();
        });
    }

    renderSiteShell();
    document.addEventListener('DOMContentLoaded', renderSiteShell, { once: true });
})();
