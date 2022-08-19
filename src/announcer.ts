if (!customElements.get('route-announcer')) {
    const attrs = {
        'aria-live': 'assertive',
        'aria-atomic': 'true',
        'style': 'position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px'
    }
    customElements.define('route-announcer', class RouteAnnouncer extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            for (const [key, value] of Object.entries(attrs)) {
                this.setAttribute(key, value);
            }
        }
    })
}
