package boot.sagu.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;

@Service
public class CoolSmsService {

    @Value("${coolsms.api-key}")
    private String apiKey;

    @Value("${coolsms.api-secret}")
    private String apiSecret;

    @Value("${coolsms.sender-phone}")
    private String senderPhone;

    private DefaultMessageService messageService;

    @PostConstruct
    public void init() {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
    }

    public void sendSms(String toPhoneNumber, String messageText) {
        Message message = new Message();
        message.setFrom(senderPhone);
        message.setTo(toPhoneNumber);
        message.setText(messageText);

        try {
            this.messageService.sendOne(new SingleMessageSendingRequest(message));
            System.out.println("CoolSMS 발송 성공!");
        } catch (Exception e) {
            System.err.println("CoolSMS 발송 실패: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}