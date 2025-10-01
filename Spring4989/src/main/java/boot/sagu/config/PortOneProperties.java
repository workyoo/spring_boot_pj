package boot.sagu.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "portone")
public class PortOneProperties {
    private String apiKey;       // portone.api-key
    private String apiSecret;    // portone.api-secret
    private String channelKey;
    private String webhookSecret;
    private Inicis inicis = new Inicis();

    public static class Inicis {
        private String merchantId;
        private String licenseKey;
        // getters/setters
        public String getMerchantId() { return merchantId; }
        public void setMerchantId(String merchantId) { this.merchantId = merchantId; }
        public String getLicenseKey() { return licenseKey; }
        public void setLicenseKey(String licenseKey) { this.licenseKey = licenseKey; }
    }

    // getters/setters
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getApiSecret() { return apiSecret; }
    public void setApiSecret(String apiSecret) { this.apiSecret = apiSecret; }
    public String getChannelKey() { return channelKey; }
    public void setChannelKey(String channelKey) { this.channelKey = channelKey; }
    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }
    public Inicis getInicis() { return inicis; }
    public void setInicis(Inicis inicis) { this.inicis = inicis; }
}
