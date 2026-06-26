package org.example.dashboardj.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Registering analytics cache (30 mins TTL)
        cacheManager.registerCustomCache("analyticsCache", 
            Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500)
                .build());

        // Registering llmResponses cache (30 mins TTL)
        cacheManager.registerCustomCache("llmResponses", 
            Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500)
                .build());

        // Registering userDetailsCache for JWT (5 mins TTL)
        cacheManager.registerCustomCache("userDetailsCache", 
            Caffeine.newBuilder()
                .expireAfterWrite(100, TimeUnit.MINUTES)
                .maximumSize(1000)
                .build());

        return cacheManager;
    }
}
