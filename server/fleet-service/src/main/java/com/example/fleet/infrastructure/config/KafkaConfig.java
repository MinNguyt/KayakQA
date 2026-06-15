package com.example.fleet.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;

@Configuration
@EnableKafka
public class KafkaConfig {

    public static final String TICKET_EVENTS_TOPIC = "ticket.events";
}
