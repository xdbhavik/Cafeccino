package com.cafe.mark1.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Frontend isse use karke connect karega: http://localhost:8080/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Frontend origins handle karne ke liye
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Server se Client ko message bhejne ke liye prefix (e.g. /topic/orders)
        registry.enableSimpleBroker("/topic");
        
        // Client se Server ko message bhejne ke liye prefix (e.g. /app/order-update)
        registry.setApplicationDestinationPrefixes("/app");
    }
}
