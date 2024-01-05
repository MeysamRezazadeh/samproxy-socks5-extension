document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleProxy');
    const statusDiv = document.getElementById('status');
    const proxyUrlInput = document.getElementById('proxyUrl');
    const proxyPortInput = document.getElementById('proxyPort');

    chrome.storage.local.get(['proxyEnabled', 'proxyUrl', 'proxyPort'], (data) => {
        const isProxyEnabled = data.proxyEnabled ?? false;
        toggleButton.checked = isProxyEnabled;
        updateStatusText(isProxyEnabled);
        proxyUrlInput.value = data.proxyUrl || '127.0.0.1';
        proxyPortInput.value = data.proxyPort || '10808';
    });

    toggleButton.addEventListener('click', () => {
        chrome.storage.local.get(['proxyEnabled', 'proxyUrl', 'proxyPort'], (data) => {
            const newProxyState = !data.proxyEnabled;
            const proxyUrl = proxyUrlInput.value.trim();
            const proxyPort = parseInt(proxyPortInput.value, 10);

            const config = newProxyState && proxyUrl && proxyPort ? {
                mode: 'fixed_servers',
                rules: {
                    singleProxy: {
                        scheme: 'socks5',
                        host: proxyUrl,
                        port: proxyPort
                    },
                    bypassList: ['localhost']
                }
            } : {
                mode: 'system'
            };

            chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {});
            toggleButton.checked = newProxyState;
            updateStatusText(newProxyState);
            chrome.storage.local.set({
                proxyEnabled: newProxyState,
                proxyUrl: proxyUrl,
                proxyPort: proxyPort
            });
        });
    });

    function updateStatusText(enabled) {
        statusDiv.textContent = enabled ? 'Proxy Enabled' : 'Proxy Disabled';
    }
});
