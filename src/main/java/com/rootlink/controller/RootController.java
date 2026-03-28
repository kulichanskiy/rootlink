package com.rootlink.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "service", "RootLink API",
                "events", "/api/events",
                "services", "/api/services"
        );
    }
}
